# Few-Shot Examples for Classification

## When to Use

Add few-shot examples when:
- The classifier consistently misclassifies a specific site type
- You're adding a new category and want to anchor the model's understanding
- Edge cases aren't handled well (e.g., "is GitHub a SaaS or a social platform?")

## Format

Add examples to the system prompt in `src/analyzers/content-classifier.ts` between the schema description and the "No markdown fences" instruction:

```
Here are examples of correct classifications:

Example 1 — SaaS product:
Input: domain=linear.app, pages with pricing, signup, changelog, docs
Output: {"primaryCategory": "saas", "secondaryCategories": ["documentation"], "confidence": 0.95, "topics": ["project management", "issue tracking"], "techStack": ["React", "Next.js"], "reasoning": "Pricing page, signup flow, and product documentation indicate a SaaS product."}

Example 2 — News/blog hybrid:
Input: domain=techcrunch.com, articles with dates, author bylines, categories
Output: {"primaryCategory": "news", "secondaryCategories": ["blog"], "confidence": 0.88, "topics": ["technology", "startups", "venture capital"], "techStack": ["WordPress"], "reasoning": "Dated articles with journalist bylines. Blog-like structure but editorial team indicates news."}
```

## Guidelines

- Keep examples concise — the input description should be a summary, not raw crawl data
- Include 2-4 examples covering the most common edge cases
- Always include the `reasoning` field to show the model what good reasoning looks like
- Rotate examples if you notice the model over-anchoring on them

## Cost Impact

Each few-shot example adds ~100-200 input tokens. With Sonnet at ~$3/M input tokens, 4 examples add roughly $0.0008 per classification. For Haiku (~$0.25/M), it's ~$0.00005. Negligible in both cases.
