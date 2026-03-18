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

## Critical Findings

### 1. No HTTP Strict Transport Security (HSTS)
**Severity:** CRITICAL
**Header:** `Strict-Transport-Security` — missing

Without HSTS, the site is vulnerable to:
- **SSL stripping attacks** — An attacker on the same network (e.g., public WiFi at a Skeidar store) can downgrade HTTPS to HTTP using tools like sslstrip
- **MITM attacks** — First-time visitors or those typing `skeidar.no` without `https://` can be intercepted
- **Cookie theft** — Session cookies may be transmitted over unencrypted connections

**Impact:** Customer sessions, cart contents, and personal data (addresses, phone numbers) could be intercepted during checkout.

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

### 3. Cookie Bomb — Duplicate `cuid` Cookie (×13)
**Severity:** HIGH
**Observation:** The server sets the cookie `cuid=nb-NO` thirteen (13) times in a single HTTP response.

**Issues:**
- **Performance degradation** — Every subsequent request from the browser sends 13 copies of the same cookie, bloating request headers unnecessarily
- **Potential DoS vector** — Accumulated cookies over multiple page loads could push request headers past server limits (typically 8KB), causing 431 Request Header Fields Too Large errors
- **Indicates server-side bug** — Multiple middleware layers or misconfigured cookie policies are each setting the same cookie independently

**Impact:** Degraded performance for all customers. Potential for customers to be locked out of the site if cookie accumulation exceeds header limits.

**Recommendation:** Audit the cookie-setting middleware stack. The `cuid` cookie should be set exactly once per response, with proper `Path`, `Secure`, and `SameSite` attributes.

---

### 4. Exposed API Keys in Page Source
**Severity:** HIGH
**Observation:** The following API keys are embedded in client-side JavaScript on every page:

| Key | Variable | Value (truncated) |
|-----|----------|-------------------|
| Google Maps API | `GOOGLE_API_KEY` | `AIzaSyDfk0A3rvRwPAgwv5_...` |
| LipScore Reviews | `LIPSCORE_API_KEY` | `c6c8cb964e4eb352...` |
| Azure App Insights | `instrumentationKey` | (embedded in config) |
| Google Site Verification | meta tag | `KbAmzOmwPiMaR2lt-...` |

**Issues:**
- **Google Maps API key** — If unrestricted, can be used by third parties to make API calls billed to Skeidar's account. Google Maps API abuse can result in significant unexpected costs.
- **LipScore API key** — Could be used to submit fake reviews or extract review data
- **Azure instrumentation key** — Reveals backend infrastructure details

**Recommendation:**
1. Restrict the Google Maps API key to `www.skeidar.no` referrer only (in Google Cloud Console)
2. Verify LipScore key has domain restrictions
3. Consider whether Azure instrumentation key needs to be client-visible (Application Insights has server-side alternatives)

---

### 5. No CSRF Protection Visible
**Severity:** HIGH
**Observation:** No anti-CSRF tokens were found in any inspected page source. The checkout flow, cart operations, and login forms show no evidence of CSRF mitigation.

**Issues:**
- **Cross-Site Request Forgery** — An attacker could craft a page that, when visited by a logged-in Skeidar customer, adds items to their cart, changes their shipping address, or modifies account settings
- **Episerver has built-in CSRF support** — This suggests it may not be enabled or is handled differently (e.g., SameSite cookies)

**Note:** CSRF tokens may be injected dynamically via JavaScript (the checkout is SPA-based), which our static HTML analysis cannot observe. This finding should be verified with browser-based testing.

**Recommendation:** Verify CSRF protection is active on all state-changing endpoints. If relying on SameSite cookies, ensure all session cookies have `SameSite=Strict` or `SameSite=Lax`.

---

## Medium Severity Findings

### 6. Missing X-Content-Type-Options
**Severity:** MEDIUM
**Header:** `X-Content-Type-Options` — missing

Without this header set to `nosniff`, browsers may MIME-sniff responses and interpret uploaded content as executable. For an e-commerce site that may accept user uploads (profile images, customer service attachments), this increases XSS risk.

**Recommendation:** Add `X-Content-Type-Options: nosniff` to all responses.

---

