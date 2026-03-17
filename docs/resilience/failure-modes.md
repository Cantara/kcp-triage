# Common LLM Failure Modes

A catalogue of things that go wrong when delegating to LLMs, and how this system handles (or should handle) them.

## 1. Malformed JSON

**Symptom**: Zod parse throws. Response contains preamble, markdown fences, or trailing text.

**Frequency**: ~5% with Sonnet, ~15% with Haiku on complex schemas.

**Mitigation**:
- Use the `extractJson()` helper (see prompt-engineering SKILL.md)
- Retry once with a stricter system prompt
- Log the raw response for debugging

## 2. Hallucinated Enum Values

**Symptom**: Model returns a category not in the enum (e.g., "corporate" instead of "saas").

**Frequency**: Rare with Sonnet (~2%), more common with Haiku (~8%).

**Mitigation**:
- Enumerate all valid values explicitly in the system prompt
- Use Zod's `.parse()` which will catch this at runtime
- Consider adding a "closest match" fallback: if the value isn't in the enum, ask the model to pick the closest valid option

## 3. Overconfident Classification

**Symptom**: Model returns 0.95 confidence for ambiguous sites.

**Frequency**: Very common. Models default to high confidence.

**Mitigation**:
- Add confidence calibration instructions to the prompt (see prompt-engineering SKILL.md)
- Post-process: if `secondaryCategories` is non-empty, cap confidence at 0.85
- Use the two-pass pattern: if Haiku returns high confidence, skip Sonnet; otherwise escalate

## 4. Empty or Minimal Response

**Symptom**: Model returns valid JSON but with empty arrays, blank strings, or placeholder values.

**Frequency**: Happens when input context is too thin (e.g., site returned a 403 or was mostly empty).

**Mitigation**:
- Validate response completeness beyond Zod (e.g., `topics.length >= 1`)
- If the crawl returned very little data, skip classification and mark it as `"other"` with low confidence
- Add a minimum content threshold before invoking the LLM

## 5. Response Exceeds Expected Length

**Symptom**: Model writes a long explanation when you asked for JSON only.

**Frequency**: Rare with good system prompts, but happens when the model is "thinking aloud".

**Mitigation**:
- Set `max_tokens` appropriately in the Dispatcher (currently 4096 — reduce for simple schemas)
- The `extractJson()` helper handles this by finding the JSON within longer text

## 6. Inconsistent Tech Stack Detection

**Symptom**: Same site triaged twice returns different tech stacks.

**Frequency**: Common. Tech stack detection from HTML is inherently fuzzy.

**Mitigation**:
- Add deterministic tech stack detection (check for known framework signatures in HTML) as a pre-processing step
- Pass deterministic results to the LLM as "confirmed" and ask it to add any additional detections
- Example signatures: `__NEXT_DATA__` → Next.js, `ng-version` → Angular, `data-reactroot` → React

## 7. Rate Limiting / API Errors

**Symptom**: 429 or 529 from Anthropic API.

**Frequency**: Only under batch processing or rapid successive calls.

**Mitigation**:
- Add exponential backoff in the Dispatcher
- Respect `retry-after` headers
- For batch triage (many sites), add concurrency limits

```typescript
async function withBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      if (i === maxRetries) throw e;
      const isRateLimit = e instanceof Error && e.message.includes("429");
      const delay = isRateLimit ? 2 ** i * 1000 : 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
```

## 8. Context Window Overflow

**Symptom**: API returns error about input exceeding model's context window.

**Frequency**: Only with very large sites (100+ pages crawled with full body text).

**Mitigation**:
- The condensation step in `content-classifier.ts` already limits to 5 pages × 500 chars
- For report synthesis, if the full report exceeds ~50k tokens, summarise the crawl data first
- Add a token estimation check before dispatching (see cost-estimation.md)
