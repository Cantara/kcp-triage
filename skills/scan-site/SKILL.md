---
name: scan-site
description: "Full site triage workflow: init → crawl → classify → security audit → report. Use when triaging a new website end-to-end, re-running a scan, or debugging pipeline failures."
---

# Scan Site

Run the complete triage pipeline against a target URL.

## Workflow

```bash
# 1. Initialize project
bun run dev init https://example.com -o sites/example-com

# 2. Dry run (no API calls)
bun run dev run --config sites/example-com/triage.config.json --dry-run

# 3. Execute (requires ANTHROPIC_API_KEY)
bun run dev run --config sites/example-com/triage.config.json

# 4. View results
bun run dev report --config sites/example-com/triage.config.json
bun run dev report --config sites/example-com/triage.config.json -f markdown
bun run dev report --config sites/example-com/triage.config.json -f json
```

## Pipeline Steps

1. **Crawl** (`src/crawlers/site-crawler.ts`): BFS crawl, extract headings/links/meta/body text. Deterministic.
2. **Classify** (`src/analyzers/content-classifier.ts`): Send condensed crawl data to Sonnet for category + topics + tech stack.
3. **Security Audit** (`src/analyzers/security-headers.ts`): Check HTTP security headers, grade A–F. Deterministic.
4. **Report Assembly** (`src/commands/run.ts`): Combine all results into `triage-report.json`.

## Configuration

In `triage.config.json`:
- `maxCrawlPages`: Max pages to crawl (default 20)
- `requestTimeoutMs`: HTTP timeout (default 10000)
- `routing`: Override model tiers per task
- `outputDir`: Where to write results

## Output

`triage-report.json` conforming to `TriageReportSchema`:
- Site identity (URL, domain, title)
- Crawl results (pages with headings, links, meta tags)
- Content classification (category, topics, tech stack, confidence)
- Security audit (header checks, overall grade)
- Orchestration metadata (models used, duration, tokens)

## After Scanning

Use `skills/generate-kcp/SKILL.md` to produce KCP artifacts from the triage report.