### 7. Infrastructure Information Leakage
**Severity:** MEDIUM
**Observation:** Multiple infrastructure details are exposed:

| Detail | Source |
|--------|--------|
| **Episerver CMS/Commerce** | robots.txt (`/episerver/`), cookie names (`EPiServer_Commerce_AnonymousId`) |
| **ASP.NET Core** | Response headers, error page patterns |
| **Cloudflare CDN** | Response headers |
| **Azure cloud hosting** | Application Insights instrumentation, Azure CDN references |
| **Episerver Find** | `/find_v2/` path exposed (returns 401) |

**Impact:** Attackers can target known CVEs for the specific Episerver version, ASP.NET framework, or look for common Episerver misconfigurations.

**Recommendation:**
- Remove or mask `Server` headers
- Block `/find_v2/` at the CDN/WAF level (currently returns 401, but should return 404)
- Remove `/episerver/` reference from robots.txt if the admin panel is not publicly accessible

---

### 8. Anonymous Tracking Without Consent
**Severity:** MEDIUM
**Observation:** The cookie `EPiServer_Commerce_AnonymousId` is set with a UUID value on first visit, before any user consent interaction.

**Issues:**
- **GDPR compliance** — Setting a unique tracking identifier before consent may violate GDPR Art. 6 (lawful basis) and the Norwegian Electronic Communications Act (ekomloven) § 2-7b
- **Cookie consent timing** — If a cookie banner exists, this cookie is set before the banner can be interacted with

**Recommendation:** Defer setting `EPiServer_Commerce_AnonymousId` until the user has provided consent, or reclassify it as a "strictly necessary" cookie with proper legal justification.

---

## Low Severity Findings

### 9. Episerver Find API Exposed
**Severity:** LOW
**Path:** `/find_v2/`
**Response:** 401 Unauthorized

The Episerver Find (search) API endpoint is accessible but requires authentication. While it correctly returns 401, its existence reveals:
- The search infrastructure in use
- A potential target for authentication bypass attempts

**Recommendation:** Return 404 instead of 401 for this endpoint, or block at CDN level.

---

### 10. Missing Security Headers (Informational)
**Severity:** INFO

The following headers are absent but recommended:

| Header | Purpose |
|--------|---------|
| `X-Frame-Options` | Clickjacking protection (use CSP `frame-ancestors` instead) |
| `Referrer-Policy` | Controls referrer leakage to third parties |
| `Permissions-Policy` | Restricts browser features (camera, microphone, geolocation) |
| `X-XSS-Protection` | Legacy XSS filter (superseded by CSP) |

---

### 11. Checkout Content-Type Misconfiguration
**Severity:** INFO
**Path:** `/checkout/`
**Observation:** The checkout page returns `Content-Type: text/plain` instead of `text/html`.

While browsers may still render HTML, this is a misconfiguration that could affect:
- Automated accessibility tools
- Screen readers
- Security scanners that respect Content-Type

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
| 2 | Add CSP header (report-only first) | Medium — requires audit of script sources |
| 3 | Fix cookie duplication (`cuid` ×13) | Low — middleware configuration fix |
| 4 | Add X-Content-Type-Options | Low — single header |
| 5 | Restrict Google Maps API key | Low — Google Cloud Console |
| 6 | Verify CSRF protection | Medium — requires code review |
| 7 | Remove infrastructure leakage | Medium — header/CDN configuration |
| 8 | Review cookie consent timing | Medium — legal + technical review |
| 9 | Fix canonical URL bug | Low — template fix |
| 10 | Block /find_v2/ properly | Low — CDN/WAF rule |

---

## Methodology

This assessment was conducted using:
- HTTP header analysis via programmatic requests with standard User-Agent
- HTML source code inspection of served pages
- robots.txt and sitemap analysis
- Cookie analysis across multiple page requests
- Endpoint probing of common Episerver paths

**Limitations:**
- No browser-based testing (JavaScript-rendered content not fully inspected)
- No authenticated testing (no login credentials used)
- No active exploitation attempted
- SPA checkout flow could not be fully inspected without Playwright/Selenium

---

*Report generated by kcp-triage security assessment pipeline. For questions, contact the assessor.*
