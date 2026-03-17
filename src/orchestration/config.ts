import { z } from "zod";

export const ModelTierSchema = z.enum(["opus", "sonnet", "haiku"]);
export type ModelTier = z.infer<typeof ModelTierSchema>;

export const TaskRoutingSchema = z.object({
	crawl: ModelTierSchema.default("haiku"),
	classify: ModelTierSchema.default("sonnet"),
	securityAudit: ModelTierSchema.default("haiku"),
	synthesize: ModelTierSchema.default("sonnet"),
});
export type TaskRouting = z.infer<typeof TaskRoutingSchema>;

export const OrchestratorConfigSchema = z.object({
	/** Which model handles which task — override defaults to push work to cheaper tiers */
	routing: TaskRoutingSchema.default({}),
	/** Max pages to crawl per site */
	maxCrawlPages: z.number().int().positive().default(20),
	/** Timeout per HTTP request in ms */
	requestTimeoutMs: z.number().int().positive().default(10_000),
	/** Where to write the final triage report */
	outputDir: z.string().default("./triage-output"),
	/** Anthropic API key — falls back to ANTHROPIC_API_KEY env var */
	apiKey: z.string().optional(),
});
export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

export const MODEL_IDS: Record<ModelTier, string> = {
	opus: "claude-opus-4-20250514",
	sonnet: "claude-sonnet-4-20250514",
	haiku: "claude-haiku-4-5-20251001",
};

export const DEFAULT_CONFIG: OrchestratorConfig = OrchestratorConfigSchema.parse({});
