---
name: security-triage
description: "Builder-level security assessment methodology for web services. Use when performing security header audits, identifying exposed API keys, analyzing cookie behavior, checking CSRF protection, or compiling security reports for site owners."
---

# Security Triage

Methodology for assessing web service security from an external perspective, without authentication or active exploitation.

## Assessment Layers

### Layer 1: HTTP Security Headers (Automated)
Already implemented in `src/analyzers/security-headers.ts`. Checks for:

| Header | Grade if missing | Why it matters |
|--------|-----------------|----------------|
| `Strict-Transport-Security` | fail | MITM/downgrade attacks |
| `Content-Security-Policy` | fail | XSS mitigation |
| `X-Content-Type-Options` | fail | MIME sniffing |
| `X-Frame-Options` | info | Clickjacking |
| `Referrer-Policy` | info | Data leakage |
| `Permissions-Policy` | info | Feature control |
| `X-XSS-Protection` | info | Legacy XSS filter |

### Layer 2: HTML Source Analysis (Manual/Semi-automated)
Inspect page source for:

1. **Exposed API keys** — Search for patterns:
   - `var.*API_KEY\s*=\s*["']`
   - `instrumentationKey`
   - `data-api-key`
   - Common prefixes: `AIza` (Google), `pk_` (Stripe public), `sb-` (Supabase)

2. **CSRF tokens** — Look for:
   - `<input type="hidden" name="__RequestVerificationToken"` (ASP.NET)
   - `<meta name="csrf-token"` (Rails-style)
   - `csrfmiddlewaretoken` (Django)
   - Absence doesn't mean no protection (may be JS-injected or using SameSite cookies)

3. **Infrastructure leakage** — Note:
   - CMS/framework identifiers in HTML comments, meta tags, cookie names
   - Error page patterns revealing stack traces
   - Admin paths in robots.txt

### Layer 3: Cookie Analysis
For each cookie set by the server:

| Check | What to look for |
|-------|-----------------|
| Duplication | Same cookie set multiple times per response (middleware bug) |
| Secure flag | Must be set for any cookie on HTTPS sites |
| HttpOnly flag | Must be set for session cookies |
| SameSite | Should be Strict or Lax for session cookies |
| Consent timing | Tracking cookies set before consent = GDPR issue |
| Name leakage | Cookie names revealing platform (e.g., `EPiServer_Commerce_*`) |

### Layer 4: Endpoint Probing
Check common paths for the detected platform:

**Episerver/Optimizely:**
- `/episerver/` — Admin panel
- `/find_v2/` — Episerver Find API
- `/util/` — Utility endpoints

**General:**
- `/api/` — API root
- `/graphql` — GraphQL endpoint
- `/swagger/`, `/api-docs/` — API documentation
- `/.env`, `/.git/` — Sensitive file exposure
- `/wp-admin/`, `/wp-json/` — WordPress (if applicable)

Correct behavior: 404 Not Found. Red flags: 401/403 (confirms existence), 200 (exposed).

### Layer 5: TLS Analysis
- Certificate validity and expiration
- Protocol version (TLS 1.2 minimum, 1.3 preferred)
- Cipher suite strength
- Certificate chain completeness

## Severity Classification

| Severity | Criteria | Examples |
|----------|----------|---------|
| **CRITICAL** | Direct path to data theft or account compromise on e-commerce/auth sites | Missing HSTS on payment site, missing CSP on site with user input |
| **HIGH** | Significant risk requiring active exploitation | Exposed API keys, missing CSRF, cookie bombs |
| **MEDIUM** | Defense-in-depth gap, information disclosure | Missing X-Content-Type-Options, infrastructure leakage, consent issues |
| **LOW** | Minor issue, limited exploitability | Endpoint existence disclosure (with proper 401) |
| **INFO** | Best practice not followed, no direct risk | Missing optional headers, content-type misconfiguration |

**Context matters:** Missing HSTS is CRITICAL for e-commerce (handles payments) but MEDIUM for a static blog.

## Report Structure

When compiling a security report for site owners:

```markdown
# Security Assessment Report: <domain>

## Executive Summary
- One paragraph: what was tested, overall grade, key concern

## Critical Findings
- Each finding: severity, header/observation, what it enables, impact, recommendation

## High Severity Findings
## Medium Severity Findings
## Low Severity Findings

## Remediation Priority
- Ordered table: priority, finding, estimated effort

## Methodology
- Tools used, limitations, what was NOT tested
```

### Writing for Non-Technical Recipients
- Lead with business impact ("customer data could be intercepted") not technical detail
- Provide specific remediation steps, not just "fix this"
- Include effort estimates (Low/Medium/High)
- Note what the report does NOT cover (no pentest, no auth testing, no exploitation)

## Key Files

| File | Purpose |
|------|---------|
| `src/analyzers/security-headers.ts` | Automated header checker (Layer 1) |
| `src/schemas/triage.ts` | SecurityAuditSchema definition |
| `sites/*/security-report.md` | Per-site security reports |
| `sites/*/triage-report.json` | Raw security audit data in `.security` field |

## Platform-Specific Patterns

### Episerver / Optimizely Commerce
- Cookie: `EPiServer_Commerce_AnonymousId` — tracking UUID
- Cookie: `cuid` — culture/locale identifier
- Admin: `/episerver/` (blocked in robots.txt)
- Search: `/find_v2/` (Episerver Find)
- Common issue: Multiple middleware layers duplicating cookies

### Cloudflare-Fronted Sites
- Headers `cf-ray`, `cf-cache-status` reveal CDN
- May mask origin server headers
- Check if Cloudflare WAF rules are active (try common XSS payloads in URL params — they should be blocked)

## Extending the Pipeline

To automate more of this assessment, follow the `add-analyzer` skill pattern:

1. **Cookie analyzer** — Parse `Set-Cookie` headers, check flags, detect duplication
2. **Source code scanner** — Regex for API keys, CSRF tokens, framework identifiers in HTML
3. **Endpoint prober** — Check platform-specific paths, classify responses

Each would produce data for `TriageReportSchema.security` and feed into the security report generator.

## Ethical Guidelines

- **Never attempt active exploitation** — This is passive reconnaissance only
- **Respect robots.txt** — Even for security assessment
- **Don't access authenticated endpoints** without explicit authorization
- **Report findings responsibly** — Give the site owner time to remediate before any public disclosure
- **Don't store or reuse discovered credentials/keys** — Document their existence, not their values (truncate in reports)
