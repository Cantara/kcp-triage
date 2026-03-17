# OWASP Security Headers Reference

## Currently Checked (in security-headers.ts)

| Header | Status |
|--------|--------|
| Strict-Transport-Security | ✓ Implemented |
| Content-Security-Policy | ✓ Implemented |
| X-Content-Type-Options | ✓ Implemented |
| X-Frame-Options | ✓ Implemented |
| Referrer-Policy | ✓ Implemented |
| Permissions-Policy | ✓ Implemented |
| X-XSS-Protection | ✓ Implemented (legacy) |

## Not Yet Checked — Should Add

### Cross-Origin Headers
- `Cross-Origin-Opener-Policy` (COOP): Prevents cross-origin windows from interacting with the page. Recommended value: `same-origin`.
- `Cross-Origin-Embedder-Policy` (COEP): Controls cross-origin resource loading. Recommended: `require-corp`.
- `Cross-Origin-Resource-Policy` (CORP): Controls who can load the resource. Recommended: `same-origin` or `same-site`.

### Cache Control
- `Cache-Control`: Sensitive pages should include `no-store` or `no-cache, no-store, must-revalidate`.
- `Pragma: no-cache`: Legacy HTTP/1.0 companion to Cache-Control.

### Content Handling
- `X-Download-Options`: IE-specific, prevents direct file open. Value: `noopen`.
- `X-Permitted-Cross-Domain-Policies`: Controls Flash/PDF cross-domain access. Value: `none`.

## Adding a New Header Check

In `src/analyzers/security-headers.ts`, add to the `EXPECTED_HEADERS` array:

```typescript
{
  header: "cross-origin-opener-policy",
  required: false,
  expectedValue: "same-origin",
  description: "Prevents cross-origin window interaction",
},
```

The grading algorithm automatically handles new entries — `required: true` headers cause "fail" if missing, `required: false` headers are "info" only.

## CSP Directive Analysis

CSP is the most complex header. A basic presence check isn't enough. Consider adding a CSP parser that checks for:

- `default-src` directive exists
- No `unsafe-inline` in `script-src` (XSS risk)
- No `unsafe-eval` in `script-src`
- No wildcard `*` in source lists
- `frame-ancestors` set (replaces X-Frame-Options)

This is a good candidate for LLM-assisted analysis: send the raw CSP string to Haiku and ask it to identify weaknesses.
