import { describe, expect, test } from "bun:test";
import YAML from "yaml";
import { generateKcpManifest } from "../src/generators/kcp-manifest.js";
import type { SiteIdentity, ContentClassification, SiteSynthesis, SiteProject } from "../src/schemas/index.js";

const site: SiteIdentity = {
	url: "https://example.com",
	domain: "example.com",
	discoveredAt: new Date().toISOString(),
};

const classification: ContentClassification = {
	primaryCategory: "saas",
	secondaryCategories: [],
	confidence: 0.9,
	topics: [],
	techStack: [],
	reasoning: "test",
};

const synthesis: SiteSynthesis = {
	narrative: "A test site.",
	apiEndpoints: [],
	keyCapabilities: [],
	interactionModel: "read-only",
};

function makeProject(overrides: Partial<SiteProject> = {}): SiteProject {
	return {
		claudeMd: "",
		readmeMd: "",
		sitemapMd: "",
		skills: [],
		apis: [],
		...overrides,
	};
}

function parseManifest(yaml: string) {
	return YAML.parse(yaml);
}

function getSkillTriggers(yaml: string, skillName: string): string[] {
	const manifest = parseManifest(yaml);
	const unit = manifest.units.find((u: { id: string }) => u.id === `skill-${skillName}`);
	return unit?.triggers ?? [];
}

describe("generateKcpManifest skill triggers", () => {
	test("single-word skill includes skill name and word trigger", () => {
		const yaml = generateKcpManifest(site, classification, synthesis,
			makeProject({ skills: [{ name: "navigate", content: "" }] }));
		const triggers = getSkillTriggers(yaml, "navigate");
		expect(triggers).toContain("navigate");
		expect(triggers.length).toBeGreaterThanOrEqual(1);
	});

	test("multi-word skill produces skill name plus individual words", () => {
		const yaml = generateKcpManifest(site, classification, synthesis,
			makeProject({ skills: [{ name: "search-products", content: "" }] }));
		const triggers = getSkillTriggers(yaml, "search-products");
		expect(triggers).toEqual(["search-products", "search", "products"]);
	});

	test("skill with short words filters them out", () => {
		const yaml = generateKcpManifest(site, classification, synthesis,
			makeProject({ skills: [{ name: "go-to", content: "" }] }));
		const triggers = getSkillTriggers(yaml, "go-to");
		expect(triggers).toEqual(["go-to"]);
	});
});

describe("RFC-0009 authority blocks", () => {
	test("manifest has kcp_version 0.12", () => {
		const yaml = generateKcpManifest(site, classification, synthesis, makeProject());
		const manifest = parseManifest(yaml);
		expect(manifest.kcp_version).toBe("0.12");
	});

	test("root-level authority defaults are conservative", () => {
		const yaml = generateKcpManifest(site, classification, synthesis, makeProject());
		const manifest = parseManifest(yaml);
		expect(manifest.authority).toBeDefined();
		expect(manifest.authority.read).toBe("initiative");
		expect(manifest.authority.summarize).toBe("initiative");
		expect(manifest.authority.modify).toBe("requires_approval");
		expect(manifest.authority.execute).toBe("denied");
		expect(manifest.authority.share_externally).toBe("denied");
	});

	test("verified API has execute: requires_approval", () => {
		const project = makeProject({
			apis: [{ name: "products", path: "apis/products.md", content: "", confidence: "verified" }],
		});
		const yaml = generateKcpManifest(site, classification, synthesis, project);
		const manifest = parseManifest(yaml);
		const api = manifest.units.find((u: { id: string }) => u.id === "api-products");
		expect(api.authority.read).toBe("initiative");
		expect(api.authority.execute).toBe("requires_approval");
	});

	test("inferred API has execute: requires_approval, share_externally: denied", () => {
		const project = makeProject({
			apis: [{ name: "chat", path: "apis/chat.md", content: "", confidence: "inferred" }],
		});
		const yaml = generateKcpManifest(site, classification, synthesis, project);
		const manifest = parseManifest(yaml);
		const api = manifest.units.find((u: { id: string }) => u.id === "api-chat");
		expect(api.authority.read).toBe("initiative");
		expect(api.authority.execute).toBe("requires_approval");
		expect(api.authority.share_externally).toBe("denied");
	});

	test("rumor API has execute: denied, summarize: requires_approval", () => {
		const project = makeProject({
			apis: [{ name: "admin", path: "apis/admin.md", content: "", confidence: "rumor" }],
		});
		const yaml = generateKcpManifest(site, classification, synthesis, project);
		const manifest = parseManifest(yaml);
		const api = manifest.units.find((u: { id: string }) => u.id === "api-admin");
		expect(api.authority.read).toBe("initiative");
		expect(api.authority.summarize).toBe("requires_approval");
		expect(api.authority.execute).toBe("denied");
		expect(api.authority.share_externally).toBe("denied");
	});

	test("skill units have authority: read+summarize initiative, execute requires_approval", () => {
		const project = makeProject({
			skills: [{ name: "authenticate", content: "" }],
		});
		const yaml = generateKcpManifest(site, classification, synthesis, project);
		const manifest = parseManifest(yaml);
		const skill = manifest.units.find((u: { id: string }) => u.id === "skill-authenticate");
		expect(skill.authority).toBeDefined();
		expect(skill.authority.read).toBe("initiative");
		expect(skill.authority.summarize).toBe("initiative");
		expect(skill.authority.execute).toBe("requires_approval");
	});

	test("knowledge units without explicit authority inherit root defaults", () => {
		const yaml = generateKcpManifest(site, classification, synthesis, makeProject());
		const manifest = parseManifest(yaml);
		const overview = manifest.units.find((u: { id: string }) => u.id === "site-overview");
		// Knowledge units don't set per-unit authority — they inherit root defaults
		expect(overview.authority).toBeUndefined();
	});
});
