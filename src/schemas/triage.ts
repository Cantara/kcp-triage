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
	links: z.array(
		z.object({
			href: z.string(),
			text: z.string(),
			rel: z.string().optional(),
		}),
	),
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

// ─── Site Synthesis ──────────────────────────────────────────────
export const SiteSynthesisSchema = z.object({
	narrative: z
		.string()
		.describe("Human-readable summary of what the site does and who it is for"),
	apiEndpoints: z
		.array(z.string())
		.describe("Discovered API or service endpoints"),
	authentication: z
		.string()
		.optional()
		.describe("Detected authentication method (e.g. OAuth, API key, none)"),
	keyCapabilities: z
		.array(z.string())
		.describe("Top capabilities/features of the site"),
	interactionModel: z
		.enum(["read-only", "authenticated", "api-first", "cms", "unknown"])
		.describe("How agents would interact with this site"),
});
export type SiteSynthesis = z.infer<typeof SiteSynthesisSchema>;

// ─── Site Project ────────────────────────────────────────────────
export const SiteProjectFileSchema = z.object({
	path: z.string().describe("Relative file path within the site directory"),
	content: z.string().describe("File content"),
});

export const ApiEntrySchema = z.object({
	name: z.string(),
	path: z.string().describe("Relative file path, e.g. apis/products-api.md"),
	content: z.string(),
	confidence: z.enum(["verified", "inferred", "rumor"]),
});

export const SiteProjectSchema = z.object({
	claudeMd: z
		.string()
		.describe("CLAUDE.md content — LLM orientation for working with this site"),
	readmeMd: z.string().describe("README.md — human-readable project card"),
	sitemapMd: z.string().describe("sitemap.md — structured navigation model"),
	skills: z.array(
		z.object({
			name: z
				.string()
				.describe("Skill filename without extension, e.g. navigate"),
			content: z.string().describe("Skill markdown content"),
		}),
	),
	apis: z.array(ApiEntrySchema),
	unknowns: z
		.string()
		.optional()
		.describe("unknowns.md content — empty/absent if no unknowns"),
});
export type SiteProject = z.infer<typeof SiteProjectSchema>;

// ─── Security Headers Audit ──────────────────────────────────────
export const SecurityHeaderCheckSchema = z.object({
	header: z.string(),
	present: z.boolean(),
	value: z.string().optional(),
	grade: z.enum(["pass", "warn", "fail", "info"]),
	recommendation: z.string().optional(),
});

export const SecurityTransportSchema = z.object({
	httpUrl: z.string().url(),
	httpsUrl: z.string().url(),
	httpStatusCode: z.number().int().optional(),
	httpsStatusCode: z.number().int().optional(),
	httpRedirectsToHttps: z.boolean(),
	redirectLocation: z.string().optional(),
});

export const SecurityAuditSchema = z.object({
	url: z.string().url(),
	tlsVersion: z.string().optional(),
	tlsValid: z.boolean(),
	transport: SecurityTransportSchema,
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
	synthesis: SiteSynthesisSchema,
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

// ─── Triage Log ──────────────────────────────────────────────────
export const TriageLogEntrySchema = z.object({
	id: z.string().describe("Unique entry ID: <domain>-<ISO date>"),
	timestamp: z.string().datetime(),
	domain: z.string(),
	url: z.string().url(),
	goal: z.string().describe("Why this triage was initiated — user intent or automation trigger"),
	pipelineVersion: z.string().describe("kcp-triage version at time of run"),
	stepsRun: z.array(z.string()).describe("Pipeline steps executed: crawl, classify, security, spa, synthesize, generate, kcp, qc"),
	results: z.object({
		category: z.string().describe("Primary classification"),
		securityGrade: z.string().describe("A-F"),
		interactionModel: z.string(),
		qcVerdict: z.string().optional().describe("clean/suspicious/contaminated"),
		pagesCrawled: z.number(),
	}),
	learnings: z.array(z.string()).describe("What was learned that isn't captured in site artifacts — meta observations, pipeline improvements needed, unexpected findings"),
	problems: z.array(z.string()).optional().describe("Shortcomings, failures, things that didn't work"),
	followUp: z.array(z.string()).optional().describe("Ideas for next triage or pipeline improvements"),
});
export type TriageLogEntry = z.infer<typeof TriageLogEntrySchema>;

export const TriageLogSchema = z.object({
	version: z.literal("1.0"),
	entries: z.array(TriageLogEntrySchema),
});
export type TriageLog = z.infer<typeof TriageLogSchema>;
