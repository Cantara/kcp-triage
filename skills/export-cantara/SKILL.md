---
name: export-cantara
description: Export kcp-triage to Cantara/kcp-triage public repo. Sanitizes personal data, removes triaged sites, updates URLs. The Cantara project does not know about its StigLau sibling.
---

# Export to Cantara

## Relationship

| Repo | Visibility | Purpose |
|------|-----------|---------|
| `StigLau/kcp-triage` | Private | Working repo — active development, personal triages, ironclaw integration |
| `Cantara/kcp-triage` | Public | Clean export — generic triage tool, no personal data, no ironclaw |
| `StigLau/kcp-triage-claw` | Public | IronClaw/OpenClaw integration layer — uses Cantara/kcp-triage as submodule |

The Cantara project has **no knowledge** of the StigLau sibling. It is a standalone, generic triage tool.

Flow: develop on StigLau → test → export clean branch → push to Cantara.

## What gets exported

- All `src/` pipeline code (crawlers, analyzers, generators, schemas, commands)
- `skills/` (builder-level skills — NOT site-specific skills in sites/)
- `docs/` (specs, prompts, reference docs)
- `schemas/` (JSON Schema exports)
- `tests/`
- `justfile`, `package.json`, `tsconfig.json`, config files

## What gets stripped

- `sites/*` — all triaged site projects (personal data, client info)
- `triage-log.yaml` — per-installation progression log
- `security/` — IronClaw sandbox profiles (lives in kcp-triage-claw)
- `manifest.json` — IronClaw module manifest (lives in kcp-triage-claw)
- `SKILL.md` (root) — IronClaw module skill doc (lives in kcp-triage-claw)
- `src/defense/` — IronClaw canary/sanitizer (lives in kcp-triage-claw)
- `src/analyzers/qc-reviewer.ts` — IronClaw QC reviewer (lives in kcp-triage-claw)
- Any references to `StigLau`, personal domains, or sister apps

## What gets sanitized

- User-Agent URLs: `StigLau/kcp-triage` → `Cantara/kcp-triage`
- CLAUDE.md: remove personal workflow details, keep technical content
- README.md: generic description, no personal context
- `.gitignore`: add `triage-log.yaml`, `sites/**/.env`

## How to export

```bash
# 1. Start from main, create export branch
git checkout main
git checkout -b export/cantara

# 2. Remove personal data
git rm -r sites/
mkdir -p sites && touch sites/.gitkeep && git add sites/.gitkeep
git rm triage-log.yaml 2>/dev/null || true

# 3. Sanitize URLs and docs
# (see checklist above — or run the skill)

# 4. Verify
bun run typecheck && bun test

# 5. Push to Cantara
git remote add cantara https://github.com/Cantara/kcp-triage.git  # once
git push cantara export/cantara:main
```

## How to update Cantara later

When new features are tested and ready:

```bash
# 1. Update the export branch from main
git checkout export/cantara
git merge main --no-edit

# 2. Re-run sanitization: remove sites, triage-log, defense layer
git rm -r sites/ 2>/dev/null; mkdir -p sites && touch sites/.gitkeep && git add sites/.gitkeep
git rm triage-log.yaml 2>/dev/null || true
git rm -r src/defense/ 2>/dev/null || true
git rm src/analyzers/qc-reviewer.ts 2>/dev/null || true
git rm -r security/ manifest.json SKILL.md 2>/dev/null || true

# 3. Sanitize User-Agent, personal refs
# grep -r "StigLau" src/ — fix any references

# 4. Verify
bun run typecheck && bun test

# 5. Commit and push
git add -A && git commit -m "chore: sync with upstream $(date +%Y-%m-%d)"
git push cantara export/cantara:main
```

## Preferences

- The Cantara README is deliberately simple — no SDD workflow, no delegation model
- Keep the justfile — it's generic and useful, easily convertible to Makefile by LLMs
- Each Cantara user gets their own `triage-log.yaml` (gitignored)
- Each Cantara user generates their own `sites/` content
- Do not expose ironclaw/openclaw concepts in the Cantara export
