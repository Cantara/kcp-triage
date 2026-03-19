---
name: sdd-workflow
description: "Spec-Driven Development workflow for kcp-triage. Use when starting new features, creating issues/branches, writing specs, or following the branch-based SDD process."
---

# SDD Workflow

Every non-trivial change follows this flow. Delegate implementation steps to cheaper models.

## 1. Create Issue

```bash
gh issue create --title "feat: <short description>" --body "## Motivation
<why this matters>

## Acceptance criteria
- [ ] Schema defined in triage.ts
- [ ] Analyzer implemented
- [ ] Wired into pipeline
- [ ] Skill created
- [ ] Tests pass
"
```

Label conventions: `feature`, `bug`, `refactor`, `docs`

## 2. Branch

```bash
git checkout -b feat/<short-name>   # or fix/, refactor/, docs/
```

Branch naming: `feat/seo-analyzer`, `fix/crawler-timeout`, `refactor/dispatcher-streaming`

## 3. Write Spec

Create `docs/specs/<feature>.md`:

```markdown
# <Feature Name>

## Motivation
Why this exists and what problem it solves.

## Schema
Sketch of the Zod schema additions.

## Design
How it fits into the pipeline. Deterministic vs LLM-powered.
Which model tier handles it.

## Acceptance Criteria
- [ ] Concrete, testable requirements
```

## 4. Implement (SDD Steps)

Follow in order — each step validates the previous:

1. **Schema** → `src/schemas/triage.ts` (Zod) + `schemas/` (JSON Schema export)
2. **Analyzer** → `src/analyzers/<name>.ts` (deterministic or LLM-powered)
3. **Pipeline** → wire into `src/commands/run.ts`
4. **Report** → wire into `src/commands/report.ts`
5. **KCP manifest** → `src/generators/kcp-manifest.ts` if it produces a file
6. **Skill** → `skills/<name>/SKILL.md`
7. **Tests** → `tests/`

Delegate: Sonnet for implementation, Haiku for boilerplate/generation.

## 5. Commit Convention

```
feat: add SEO analyzer (#12)
fix: handle empty crawl results (#15)
refactor: extract dispatcher retry logic
docs: add transport-security spec
test: add security-headers edge cases
chore: update dependencies
```

Always reference the issue number.

## 6. PR

```bash
gh pr create --title "feat: add SEO analyzer" --body "Closes #12

## Summary
- Added SeoAudit schema and analyzer
- Wired into pipeline step 3.5
- Generates SEO skill in site projects

## Test plan
- [ ] bun test passes
- [ ] bun run typecheck passes
- [ ] Dry run produces expected schema
"
```

## 7. Merge

Squash-merge to main. Issue auto-closes via `Closes #N` in PR body.

## Decision: When to Skip This Flow

| Change | Flow |
|--------|------|
| New analyzer, major feature | Full SDD (issue → branch → spec → PR) |
| Bug fix, small improvement | Branch + PR, skip spec |
| Typo, config tweak | Commit directly to main |
