import { z } from "zod";

// ─── Site Identity ───────────────────────────────────────────────
export const SiteIdentitySchema = z.object({
	url: z.string().url(),
	domain: z.string(),
	title: z.string().optional(),
	description: z.string().optional(),
	language: z.string().optional(),
	discoveredAt: z.string().datetime(),
});
export type SiteIdentity = z.infer<typeof SiteIdentitySchema>;

// ─── Crawl Result ────────────────────────────────────────────────
export const CrawlPageSchema = z.object({
	url: z.string().url(),
	statusCode: z.number().int(),
	contentType: z.string(),
	title: z.string().optional(),
	headings: z.array(z.object({ level: z.number().int(), text: z.string() })),
	links: z.array(z.object({ href: z.string(), text: z.string(), rel: z.string().optional() })),
	metaTags: z.record(z.string()),
	bodyTextPreview: z.string().describe("First ~2000 chars of visible text"),
	crawledAt: z.string().datetime(),
});
export type CrawlPage = z.infer<typeof CrawlPageSchema>;

export const CrawlResultSchema = z.object({
	site: SiteIdentitySchema,
	pages: z.array(CrawlPageSchema),
	sitemapUrls: z.array(z.string().url()).optional(),
	robotsTxt: z.string().optional(),
});
export type CrawlResult = z.infer<typeof CrawlResultSchema>;

// ─── Content Classification ──────────────────────────────────────
export const ContentCategorySchema = z.enum([
	"ecommerce",
	"blog",
	"news",
	"saas",
	"portfolio",
	"documentation",
	"government",
	"education",
	"social",
	"forum",
	"other",
]);

export const ContentClassificationSchema = z.object({
	primaryCategory: ContentCategorySchema,
	secondaryCategories: z.array(ContentCategorySchema),
	confidence: z.number().min(0).max(1),
	topics: z.array(z.string()).describe("Key topics/themes identified"),
	techStack: z.array(z.string()).describe("Detected frameworks, CMS, etc."),
	reasoning: z.string().describe("LLM's rationale for the classification"),
});
export type ContentClassification = z.infer<typeof ContentClassificationSchema>;

// ─── Security Headers Audit ──────────────────────────────────────
export const SecurityHeaderCheckSchema = z.object({
	header: z.string(),
	present: z.boolean(),
	value: z.string().optional(),
	grade: z.enum(["pass", "warn", "fail", "info"]),
	recommendation: z.string().optional(),
});

export const SecurityAuditSchema = z.object({
	url: z.string().url(),
	tlsVersion: z.string().optional(),
	tlsValid: z.boolean(),
	headers: z.array(SecurityHeaderCheckSchema),
	overallGrade: z.enum(["A", "B", "C", "D", "F"]),
	vulnerabilities: z.array(
		z.object({
			type: z.string(),
			severity: z.enum(["low", "medium", "high", "critical"]),
			description: z.string(),
		}),
	),
	auditedAt: z.string().datetime(),
});
export type SecurityAudit = z.infer<typeof SecurityAuditSchema>;

// ─── Full Triage Report ──────────────────────────────────────────
export const TriageReportSchema = z.object({
	version: z.literal("0.1.0"),
	site: SiteIdentitySchema,
	crawl: CrawlResultSchema,
	classification: ContentClassificationSchema,
	security: SecurityAuditSchema,
	generatedAt: z.string().datetime(),
	orchestrationMeta: z.object({
		orchestratorModel: z.string(),
		delegatedTasks: z.array(
			z.object({
				task: z.string(),
				model: z.string(),
				durationMs: z.number(),
				tokenUsage: z.object({ input: z.number(), output: z.number() }),
			}),
		),
	}),
});
export type TriageReport = z.infer<typeof TriageReportSchema>;
