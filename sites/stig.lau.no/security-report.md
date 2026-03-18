# Security Assessment Report: stig.lau.no

**Date:** 2026-03-18
**Assessor:** Automated triage (kcp-triage) + manual HTTP inspection
**Scope:** External assessment — transport security, HTTP headers, HTML source analysis, robots/sitemap behavior
**Overall Grade:** D

---

## Executive Summary

`stig.lau.no` is a low-activity personal blog hosted on Blogger behind Cloudflare. The direct risk is lower than on an e-commerce property because no login flow, checkout flow, or anonymous session cookies were observed on the homepage. The main weakness is transport posture: the site is still fully available over plain HTTP, does not redirect visitors to HTTPS, and does not send HSTS.

The automated triage grade of `D` is directionally correct for missing headers, but it understates the practical transport issue. A visitor can still load the full site over `http://stig.lau.no/` and receive a `200 OK`.

---

## High Severity Findings

### 1. Plain HTTP Is Still Served
**Severity:** HIGH
**Observation:** `http://stig.lau.no/` responds with `200 OK` and serves the blog content directly instead of redirecting to HTTPS.

**Issues:**
- **Content integrity risk** — Any on-path attacker can alter blog content for visitors using plain HTTP
- **Downgrade risk** — Users following old bookmarks, typed URLs, or legacy links can remain on HTTP
- **Transport inconsistency** — Both HTTP and HTTPS are live, which weakens the effective security posture even if HTTPS works

**Impact:** For a personal blog this is primarily an integrity problem rather than an account-takeover problem, but it still allows traffic interception and content injection.

**Recommendation:** Force `http://stig.lau.no/*` to `https://stig.lau.no/*` with a permanent redirect at the edge or origin.

---

### 2. No HTTP Strict Transport Security (HSTS)
**Severity:** HIGH
**Header:** `Strict-Transport-Security` — missing

Without HSTS, browsers are not told to pin the site to HTTPS after the first secure visit.

**Impact:** Because plain HTTP is still served, the lack of HSTS materially increases downgrade exposure.

**Recommendation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` after HTTP is fully redirected to HTTPS.

---

## Medium Severity Findings

### 3. No Content Security Policy (CSP)
**Severity:** MEDIUM
**Header:** `Content-Security-Policy` — missing

The blog loads Google/Blogger scripts, iframes, and AdSense-related JavaScript. Without CSP there is no policy boundary limiting script execution or framing sources.

**Impact:** The site is read-only and low sensitivity, so the consequence is lower than on a transactional property, but a CSP would still reduce XSS and third-party script abuse impact.

**Recommendation:** Start with a `Content-Security-Policy-Report-Only` policy tailored to Blogger, Google APIs, and any embedded resources actually in use.

---

### 4. HTTP/HTTPS Canonical And Origin Drift
**Severity:** MEDIUM
**Observation:** The public HTML is inconsistent about the canonical origin:
- The visible canonical tag is HTTPS: `<link href="https://stig.lau.no/" rel='canonical' />`
- `og:url` still points to `http://stig.lau.no/`
- Multiple `itemprop="url"` post references use `http://stig.lau.no/...`
- Embedded Blogger data declares `httpsEnabled: false` and sets `url`, `canonicalUrl`, `homepageUrl`, `searchUrl`, and feed links to `http://stig.lau.no/...`
- `robots.txt` points to `Sitemap: http://stig.lau.no/sitemap.xml`

**Issues:**
- **Link generation drift** — Shared links and generated URLs may prefer HTTP
- **Indexing ambiguity** — Search engines and social previews receive conflicting origin signals
- **Operational confusion** — The site appears partially HTTPS-enabled at the edge but still modeled as HTTP in Blogger data

**Recommendation:** Normalize all site metadata, sitemap references, Open Graph URLs, and Blogger/custom-domain settings to HTTPS.

---

### 5. Missing `Referrer-Policy` And `Permissions-Policy` On HTML Responses
**Severity:** MEDIUM
**Observation:** The homepage response does not include `Referrer-Policy` or `Permissions-Policy`.

**Impact:** This is not critical for a simple blog, but these are still standard hardening headers and easy wins when fronted by an edge platform.

**Recommendation:** Add:
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Informational Findings

### 6. No Anonymous Cookies Observed On The Homepage
**Severity:** INFO

The homepage response did not set any cookies during testing. That reduces the immediate session-management risk compared with more complex sites.

---

### 7. Some Basic Hardening Headers Are Already Present
**Severity:** INFO

Observed positive signals on the homepage:
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- No visible anonymous session cookies

These do not compensate for the transport issues, but they are worth preserving.

---

## Additional Observations

### Blogger/Platform Constraints
Some remediation may need to happen in Blogger custom-domain HTTPS settings or at the Cloudflare edge rather than in application code. The presence of `httpsEnabled: false` in the page model suggests the platform configuration itself is not fully aligned with HTTPS.

### Third-Party Surface
The homepage includes Blogger/Google iframe integrations and AdSense-related JavaScript. This is expected for Blogger, but it reinforces the value of a tailored CSP.

---

## Remediation Priority

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | Redirect all HTTP traffic to HTTPS | Low-Medium — edge or platform configuration |
| 2 | Enable HSTS after redirect is in place | Low — single header |
| 3 | Normalize Blogger/custom-domain metadata to HTTPS | Medium — platform/domain settings |
| 4 | Add CSP in report-only mode | Medium — requires source inventory |
| 5 | Add `Referrer-Policy` and `Permissions-Policy` | Low — edge/header configuration |

---

## Methodology

This assessment was conducted using:
- Fresh `kcp-triage` pipeline execution for `stig.lau.no`
- Live transport checks over both HTTP and HTTPS
- Header inspection via `curl`
- HTML source inspection of the homepage
- `robots.txt` and sitemap inspection

**Limitations:**
- No authenticated testing was relevant for this site
- No comment submission testing was performed
- No active exploitation attempted

---

*Report generated by kcp-triage security assessment workflow with manual verification.*
