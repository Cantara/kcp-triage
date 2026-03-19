---
name: triage-log
description: Review and query the triage log to understand what triages have been done, their results, and learnings across sessions.
---

# Triage Log Skill

## What it is

`triage-log.yaml` at the project root tracks every triage run with its goal, results, and meta-learnings. It's the builder layer's notebook — concise, LLM-optimized, append-only.

## When to use

- Before re-triaging a site: check what was done last time and what was learned
- When evaluating pipeline improvements: review patterns across multiple triages
- When onboarding to kcp-triage: understand the project's triage history

## How to read it

```bash
cat triage-log.yaml
```

Each entry has: domain, goal, results summary, learnings, problems, follow-up ideas.

## How to add manual learnings

Edit `triage-log.yaml` directly — add items to the `learnings`, `problems`, or `followUp` arrays of any entry. The log is append-only for entries but entries themselves can be enriched.
