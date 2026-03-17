# robots.txt Parsing Guide

## Why

Before crawling any production site, the crawler should respect `robots.txt` directives. This prevents crawling disallowed paths and respects `Crawl-delay` directives.

## Implementation

### 1. Fetch and parse

```typescript
interface RobotsRules {
  disallowed: string[];
  allowed: string[];
  crawlDelay: number | null;
  sitemaps: string[];
}

async function parseRobotsTxt(baseUrl: URL): Promise<RobotsRules> {
  const robotsUrl = new URL("/robots.txt", baseUrl);
  const rules: RobotsRules = {
    disallowed: [],
    allowed: [],
    crawlDelay: null,
    sitemaps: [],
  };

  try {
    const res = await fetch(robotsUrl);
    if (!res.ok) return rules; // no robots.txt = everything allowed
    const text = await res.text();

    let inOurSection = false;
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const [directive, ...valueParts] = line.split(":");
      const key = directive.trim().toLowerCase();
      const value = valueParts.join(":").trim();

      if (key === "user-agent") {
        // Match "*" (all bots) — extend this if you want a custom bot name
        inOurSection = value === "*";
      } else if (inOurSection) {
        if (key === "disallow" && value) rules.disallowed.push(value);
        if (key === "allow" && value) rules.allowed.push(value);
        if (key === "crawl-delay") {
          const delay = Number.parseFloat(value);
          if (!Number.isNaN(delay)) rules.crawlDelay = delay * 1000; // convert to ms
        }
      }

      // Sitemaps are global, not per user-agent
      if (key === "sitemap") rules.sitemaps.push(value);
    }
  } catch {
    // Network error = proceed without restrictions
  }

  return rules;
}
```

### 2. Check before crawling

```typescript
function isAllowed(pathname: string, rules: RobotsRules): boolean {
  // Allow rules take precedence over disallow for the same specificity
  // but for simplicity: check allows first, then disallows
  for (const pattern of rules.allowed) {
    if (pathname.startsWith(pattern)) return true;
  }
  for (const pattern of rules.disallowed) {
    if (pathname.startsWith(pattern)) return false;
  }
  return true;
}
```

### 3. Wire into the crawler

In `crawlSite()`:

```typescript
const robots = await parseRobotsTxt(base);
const crawlDelay = robots.crawlDelay ?? 0;

// Store robots.txt in the result
const robotsTxt = await fetch(new URL("/robots.txt", base)).then(r => r.text()).catch(() => undefined);

// In the link-enqueue section:
if (isAllowed(resolved.pathname, robots)) {
  queue.push(resolved.href);
}

// After each fetch:
if (crawlDelay > 0) await Bun.sleep(crawlDelay);
```

### 4. Update the schema

The `CrawlResultSchema` already has a `robotsTxt: z.string().optional()` field — just populate it with the raw text.
