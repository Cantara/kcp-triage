# kcp-triage

Automatic agentic web service discovery. Two-layer system: the **Builder** (`src/`)
crawls, classifies, security-audits, and synthesizes a target website once; the output
is a **Site** (`sites/<domain>/`) — an agent-ready workbench with its own CLAUDE.md,
skills, API inventory, and KCP `knowledge.yaml` manifest.

## Start here

Read `knowledge.yaml` first — it's the canonical agent-navigable index of README,
CLAUDE.md, `src/`, and this repo's nine governed builder skills. Query it the standard
KCP way: `npx kcp-agent plan '<intent>' --manifest .`

For the shared conventions on how a governed skill unit should be authored
(`action_scope` as a firewall rule, `PROFILE.md`), see
[kcp-skill](https://github.com/Cantara/kcp-skill) — this repo does not vendor
kcp-skill's own skill library, only its authoring conventions.

**Local skills:** `skills/` — nine builder-level procedures covering orchestration,
full-site scanning, security-triage methodology, KCP manifest generation, adding a
new analyzer, the SDD branch/spec workflow, model-tier delegation, and the
triage-log.

## Gotchas

- **Two independent KCP versions in play.** This repo's own manifest (`knowledge.yaml`,
  top-level) is at `kcp_version: "0.30"`. Manifests it *generates* for triaged sites
  are pinned separately via `KCP_VERSION` in `src/generators/kcp-manifest.ts`
  (currently `0.29`). Bumping one does not bump the other.
- **`content_hash` drift fails CI — but only if CI runs.** `kcp validate` (the
  check in `kcp-validate.yml`) recomputes each unit's `content_hash` against the
  file on disk and hard-fails the build on a mismatch — it checks the hash, not
  just the signature. The catch: the workflow's path filter only watches
  `knowledge.yaml`, `src/**`, and `README.md` — not `skills/**` or `CLAUDE.md`
  itself. Edit a `skills/*/SKILL.md` body (or this file) alone and CI never
  runs, so a stale hash sits undetected until some unrelated push trips the
  workflow and fails on it. Run `kcp sign --update-hashes` (or hand-edit the
  digest in `knowledge.yaml`) whenever you change a skill body or this file.
- **`skills/export-cantara/SKILL.md` describes infrastructure not present in this
  checkout** (a `StigLau/kcp-triage` private sibling, IronClaw files under
  `security/`, `src/defense/`) — none exist here and git history shows no
  non-`Cantara/kcp-triage` remote. Verify before following it.
- **Generated site output is disposable-and-regenerated**: `sites/<domain>/skills/`
  and `apis/` are wiped and rebuilt on every pipeline run — don't hand-edit them
  expecting persistence.
