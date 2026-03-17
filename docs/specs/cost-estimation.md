# Token Cost Estimation

## Why This Matters

The orchestrator delegates to paid API calls. Understanding token costs lets you:
- Choose the right tier per task
- Set budget limits
- Predict cost before running on large batches

## Approximate Token Counts

Rule of thumb: 1 token ≈ 4 characters of English text, or ≈ 3/4 of a word.

### Per-task estimates for a typical site triage

| Task | Input Tokens | Output Tokens | Notes |
|------|-------------|---------------|-------|
| Content classification | ~2,000 | ~300 | 5 pages condensed |
| Report synthesis | ~4,000 | ~800 | Full report as input |
| Future: SEO analysis | ~1,500 | ~500 | Meta tags + headings |
| Future: Accessibility | ~3,000 | ~600 | DOM structure analysis |

### Model pricing (as of early 2026, approximate)

| Tier | Input (per 1M tokens) | Output (per 1M tokens) |
|------|----------------------|------------------------|
| Haiku | ~$0.80 | ~$4.00 |
| Sonnet | ~$3.00 | ~$15.00 |
| Opus | ~$15.00 | ~$75.00 |

**Check current pricing at https://docs.anthropic.com/en/docs/about-claude/models — these numbers may be outdated.**

### Cost per triage run (default routing)

With default routing (classify=sonnet, synthesize=sonnet):

```
Classification: 2,000 input × $3/1M + 300 output × $15/1M = $0.006 + $0.005 = $0.011
Synthesis:      4,000 input × $3/1M + 800 output × $15/1M = $0.012 + $0.012 = $0.024
                                                              Total ≈ $0.035 per site
```

With haiku for everything:

```
Classification: 2,000 × $0.80/1M + 300 × $4/1M  = $0.003
Synthesis:      4,000 × $0.80/1M + 800 × $4/1M  = $0.006
                                                    Total ≈ $0.009 per site
```

## Programmatic Token Estimation

Before making an API call, estimate tokens to decide the tier:

```typescript
function estimateTokens(text: string): number {
  // Rough heuristic — good enough for cost estimation
  return Math.ceil(text.length / 4);
}

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  tier: ModelTier,
): number {
  const rates: Record<ModelTier, { input: number; output: number }> = {
    haiku:  { input: 0.80, output: 4.00 },
    sonnet: { input: 3.00, output: 15.00 },
    opus:   { input: 15.00, output: 75.00 },
  };
  const r = rates[tier];
  return (inputTokens * r.input + outputTokens * r.output) / 1_000_000;
}
```

## Budget Guard

Add a cost check before dispatching:

```typescript
const estimated = estimateCost(estimateTokens(prompt), 500, tier);
if (estimated > config.maxCostPerTask) {
  throw new Error(
    `Estimated cost $${estimated.toFixed(4)} exceeds limit $${config.maxCostPerTask}. ` +
    `Reduce input size or use a cheaper tier.`
  );
}
```

Add `maxCostPerTask: z.number().positive().default(0.10)` to `OrchestratorConfigSchema`.
