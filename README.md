# kcp-triage

Automatic agentic web service discovery — builds [KCP](https://github.com/Cantara/knowledge-context-protocol) knowledge about web services so LLM agents can interact with them.

## What it does

1. **Crawls** a target website (BFS, same-origin, configurable depth)
2. **Classifies** content using LLM (category, topics, tech stack)
3. **Audits** security headers (deterministic, grades A–F)
4. **Generates** a structured triage report
5. **Produces** KCP artifacts (CLAUDE.md, skills, API specs) for agent consumption

## Quick start

```bash
bun install

# Initialize a triage project
bun run dev init https://example.com -o sites/example-com

# Dry run (no API calls)
bun run dev run --config sites/example-com/triage.config.json --dry-run

# Execute (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
bun run dev run --config sites/example-com/triage.config.json

# View results
bun run dev report --config sites/example-com/triage.config.json
```

## Project structure

```
src/
  cli.ts                    # CLI entry point
  commands/                 # init, run, report
  orchestration/            # Model routing + API dispatch
  crawlers/                 # Site crawler
  analyzers/                # Content classifier, security headers
  schemas/                  # Zod schemas (source of truth)
schemas/                    # JSON Schema exports
tests/                      # Tests
docs/                       # Specs, prompts, reference docs
skills/                     # Builder-level Claude skills
sites/                      # Generated per-site projects
```

## Development

```bash
bun run typecheck    # TypeScript check
bun test             # Run tests
bun run lint         # Biome lint
bun run fmt          # Biome format
```
