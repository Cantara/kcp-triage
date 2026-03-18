# Security Assessment Report: www.skeidar.no

**Date:** 2026-03-18
**Assessor:** Automated triage (kcp-triage) + manual HTTP inspection
**Scope:** External assessment — HTTP headers, HTML source analysis, cookie behavior, exposed endpoints
**Overall Grade:** F

---

## Executive Summary

Skeidar.no, one of Norway's largest furniture e-commerce retailers (operating since 1912), has significant security header deficiencies and several concerning practices that expose customers to unnecessary risk. The site runs on Episerver Commerce behind Cloudflare, yet fails to implement basic HTTP security headers that are industry standard for e-commerce platforms handling payment and personal data.

**Key concern:** This is a site that processes financial transactions, stores customer addresses, and handles phone numbers. The absence of fundamental security headers is not acceptable for a platform at this scale.

---

## Verification Update

This report was manually revalidated on 2026-03-18 against live responses from:
- `https://www.skeidar.no/`
- `https://www.skeidar.no/checkout/`
- `https://www.skeidar.no/logg-inn/`
- `https://www.skeidar.no/find_v2/`
- `https://www.skeidar.no/episerver/`

Changes after manual verification:
- Confirmed: missing HSTS, missing CSP, missing `X-Content-Type-Options`, duplicate `cuid` `Set-Cookie` headers, exposed `/find_v2/`, admin-path disclosure via `/episerver/`, the canonical URL bug, and pre-consent `EPiServer_Commerce_AnonymousId`.
- Adjusted: duplicate `cuid` headers are a server-side defect and response-bloat issue, but a standards-based client stores a single `cuid` value. The earlier persistent "cookie bomb"/431 claim was not reproduced.
- Adjusted: Google Maps browser keys and Azure Application Insights instrumentation keys are expected to be client-visible in browser integrations. The risk is missing restriction or misuse, not mere visibility.
- Adjusted: absence of CSRF tokens in static HTML is not enough to conclude that CSRF protection is absent across the application.
- Removed: the earlier `/checkout/` `Content-Type: text/plain` finding no longer reproduces. On 2026-03-18 the page returned `text/html; charset=utf-8`.

---

## Critical Findings

### 1. No HTTP Strict Transport Security (HSTS)
**Severity:** CRITICAL
**Header:** `Strict-Transport-Security` — missing

Without HSTS, the site is vulnerable to:
- **SSL stripping attacks** — An attacker on the same network (e.g., public WiFi at a Skeidar store) can downgrade HTTPS to HTTP using tools like sslstrip
- **MITM attacks** — First-time visitors or those typing `skeidar.no` without `https://` can be intercepted
- **Cookie theft** — Session cookies may be transmitted over unencrypted connections

**Impact:** Customer sessions, cart contents, and personal data (addresses, phone numbers) could be intercepted during checkout. The site does redirect `http://www.skeidar.no/` to HTTPS with `301`, but without HSTS the first visit is still vulnerable.

**Recommendation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and submit to the HSTS preload list at hstspreload.org.

---

### 2. No Content Security Policy (CSP)
**Severity:** CRITICAL
**Header:** `Content-Security-Policy` — missing

Without CSP, the site has no defense against:
- **Cross-Site Scripting (XSS)** — Any XSS vulnerability can execute arbitrary JavaScript, including stealing session cookies, redirecting to phishing pages, or injecting fake payment forms
- **Data exfiltration** — Injected scripts can send customer data to attacker-controlled servers
- **Cryptojacking** — Injected scripts can mine cryptocurrency using customer browsers

**Impact:** Given the site already embeds multiple third-party scripts (Google Tag Manager, Google Maps, LipScore, Azure Application Insights), the attack surface for supply chain attacks through compromised third-party scripts is elevated. A CSP would limit damage even if a third party is compromised.

**Recommendation:** Implement a CSP that whitelists only required script sources. Start with report-only mode:
```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' *.googletagmanager.com *.google-analytics.com maps.googleapis.com *.lipscore.com *.applicationinsights.azure.com; report-uri /csp-report
```

---

## High Severity Findings

### 3. No Clickjacking Protection on Login and Checkout
**Severity:** HIGH
**Observation:** Neither `/checkout/` nor `/logg-inn/` returns `X-Frame-Options`, and there is no CSP header with `frame-ancestors`.

**Issues:**
- **UI redressing / clickjacking** — Sensitive pages can potentially be embedded in a hostile iframe and overlaid with deceptive controls
- **Higher impact on payment flows** — Login and checkout are precisely the pages where framing protections matter most
- **No fallback defense** — There is neither legacy `X-Frame-Options` nor modern `frame-ancestors`

