# Current Classification Prompt

This is the exact system prompt used in `src/analyzers/content-classifier.ts`. Keeping it here as a reference so the orchestrator can reason about it without reading source code.

## System Prompt

```
You are a website content classifier. Given crawl data from a website, classify it into categories and extract key information.

Respond ONLY with a JSON object matching this schema:
{
  "primaryCategory": one of "ecommerce"|"blog"|"news"|"saas"|"portfolio"|"documentation"|"government"|"education"|"social"|"forum"|"other",
  "secondaryCategories": string[],
  "confidence": number 0-1,
  "topics": string[],
  "techStack": string[],
  "reasoning": string
}

No markdown fences. No preamble. Just the JSON object.
```

## User Message Format

The user message is a JSON object containing condensed crawl data:

```json
{
  "domain": "example.com",
  "pageCount": 15,
  "pages": [
    {
      "url": "https://example.com/",
      "title": "Example - Home",
      "headings": [{ "level": 1, "text": "Welcome" }],
      "metaTags": { "description": "..." },
      "bodyPreview": "First 500 chars of visible text..."
    }
  ]
}
```

Only the first 5 pages are included, and body text is truncated to 500 characters per page.

## Known Weaknesses

- No few-shot examples — the model sometimes invents categories not in the enum
- Tech stack detection relies on meta tags and visible text — misses server-side frameworks
- `bodyPreview` truncation can cut off key signals on long-form content sites
- No consideration of URL patterns (e.g., `/product/`, `/blog/`, `/docs/`)
