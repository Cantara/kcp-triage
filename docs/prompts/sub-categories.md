# Sub-Category Classification Pattern

## The Problem

The flat taxonomy (`ecommerce`, `blog`, `saas`, etc.) doesn't capture nuance. An ecommerce site might be B2B vs B2C, a blog might be personal vs corporate, a SaaS might be developer tools vs business tools.

## Approach: Two-Level Classification

Keep the top-level enum unchanged (it's the contract), but add an optional `subCategory` field.

### 1. Extend the schema

```typescript
// In src/schemas/triage.ts:
export const ContentClassificationSchema = z.object({
  primaryCategory: ContentCategorySchema,
  subCategory: z.string().optional().describe("Finer-grained classification within primaryCategory"),
  secondaryCategories: z.array(ContentCategorySchema),
  confidence: z.number().min(0).max(1),
  topics: z.array(z.string()),
  techStack: z.array(z.string()),
  reasoning: z.string(),
});
```

### 2. Update the system prompt

Add a sub-category instruction block:

```
After determining the primaryCategory, also provide a subCategory string for finer classification.

Examples of subCategories by primary:
- ecommerce: "b2b", "b2c", "marketplace", "dropship"
- blog: "personal", "corporate", "technical", "lifestyle"
- saas: "devtools", "business", "creative", "analytics"
- news: "mainstream", "niche", "aggregator", "local"
- documentation: "api-reference", "tutorial", "knowledge-base"
```

### 3. Validation approach

Since `subCategory` is a free-form string (not an enum), validate it loosely. The orchestrator can use it for routing decisions without strict type safety — it's a hint, not a contract.

### Alternative: Enum per Category

If you want strict typing, use a discriminated union:

```typescript
const SubCategoryMap = {
  ecommerce: z.enum(["b2b", "b2c", "marketplace", "dropship"]),
  blog: z.enum(["personal", "corporate", "technical", "lifestyle"]),
  // ...
} as const;
```

This is more robust but harder to extend — every new sub-category requires a schema change.
