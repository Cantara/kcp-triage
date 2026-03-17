---
name: generate-kcp
description: "Generate per-site KCP (Knowledge Context Protocol) artifacts from triage results. Use after scanning a site to produce CLAUDE.md, skills, API specs, and site-specific configuration for LLM agents to interact with the site."
---

# Generate KCP Artifacts

After running a triage scan, convert results into KCP knowledge that LLM agents can use.

## What Gets Generated

Under `sites/<domain>/`:

```
sites/example-com/
  CLAUDE.md               # Site-specific context for Claude
  triage.config.json      # Scan configuration
  triage-report.json      # Raw triage results
  skills/
    navigate/SKILL.md     # How to traverse the site
    api/SKILL.md          # Discovered API endpoints
    interact/SKILL.md     # How to perform actions on the site
  kcp/
    site-map.md           # Structured sitemap
    api-catalog.md        # API endpoint catalog
    capabilities.md       # What can be done on this site
    constraints.md        # Rate limits, auth requirements, do-not-do list
```

## Process

1. Read `triage-report.json` from the scan
2. Generate `CLAUDE.md` summarizing:
   - What the site is (from classification)
   - Security posture (from audit)
   - Key pages and structure (from crawl)
3. Generate skills based on discovered capabilities
4. Generate KCP knowledge files for agent consumption

## Site CLAUDE.md Template

```markdown
# <domain>

<classification.primaryCategory> site. <classification.reasoning>

## Structure
<sitemap derived from crawl>

## Security
Grade: <security.overallGrade>
<notable findings>

## Capabilities
<what an agent can do on this site>

## Constraints
- Rate limit: <from config>
- Auth: <if discovered>
- Do not: <destructive operations to avoid>
```

## Key Principle

KCP artifacts are the bridge between raw triage data and actionable agent knowledge. They should be written for LLM consumption — clear, structured, and complete enough for an agent to operate on the site without re-crawling.
