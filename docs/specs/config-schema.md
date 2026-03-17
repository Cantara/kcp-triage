# Config Schema Reference

The project config lives at `triage.config.json` (or wherever `--config` points). It's validated by `OrchestratorConfigSchema` from `src/orchestration/config.ts`.

## Full Schema

```typescript
{
  // Which model tier handles each task
  routing: {
    crawl:         "haiku" | "sonnet" | "opus",   // default: "haiku"
    classify:      "haiku" | "sonnet" | "opus",   // default: "sonnet"
    securityAudit: "haiku" | "sonnet" | "opus",   // default: "haiku"
    synthesize:    "haiku" | "sonnet" | "opus",   // default: "sonnet"
  },

  // Crawl limits
  maxCrawlPages:    number,   // default: 20, must be positive int
  requestTimeoutMs: number,   // default: 10000, per-request timeout

  // Output
  outputDir: string,          // default: "./triage-output"

  // Auth (falls back to ANTHROPIC_API_KEY env var)
  apiKey?: string,
}
```

## Model IDs

The tier names map to specific Anthropic model strings in `MODEL_IDS`:

| Tier   | Model ID                       |
|--------|--------------------------------|
| opus   | `claude-opus-4-20250514`       |
| sonnet | `claude-sonnet-4-20250514`     |
| haiku  | `claude-haiku-4-5-20251001`    |

## Init-Generated Config

When `site-triage init` creates a config, it also adds:

```json
{
  "$schema": "./triage.schema.json",
  "targetUrl": "https://example.com",
  "createdAt": "2026-03-17T12:00:00.000Z",
  // ...all OrchestratorConfig fields with defaults applied
}
```

## Overriding at Runtime

The `run` command reads the config file and parses it through Zod. Any missing fields get defaults. You can override the API key via environment variable even if the config file doesn't include it:

```bash
ANTHROPIC_API_KEY=sk-... bun run dev run --config ./output/triage.config.json
```