**Impact:** A successful clickjacking setup can trick users into submitting login or checkout actions inside an attacker-controlled page.

**Recommendation:** Add `Content-Security-Policy: frame-ancestors 'self'` (or `'none'` where appropriate). If CSP rollout will take time, add `X-Frame-Options: SAMEORIGIN` as an interim control.

---

## Medium Severity Findings

### 4. Duplicate `cuid` Set-Cookie Headers
**Severity:** MEDIUM
**Observation:** The homepage sets `cuid=nb-NO` thirteen (13) times in a single response. `/checkout/` and `/logg-inn/` each set it three times.

**Issues:**
- **Response bloat** — Duplicate `Set-Cookie` headers add unnecessary bytes to every response
- **Indicates server-side defect** — Multiple middleware layers or templates appear to set the same cookie repeatedly
- **Inconsistent intermediary behavior** — Duplicate cookie-setting is unnecessary complexity around caches, debuggers, and client implementations

**Impact:** This is a real quality and hygiene issue, but not a reproduced persistent cookie-bomb condition. A standards-based client stored one `cuid` cookie and sent one `cuid` value back on the next request.

**Recommendation:** Audit the cookie-setting middleware stack. The `cuid` cookie should be set exactly once per response, with explicit `Path`, `Secure`, and `SameSite` attributes.

---

### 5. Client-Exposed Third-Party Keys and Telemetry Identifiers
**Severity:** MEDIUM
**Observation:** The following values are embedded in client-side JavaScript or HTML on every page:

| Key | Variable | Value (truncated) |
|-----|----------|-------------------|
| Google Maps API | `GOOGLE_API_KEY` | `AIzaSyDfk0A3rvRwPAgwv5_...` |
| LipScore Reviews | `LIPSCORE_API_KEY` | `c6c8cb964e4eb352...` |
| Azure App Insights | `instrumentationKey` | (embedded in config) |
| Google Site Verification | meta tag | `KbAmzOmwPiMaR2lt-...` |

**Issues:**
- **Google Maps API key** — Browser keys are expected to be public, but must be tightly restricted by allowed referrers and enabled APIs
- **LipScore key** — Public client-side review keys should be checked for origin restrictions, abuse controls, and scope
- **Azure instrumentation key** — This is a telemetry identifier, not a secret by itself, but it still reveals implementation details
- **Google site verification** — This token is intended to be public and should not be treated as a credential

**Recommendation:**
1. Restrict the Google Maps API key to `www.skeidar.no` referrer only (in Google Cloud Console)
2. Verify LipScore key has domain restrictions
3. Treat Application Insights and Search Console values as public identifiers, not leaked secrets
4. Remove any wording in downstream reports that implies all client-visible keys are equivalent to exposed credentials

---

### 6. CSRF Posture Requires Authenticated Verification
**Severity:** MEDIUM
**Observation:** No anti-CSRF tokens were visible in the anonymous HTML returned for `/`, `/checkout/`, or `/logg-inn/`.

**Issues:**
- **Static HTML is insufficient evidence** — Tokens may be injected dynamically, and anonymous pages do not prove how authenticated POST endpoints behave
- **Observed cookie posture is not strongly SameSite-hardened** — Publicly visible cookies such as `EPiServer_Commerce_AnonymousId`, `EPiStateMarker`, and `cuid` do not carry an explicit `SameSite` attribute, while `ARRAffinitySameSite` is explicitly `SameSite=None`
- **Sensitive flows exist** — Cart, address, and checkout actions warrant explicit CSRF verification in a logged-in browser session

**Note:** This remains an open verification item, not a demonstrated exploit condition.

**Recommendation:** Verify CSRF protection on all state-changing endpoints in an authenticated browser session. Ensure actual auth/session cookies use `SameSite=Lax` or `SameSite=Strict`, and enforce anti-forgery tokens or an equivalent verified control on POST/PUT/PATCH/DELETE operations.

---

### 7. Missing X-Content-Type-Options
**Severity:** MEDIUM
**Header:** `X-Content-Type-Options` — missing

Without this header set to `nosniff`, browsers may MIME-sniff responses and interpret uploaded content as executable. For an e-commerce site that may accept user uploads (profile images, customer service attachments), this increases XSS risk.

**Recommendation:** Add `X-Content-Type-Options: nosniff` to all responses.

---

### 8. Infrastructure Information Leakage
**Severity:** MEDIUM
**Observation:** Multiple infrastructure details are exposed:

