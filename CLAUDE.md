# kcp-triage

Automatic agentic web service discovery — builds KCP knowledge about web services so LLM agents can interact with them.

## Architecture

Two-layer system:
- **Builder** (`src/`): CLI pipeline that crawls, classifies, audits, and reports on websites
- **Sites** (`sites/<domain>/`): Per-site generated projects with CLAUDE.md, skills, KCP artifacts

## SDD Workflow

Every non-trivial change follows Spec-Driven Development on a feature branch with a tracking issue.

### Branch + Issue Flow

1. **Create issue** — `gh issue create --title "Add <feature>" --body "..."` describing the goal
2. **Branch from main** — `git checkout -b feat/<short-name>` (or `fix/`, `refactor/`)
3. **Write spec** — `docs/specs/<feature>.md` with motivation, schema sketch, acceptance criteria
4. **Implement** — Spec → Schema → Code → Skill → Test (see steps below)
5. **PR + review** — `gh pr create` linking the issue. PR body summarizes what changed and why.
6. **Merge** — Squash-merge to main, issue auto-closes via `Closes #N`

### SDD Steps (within a branch)

Spec → Schema → Implement → Skill → Test

1. Write the spec in `docs/specs/`
2. Define Zod schema in `src/schemas/triage.ts` + JSON schema in `schemas/`
3. Implement in `src/analyzers/` or `src/crawlers/`
4. Wire into `src/commands/run.ts` pipeline
5. Create/update skill in `skills/`
6. Add tests in `tests/`

### Commit Convention

- Prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Reference issue: `feat: add SEO analyzer (#12)`

## Claude Team Delegation

**DEFAULT to cheapest model. User will say explicitly if they want Opus-only.**

| Role | Model | Use for |
|------|-------|---------|
| Architect/orchestrator | Opus | Hard thinking, design decisions, multi-step coordination |
| Implementation | Sonnet | Code writing, classification, synthesis, analysis |
| Grunt work | Haiku | Crawling, parsing, extraction, quick tasks |

## Key Commands

```bash
bun install                    # Install deps
bun run dev init <url> -o <dir>  # Init a triage project
bun run dev run --config <path>  # Run full pipeline
bun run dev report --config <path> [-f json|markdown|summary]
bun run typecheck              # TypeScript check
bun test                       # Run tests
```

## Project Structure

```
src/
  cli.ts                       # CLI entry point
  commands/{init,run,report}.ts # CLI commands
  orchestration/{config,dispatcher,index}.ts # Model routing + API dispatch
  crawlers/site-crawler.ts     # BFS HTML crawler
  analyzers/{content-classifier,security-headers}.ts
  schemas/triage.ts            # Zod schemas (source of truth)
schemas/                       # JSON Schema exports
tests/                         # Test files
docs/
  specs/                       # Design specs
  prompts/                     # LLM prompt templates
  security/                    # Security reference docs
  crawling/                    # Crawler reference docs
  resilience/                  # Error handling docs
skills/                        # Builder-level Claude skills
sites/                         # Generated per-site projects
```

## Conventions

- All schemas defined in `src/schemas/triage.ts` with Zod, exported via `src/schemas/index.ts`
- Analyzers are either deterministic (no LLM) or LLM-powered via `Dispatcher`
- Pipeline steps in `src/commands/run.ts` use ora spinners for progress
- Generated site output goes to `sites/<domain>/`, never project root
- Use KCP Memory (`mcp__kcp-memory__*`) to record and retrieve cross-session learnings
- Crawler includes 500ms politeness delay and User-Agent header
- API key validated before crawling (fail fast)
