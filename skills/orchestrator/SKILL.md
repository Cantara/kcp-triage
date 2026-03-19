---
name: orchestrator
description: "Top-level orchestration for kcp-triage. Entry point for triaging a website, coordinating the 7-step pipeline, managing model routing, and pipeline decisions. Start here before reading other skills."
---

# Site Triage Orchestrator

Coordinate the website triage pipeline. Delegate actual analysis to cheaper models.

## Architecture

```
You (Opus, via Claude Code)
  ├── bun run dev init <url> -o <dir>  → creates project config
  ├── bun run dev run --config …       → runs full 7-step pipeline:
  │     ├── 1. Crawl (deterministic — BFS + robots.txt + sitemap)
  │     ├── 2. Classify content (→ Sonnet)
  │     ├── 3. Security audit (deterministic — header checks)
  │     ├── 4. Synthesize site profile (→ Sonnet)
  │     ├── 5. Generate site project (→ Haiku — CLAUDE.md, skills, APIs, unknowns)
  │     ├── 6. Generate KCP manifest (deterministic — knowledge.yaml)
  │     └── 7. Assemble triage-report.json
  └── bun run dev report               → display results
```

## Model Routing

| Task | Default Tier | Rationale |
|------|-------------|-----------|
| classify | sonnet | Needs reasoning about site purpose |
| synthesize | sonnet | Coherent narrative about capabilities |
| generate | haiku | Formatting existing analysis into markdown — grunt work |
| KCP manifest | — | Deterministic, no LLM |
| security audit | — | Deterministic, no LLM |

Override in `triage.config.json`: `{ "routing": { "classify": "haiku", "generate": "sonnet" } }`

### When to upgrade generate to sonnet
- Haiku truncates output (JSON parse error) on very complex sites
- Site has many interactive flows requiring detailed skill documentation
- Quality of generated CLAUDE.md is insufficient

## The Contract: TriageReportSchema

Everything flows toward `triage-report.json`, validated by `TriageReportSchema` in `src/schemas/triage.ts`. Every analyzer produces data fitting its portion of the schema.

The report includes `orchestrationMeta` — which model handled which task, duration, token usage.

## Output Per Site Type

| Site type | Skills | APIs | Unknowns | Permissions model |
|-----------|--------|------|----------|-------------------|
| Blog | 2-4 (navigate, browse, extract) | none | rarely | read-only |
| Government | 4-7 (navigate, guides, statistics) | none (portal noted) | SPA backends | read-only |
| E-commerce | 3-5 including `order-flow.md` | inferred | cart/search/inventory APIs | three-tier |
| Transit/service | 4-7 including `plan-trip.md` | inferred | journey planner API | read-only + tools |

### Three-tier permissions (e-commerce, SaaS)
1. **Always allowed** — browsing, searching, viewing products
2. **With user authorization** — add to cart, start checkout, fill forms (STOP before payment)
3. **Never do** — complete payment, delete data, bypass auth

## Decision Tree

| You want to… | Read |
|--------------|------|
| Start a new feature (branch + issue) | `skills/sdd-workflow/SKILL.md` |
| Run a full site scan | `skills/scan-site/SKILL.md` |
| Understand KCP output format | `skills/generate-kcp/SKILL.md` |
| Delegate to multi-agent team | `skills/claude-team/SKILL.md` |
| Add a new analysis step | `skills/add-analyzer/SKILL.md` |

## Key Files

| File | Purpose |
|------|---------|
| `src/commands/run.ts` | Pipeline orchestration (7 steps) |
| `src/orchestration/config.ts` | Model routing + config schema |
| `src/orchestration/dispatcher.ts` | LLM API calls (streaming for large outputs) |
| `src/generators/kcp-manifest.ts` | KCP knowledge.yaml generation |
| `src/schemas/triage.ts` | All Zod schemas (source of truth) |

## Resolved Issues

- ~~#2: robots.txt enforcement~~ — crawler now fetches robots.txt
- ~~#3: sitemap.xml parsing~~ — sitemapUrls extracted from robots.txt
- ~~#5: Report synthesis step~~ — Step 4 synthesizes, Step 5 generates project
- ~~#6: Site project generation~~ — CLAUDE.md, skills, APIs, unknowns, KCP manifest