| Detail | Source |
|--------|--------|
| **Episerver CMS/Commerce admin path** | `robots.txt` disallows `/episerver/`; a live request to `/episerver/` redirects to `/Util/Login?ReturnUrl=%2Fepiserver%2F` |
| **Azure App Service** | `ARRAffinity` and `ARRAffinitySameSite` cookies |
| **Application Insights** | `request-context: appId=...` header and client telemetry snippet |
| **Cloudflare CDN** | Response headers |
| **Episerver Find** | `/find_v2/` path exposed (returns 401) |

**Impact:** None of this is catastrophic alone, but it reduces uncertainty for attackers enumerating admin surfaces and vendor-specific misconfigurations.

**Recommendation:**
- Block `/find_v2/` at the CDN/WAF level (currently returns 401, but should return 404)
- Review whether `/episerver/` needs to be publicly reachable at all; if not, block or IP-restrict it before the login redirect
- Reduce low-value infrastructure disclosure where practical (`request-context`, platform-specific cookies, public admin path hints)

---

### 9. Anonymous Tracking Without Consent
**Severity:** MEDIUM
**Observation:** The cookie `EPiServer_Commerce_AnonymousId` is set with a UUID value on first visit, before any user consent interaction.

**Issues:**
- **GDPR compliance** — Setting a unique tracking identifier before consent may violate GDPR Art. 6 (lawful basis) and the Norwegian Electronic Communications Act (ekomloven) § 2-7b
- **Cookie consent timing** — If a cookie banner exists, this cookie is set before the banner can be interacted with

**Recommendation:** Defer setting `EPiServer_Commerce_AnonymousId` until the user has provided consent, or reclassify it as a "strictly necessary" cookie with proper legal justification.

---

## Low Severity Findings

### 10. Episerver Find API Exposed
**Severity:** LOW
**Path:** `/find_v2/`
**Response:** 401 Unauthorized

The Episerver Find (search) API endpoint is accessible but requires authentication. While it correctly returns 401, its existence reveals:
- The search infrastructure in use
- A potential target for authentication bypass attempts

**Recommendation:** Return 404 instead of 401 for this endpoint, or block at CDN level.

---

## Informational Findings

### 11. Missing Additional Security Headers
**Severity:** INFO

The following headers are absent but recommended:

| Header | Purpose |
|--------|---------|
| `Referrer-Policy` | Controls referrer leakage to third parties |
| `Permissions-Policy` | Restricts browser features (camera, microphone, geolocation) |
| `Cross-Origin-Resource-Policy` | Limits cross-origin reuse of site resources where compatible |
| `X-XSS-Protection` | Legacy XSS filter (superseded by CSP) |

---

## Additional Observations

### Canonical URL Bug
The meta canonical tag on pages contains a double protocol:
```html
<link rel="canonical" href="https://https://www.skeidar.no/" />
```
This `https://https://` prefix is a bug that may affect SEO and any tools that parse canonical URLs.

### Phone-Based Authentication
Login uses phone number as the primary identifier (dynamically loaded via JavaScript). Without browser-based testing we cannot assess:
- Rate limiting on phone number submission
- SMS verification token entropy
- Account enumeration via phone number lookup

---

## Remediation Priority

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | Add HSTS header | Low — single header configuration |
| 2 | Add CSP header with `frame-ancestors` (report-only first) | Medium — requires audit of script and framing sources |
| 3 | Add clickjacking protection on `/checkout/` and `/logg-inn/` | Low — header policy change |
| 4 | Add `X-Content-Type-Options: nosniff` | Low — single header |
| 5 | Fix duplicate `cuid` cookie setting and add `SameSite` where appropriate | Low — middleware configuration fix |
| 6 | Verify CSRF protection in authenticated flows and harden auth/session cookies | Medium — requires browser/code review |
| 7 | Review client-side key restrictions (Google Maps, LipScore) | Low — vendor console / configuration review |
| 8 | Reduce admin/search surface disclosure (`/episerver/`, `/find_v2/`) | Medium — app + CDN/WAF changes |
| 9 | Review consent gating for `EPiServer_Commerce_AnonymousId` | Medium — legal + technical review |
| 10 | Fix canonical URL bug | Low — template fix |

---

## Methodology

This assessment was conducted using:
- HTTP header analysis via programmatic requests with standard User-Agent
- HTML source code inspection of served pages
- robots.txt and sitemap analysis
- Cookie analysis across multiple page requests, including client-side cookie-jar verification
- Endpoint probing of common Episerver paths

**Limitations:**
- No browser-based testing (JavaScript-rendered content not fully inspected)
- No authenticated testing (no login credentials used)
- No active exploitation attempted
- SPA checkout flow could not be fully inspected without Playwright/Selenium

---

*Report generated by kcp-triage security assessment pipeline. For questions, contact the assessor.*
