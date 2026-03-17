# Anti-Crawl Patterns

## Common Defences You'll Hit

### 1. Rate Limiting (HTTP 429)
**Symptom**: Responses with status 429, often with `Retry-After` header.
**Handling**: Add a crawl delay (see SKILL.md). Respect `Retry-After` if present:
```typescript
if (res.status === 429) {
  const retryAfter = parseInt(res.headers.get("retry-after") ?? "5", 10);
  await delay(retryAfter * 1000);
  // re-queue this URL
}
```

### 2. Cloudflare / Bot Protection
**Symptom**: 403 response, HTML contains "Checking your browser" or JS challenge.
**Detection**: Check for `cf-ray` header or `__cf_bm` cookie.
**Handling**: Cheerio can't execute JS challenges. Options:
- Accept the limitation and record it as a crawl error
- Switch to Playwright for this site (see `references/js-rendering.md`)
- Use a headless browser only for the initial challenge, then continue with fetch

### 3. CAPTCHAs
**Symptom**: Response body contains CAPTCHA markup (reCAPTCHA, hCaptcha).
**Handling**: Cannot solve programmatically. Record as a crawl error with category `"captcha"`. The report should note that the site uses CAPTCHA protection.

### 4. User-Agent Filtering
**Symptom**: 403 or different content based on User-Agent.
**Handling**: Set a reasonable User-Agent:
```typescript
const UA = "SiteTriageMeta/0.1 (+https://github.com/yourorg/site-triage-meta)";
const res = await fetch(url, {
  headers: { "User-Agent": UA },
  signal: controller.signal,
});
```

### 5. Honeypot Links
**Symptom**: Links with `display: none` or `visibility: hidden` in CSS.
**Impact**: Following them may trigger bot detection / IP ban.
**Handling**: Filter links by checking if the parent element has hidden styling. Requires more sophisticated HTML analysis than basic cheerio `$("a[href]")`.

### 6. robots.txt Disallow
**Symptom**: N/A — you should check before crawling.
**Handling**: See `references/robots-txt.md`. Always fetch and parse `robots.txt` before starting the crawl. Respect `Disallow` directives.

## Detection in the Report

Add a `crawlDifficulty` field to the report:

```typescript
crawlDifficulty: z.enum(["open", "rate_limited", "bot_protected", "captcha", "blocked"]);
```

This helps the orchestrator decide whether to retry with different strategies or flag the site as needing manual investigation.
