# JS-Rendered Page Handling

## The Problem

Sites built with React, Vue, Angular, etc. return minimal HTML — the real content is rendered client-side. The cheerio-based crawler sees skeleton markup, not the actual page.

## Solution: Playwright Integration

### Install

```bash
bun add playwright
bunx playwright install chromium  # downloads browser binary
```

### Implementation

Create `src/crawlers/js-renderer.ts`:

```typescript
import { chromium, type Browser, type Page } from "playwright";

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function renderPage(url: string, timeoutMs: number): Promise<string> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: timeoutMs,
    });

    // Wait a bit for any late-loading content
    await page.waitForTimeout(1000);

    return await page.content();
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
```

### Integrate with the crawler

In `site-crawler.ts`, add a `useJsRendering` option:

```typescript
export interface CrawlOptions {
  maxPages: number;
  timeoutMs: number;
  useJsRendering?: boolean;
}

// In fetchAndParse, swap the fetch strategy:
async function fetchAndParse(
  url: string,
  timeoutMs: number,
  jsRendering: boolean,
): Promise<CrawlPage> {
  let html: string;
  let statusCode: number;
  let contentType: string;

  if (jsRendering) {
    const { renderPage } = await import("./js-renderer.js");
    html = await renderPage(url, timeoutMs);
    statusCode = 200; // Playwright doesn't expose status easily
    contentType = "text/html";
  } else {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    html = await res.text();
    statusCode = res.status;
    contentType = res.headers.get("content-type") ?? "unknown";
  }

  const $ = cheerio.load(html);
  // ...rest of parsing unchanged
}
```

### When to enable

JS rendering is ~10x slower and requires a browser binary. Use it selectively:

- **Auto-detect**: Fetch with plain HTTP first. If `bodyTextPreview` is under 100 chars, re-fetch with Playwright.
- **Config flag**: Add `useJsRendering: boolean` to `OrchestratorConfigSchema`.
- **Per-URL override**: Let the orchestrator decide after seeing initial crawl results.

### Cleanup

Call `closeBrowser()` at the end of the pipeline to release the Chromium process:

```typescript
// In src/commands/run.ts, after all crawling is done:
const { closeBrowser } = await import("../crawlers/js-renderer.js");
await closeBrowser();
```

### Cost Considerations

Playwright adds ~500MB disk for Chromium and significant memory overhead. For Claude Code orchestration where you control the environment this is fine, but document it in the project README.
