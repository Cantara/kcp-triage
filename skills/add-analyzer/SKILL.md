---
name: add-analyzer
description: "Pattern for extending the triage pipeline with new analysis steps. Use when adding SEO audit, performance check, accessibility scan, DNS/WHOIS lookup, tech fingerprinting, link graph analysis, or any new triage dimension."
---

# Adding a New Analyzer

Every triage dimension follows the same SDD pattern.

## Step 1: Define Schema

In `src/schemas/triage.ts`:

```typescript
export const SeoAuditSchema = z.object({
  url: z.string().url(),
  // ... analysis-specific fields
  auditedAt: z.string().datetime(),
});
export type SeoAudit = z.infer<typeof SeoAuditSchema>;
```

Add to `TriageReportSchema` as optional:
```typescript
seo: SeoAuditSchema.optional(),
```

Export from `src/schemas/index.ts`.

## Step 2: Deterministic or LLM-Powered?

| Analysis type | Approach |
|---------------|----------|
| HTTP responses, HTML, DNS inspection | Deterministic analyzer |
| Judgment, interpretation, classification | LLM-powered via Dispatcher |
| Both | Split: deterministic data-gathering + LLM interpretation |

## Step 3: Write Analyzer

Create `src/analyzers/<name>.ts`.

**Deterministic:**
```typescript
export async function auditSeo(url: string, timeoutMs: number): Promise<SeoAudit> { ... }
```

**LLM-powered:**
```typescript
export async function analyzeX(crawl: CrawlResult, dispatcher: Dispatcher, routing: TaskRouting): Promise<TaskResult<X>> {
  return dispatcher.dispatch({ tier: routing.yourTask, system: PROMPT, prompt: data, parse: ... });
}
```

If LLM-powered, add routing entry to `src/orchestration/config.ts`.

## Step 4: Wire into Pipeline

In `src/commands/run.ts`:
1. Import analyzer
2. Add spinner + call in pipeline sequence (before Step 5: Generate Project)
3. Pass result to `generateSiteProject()` so the project generator can incorporate it
4. Add result to `TriageReport` object
5. If LLM-powered, add `delegatedTasks` entry

## Step 5: Wire into Report

In `src/commands/report.ts`:
1. Add section to `renderSummary()`
2. Add section to `renderMarkdown()`

## Step 6: Wire into KCP Manifest

In `src/generators/kcp-manifest.ts`:
- If the analyzer produces a file, add it as a KCP unit with appropriate intent, scope, audience

## Step 7: Create Skill

Create `skills/<name>/SKILL.md` with frontmatter, key files, tuning recipes.

## Checklist

- [ ] Zod schema in `src/schemas/triage.ts` with types exported
- [ ] Schema added to `TriageReportSchema` (as optional)
- [ ] Analyzer in `src/analyzers/` or `src/generators/`
- [ ] Wired into `src/commands/run.ts` (before project generation if the data feeds into generated skills)
- [ ] Wired into `src/commands/report.ts`
- [ ] If LLM-powered: routing entry in `config.ts`, use `maxTokens` param if output may be large
- [ ] If LLM-powered with large output: dispatcher uses streaming automatically (>8192 tokens)
- [ ] Indexed in KCP manifest (`src/generators/kcp-manifest.ts`)
- [ ] Skill in `skills/`
- [ ] Test in `tests/`
- [ ] `bun run typecheck` passes
