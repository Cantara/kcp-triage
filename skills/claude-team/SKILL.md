---
name: claude-team
description: "Multi-agent delegation patterns for kcp-triage. Use when coordinating work across Opus/Sonnet/Haiku, deciding which model tier to use, implementing cost-optimized workflows, or setting up agent escalation patterns."
---

# Claude Team Delegation

## Model Tiers

| Tier | Model | Cost | Use For |
|------|-------|------|---------|
| Opus | claude-opus-4-6 | $$$ | Architecture, hard reasoning, orchestration |
| Sonnet | claude-sonnet-4-5 | $$ | Implementation, classification, synthesis |
| Haiku | claude-haiku-4-5 | $ | Crawling, parsing, extraction, quick tasks |

**Default to cheapest model.** Escalate only when quality requires it.

## Delegation via CLI

```bash
# Delegate to Sonnet for implementation
claude -p "Implement the SEO analyzer following the add-analyzer pattern" --model sonnet

# Delegate to Haiku for data extraction
claude -p "Parse this HTML and extract all form fields" --model haiku
```

## Delegation via Dispatcher (in code)

```typescript
// The Dispatcher routes to the configured tier
const result = await dispatcher.dispatch({
  tier: routing.classify,  // "sonnet" by default
  system: SYSTEM_PROMPT,
  prompt: data,
  parse: (raw) => Schema.parse(JSON.parse(raw)),
});
```

## Escalation Pattern

```
Haiku attempt → confidence < 0.7 → Sonnet retry → confidence < 0.7 → Opus review
```

Implementation:
```typescript
const rough = await dispatcher.dispatch({ tier: "haiku", ... });
if (rough.data.confidence < 0.7) {
  return dispatcher.dispatch({ tier: "sonnet", ... });
}
return rough;
```

## Cost Optimization

1. **Crawl data condensation**: Send only what's needed (5 pages, 500 chars each)
2. **Two-pass classification**: Haiku first, Sonnet only if uncertain
3. **Deterministic where possible**: Security audit needs no LLM
4. **Track costs**: `orchestrationMeta` in reports shows model/duration/tokens per task

## When to Escalate to Opus

- Architectural decisions (new analyzer design, schema changes)
- Cross-cutting changes (affects multiple pipeline stages)
- Ambiguous requirements needing judgment
- Debugging complex failures across the pipeline
