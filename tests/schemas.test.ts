import { describe, expect, test } from "bun:test";
import {
	ContentClassificationSchema,
	SecurityAuditSchema,
	SiteIdentitySchema,
	TriageReportSchema,
} from "../src/schemas/index.js";

describe("SiteIdentitySchema", () => {
	test("accepts valid site identity", () => {
		const result = SiteIdentitySchema.safeParse({
			url: "https://example.com",
			domain: "example.com",
			title: "Example",
			discoveredAt: new Date().toISOString(),
		});
		expect(result.success).toBe(true);
	});

	test("rejects invalid URL", () => {
		const result = SiteIdentitySchema.safeParse({
			url: "not-a-url",
			domain: "example.com",
			discoveredAt: new Date().toISOString(),
		});
		expect(result.success).toBe(false);
	});
});

describe("ContentClassificationSchema", () => {
	test("accepts valid classification", () => {
		const result = ContentClassificationSchema.safeParse({
			primaryCategory: "saas",
			secondaryCategories: ["documentation"],
			confidence: 0.87,
			topics: ["project management", "collaboration"],
			techStack: ["React", "Next.js"],
			reasoning:
				"The site features pricing pages and a signup flow typical of SaaS products.",
		});
		expect(result.success).toBe(true);
	});

	test("rejects confidence out of range", () => {
		const result = ContentClassificationSchema.safeParse({
			primaryCategory: "blog",
			secondaryCategories: [],
			confidence: 1.5,
			topics: [],
			techStack: [],
			reasoning: "test",
		});
		expect(result.success).toBe(false);
	});

	test("rejects unknown category", () => {
		const result = ContentClassificationSchema.safeParse({
			primaryCategory: "spaceship",
			secondaryCategories: [],
			confidence: 0.5,
			topics: [],
			techStack: [],
			reasoning: "test",
		});
		expect(result.success).toBe(false);
	});
});

describe("SecurityAuditSchema", () => {
	test("accepts valid audit", () => {
		const result = SecurityAuditSchema.safeParse({
			url: "https://example.com",
			tlsValid: true,
			transport: {
				httpUrl: "http://example.com",
				httpsUrl: "https://example.com",
				httpStatusCode: 301,
				httpsStatusCode: 200,
				httpRedirectsToHttps: true,
				redirectLocation: "https://example.com/",
			},
			headers: [
				{
					header: "strict-transport-security",
					present: true,
					value: "max-age=31536000",
					grade: "pass",
				},
			],
			overallGrade: "B",
			vulnerabilities: [],
			auditedAt: new Date().toISOString(),
		});
		expect(result.success).toBe(true);
	});
});
