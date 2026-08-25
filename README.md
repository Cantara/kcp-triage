# kcp-triage

Automatic agentic web service discovery — builds [KCP](https://github.com/Cantara/knowledge-context-protocol) knowledge about web services so LLM agents can interact with them.

> **This is an LLM-driven project.** The recommended way to work with this codebase is to point your LLM agent (Claude Code, Cursor, etc.) at the repo and let it drive. The `CLAUDE.md`, skills, and docs are designed as agent context — not just human documentation. If you're reading this as a human, the quickest path is to plug in your agent and say _"triage example.com"_.

## Two-layer architecture

### Builder (`src/`)

The CLI pipeline that crawls, classifies, audits, and reports on websites. It's the factory — you run it once per target site and it produces structured knowledge. The builder delegates LLM work across model tiers (Opus for orchestration, Sonnet for analysis, Haiku for grunt work) to minimize cost.

### Sites (`sites/<domain>/`)

Each triaged site gets its own **agent-ready workbench**: a `CLAUDE.md`, skills, API inventory, unknown-endpoints list, and a KCP `knowledge.yaml` manifest. These aren't just JSON blobs — they're project scaffolds that an LLM agent can load and immediately use to interact with the target service.

```
Builder (src/)                        Sites (sites/<domain>/)
┌──────────────────────┐              ┌──────────────────────┐
│ crawl → classify →   │    output    │ CLAUDE.md            │
│ audit → synthesize → │ ──────────► │ skills/              │
│ generate → manifest  │              │ apis/, unknowns/     │
└──────────────────────┘              │ knowledge.yaml       │
   run once per site                  └──────────────────────┘
                                         load into your agent
```

## Quick start

```bash
bun install
export ANTHROPIC_API_KEY=sk-ant-...

# Triage a site end-to-end
just triage https://example.com

# Or step by step
just init https://example.com
just scan example.com
just report example.com
```

## Development

This project uses [Spec-Driven Development](skills/sdd-workflow/SKILL.md). New features go through: Issue → Branch → Spec → Schema → Implement → Skill → Test → PR.

```bash
just check       # TypeScript check
just test        # Run tests
just fmt         # Biome format
just lint        # Biome lint
just sites       # List all triaged sites
```

See `CLAUDE.md` for full conventions, `skills/` for agent-consumable workflow guides, and `just --list` for all available recipes.
