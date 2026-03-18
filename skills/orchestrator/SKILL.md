---
name: orchestrator
description: "Top-level orchestration for kcp-triage. Entry point for triaging a website, coordinating crawl → classify → audit → report workflows, managing model routing, and pipeline decisions. Start here before reading other skills."
---

# Site Triage Orchestrator

Coordinate the website triage pipeline. Delegate actual analysis to cheaper models.

## Architecture

```
You (Opus, via Claude Code)
  ├── bun run dev init <url> -o <dir>  → creates project config
  ├── bun run dev run --config …       → runs full pipeline:
  │     ├── Crawl (deterministic, no LLM)
  │     ├── Classify content (→ Sonnet)
  │     ├── Security audit (deterministic)
  │     └── Assemble triage-report.json
  └── bun run dev report               → display results
```

## Model Routing

| Task | Default Tier | Rationale |
|------|-------------|-----------|
| crawl | haiku | Reserved for future LLM-guided crawling |
| classify | sonnet | Needs reasoning about site purpose |
| securityAudit | haiku | Currently deterministic |
| synthesize | sonnet | Report synthesis needs coherent writing |

Override in `triage.config.json`: `{ "routing": { "classify": "haiku" } }`

## The Contract: TriageReportSchema

Everything flows toward `triage-report.json`, validated by `TriageReportSchema` in `src/schemas/triage.ts`. Every analyzer produces data fitting its portion of the schema.

The report includes `orchestrationMeta` — which model handled which task, duration, token usage.

## Decision Tree

| You want to… | Read |
|--------------|------|
| Run a full site scan | `skills/scan-site/SKILL.md` |
| Generate KCP artifacts for a site | `skills/generate-kcp/SKILL.md` |
| Delegate to multi-agent team | `skills/claude-team/SKILL.md` |
| Add a new analysis step | `skills/add-analyzer/SKILL.md` |

## Extending the Pipeline

1. Define Zod schema in `src/schemas/triage.ts`
2. Create analyzer in `src/analyzers/`
3. If LLM-powered, use `Dispatcher.dispatch()` with appropriate tier
4. Wire into `src/commands/run.ts`
5. Create skill in `skills/`
6. Update `TriageReportSchema`
7. Update `src/commands/report.ts` to render new data

## Known Limitations

See GitHub issues for planned improvements:
- #1: LLM retry logic for parse failures
- #2: robots.txt enforcement
- #3: sitemap.xml parsing
- #4: Better error handling in Dispatcher
- #5: Report synthesis step
