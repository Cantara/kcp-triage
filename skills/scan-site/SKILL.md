---
name: scan-site
description: "Full site triage workflow: init → crawl → classify → security audit → synthesize → generate project → KCP manifest → report. Use when triaging a new website end-to-end, re-running a scan, or debugging pipeline failures."
---

# Scan Site

Run the complete triage pipeline against a target URL.

## Workflow

```bash
# 1. Initialize project
bun run dev init https://example.com -o sites/example-com

# 2. (Optional) Adjust config for politeness, model routing
# Edit sites/example-com/triage.config.json

# 3. Dry run (no API calls)
bun run dev run --config sites/example-com/triage.config.json --dry-run

# 4. Execute (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
bun run dev run --config sites/example-com/triage.config.json

# 5. View results
bun run dev report --config sites/example-com/triage.config.json -f summary
bun run dev report --config sites/example-com/triage.config.json -f markdown
```

## Pipeline Steps

1. **Crawl** (`src/crawlers/site-crawler.ts`): BFS crawl, extract headings/links/meta/body text. Fetches robots.txt + sitemaps. Strips URL fragments to avoid duplicates. Deterministic.
2. **Classify** (`src/analyzers/content-classifier.ts`): LLM classifies site category, topics, tech stack. Default: sonnet.
3. **Security Audit** (`src/analyzers/security-headers.ts`): Check HTTP security headers, grade A–F. Deterministic.
4. **Synthesize** (`src/analyzers/site-synthesizer.ts`): LLM produces narrative, interaction model, capabilities, API endpoints. Default: sonnet.
5. **Generate Project** (`src/analyzers/project-generator.ts`): LLM generates site-specific CLAUDE.md, README, sitemap, skills, API inventory, unknowns. Default: haiku (32K token limit, streaming).
6. **KCP Manifest** (`src/generators/kcp-manifest.ts`): Deterministic generation of `knowledge.yaml` indexing all project files per KCP spec v0.10.
7. **Assemble Report** (`src/commands/run.ts`): Combine all results into `triage-report.json`.

## Configuration

In `triage.config.json`:
- `maxCrawlPages`: Max pages to crawl (default 20)
- `requestTimeoutMs`: HTTP timeout (default 10000)
- `politenessDelayMs`: Delay between requests (default 500ms)
- `routing`: Override model tiers per task (`classify`, `synthesize`, `generate`)

### Politeness guidelines
- **Commercial sites** (e-commerce, SaaS): 500ms default is fine
- **Government/public service**: Use 1000–2000ms (`"politenessDelayMs": 2000`)
- **Check robots.txt**: Some sites specify Crawl-delay; respect it

## Output

After a successful run, `sites/<domain>/` contains:

```
sites/<domain>/
  knowledge.yaml         # KCP manifest — indexes all files for any AI agent
  CLAUDE.md              # LLM orientation for working with this site
  README.md              # Human-readable project card
  sitemap.md             # Structured navigation model
  triage.config.json     # Pipeline configuration
  triage-report.json     # Raw triage data (backing store)
  skills/                # Site-specific skills for LLM agents
  apis/                  # API inventory with confidence levels
  unknowns.md            # Suspected but unverified features (if any)
```

## Model Routing (cost optimization)

| Step | Default | Why |
|------|---------|-----|
| Classify | sonnet | Needs reasoning about site type |
| Synthesize | sonnet | Needs to produce coherent narrative |
| Generate | haiku | Formatting existing analysis into markdown — grunt work |
| KCP manifest | — | Deterministic, no LLM needed |

Override in config: `"routing": { "classify": "haiku", "generate": "sonnet" }`

## Learnings from running 4 sites

### Haiku token limits
- Simple sites (blogs): ~14K output tokens
- Complex sites (e-commerce, transit): 17–37K output tokens
- Pipeline uses 32K limit with streaming to handle large sites
- If haiku still truncates, upgrade generation to sonnet in config

### What the generator produces per site type
- **Blogs**: 2-4 skills (navigate, browse, extract), no APIs, no unknowns
- **E-commerce**: 3-5 skills including `order-flow.md` with STOP-before-payment boundary, unknowns for cart/checkout/search APIs
- **Government/transit**: 4-7 skills, unknowns for SPA backend APIs
- **Three-tier permissions**: "always allowed" / "with user authorization" / "never do"

### Fragment deduplication
The crawler strips URL fragments (`page.html#section` → `page.html`) before queueing. This prevents wasting crawl budget on the same page with different anchors.

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
- Set `ANTHROPIC_API_KEY` environment variable before running

**JSON parse error in project generation**
- Haiku may exceed output tokens on complex sites
- Fix: set `"routing": { "generate": "sonnet" }` in config
- The pipeline uses streaming for large responses; if still failing, the site may need more than 32K tokens

**Stale skills from previous run**
- The pipeline cleans `skills/` and `apis/` directories before each run
- If you see old files, verify the pipeline completed successfully

**Being a good web citizen**
- Set `politenessDelayMs` higher for sensitive sites
- The crawler includes a `User-Agent` header identifying itself
- robots.txt is fetched and noted in the output
