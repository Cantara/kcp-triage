import type { SiteIdentity, ContentClassification, SiteSynthesis, SiteProject } from "../schemas/index.js";
import YAML from "yaml";

/**
 * Generate a KCP (Knowledge Context Protocol) knowledge.yaml manifest.
 * This is deterministic — no LLM call. It indexes the generated project files
 * so any AI agent framework can discover and selectively load site knowledge.
 *
 * Spec: https://github.com/Cantara/knowledge-context-protocol
 */
export function generateKcpManifest(
	site: SiteIdentity,
	classification: ContentClassification,
	synthesis: SiteSynthesis,
	project: SiteProject,
): string {
	const now: string = new Date().toISOString().split("T")[0]!; // YYYY-MM-DD

	const units: KcpUnit[] = [
		{
			id: "site-overview",
			path: "CLAUDE.md",
			intent: `What is ${site.domain} and how should an AI agent interact with it?`,
			scope: "global",
			audience: ["agent", "developer"],
			kind: "knowledge",
			format: "markdown",
			validated: now,
			update_frequency: "monthly",
			hints: {
				load_strategy: "eager",
				priority: "critical",
				density: "dense",
			},
		},
		{
			id: "site-readme",
			path: "README.md",
			intent: `What is the ${site.domain} triage project?`,
			scope: "global",
			audience: ["human", "developer"],
			kind: "knowledge",
			format: "markdown",
			validated: now,
			hints: {
				load_strategy: "lazy",
				priority: "supplementary",
			},
		},
		{
			id: "sitemap",
			path: "sitemap.md",
			intent: `What are the URL patterns and navigation structure of ${site.domain}?`,
			scope: "global",
			audience: ["agent"],
			kind: "knowledge",
			format: "markdown",
			validated: now,
			depends_on: ["site-overview"],
			hints: {
				load_strategy: "eager",
				priority: "critical",
			},
		},
		{
			id: "triage-report",
			path: "triage-report.json",
			intent: `What are the raw crawl, classification, and security audit results for ${site.domain}?`,
			scope: "global",
			audience: ["developer"],
			kind: "schema",
			format: "json",
			validated: now,
			hints: {
				load_strategy: "never",
				priority: "reference",
				density: "verbose",
			},
		},
	];

	// Skills
	for (const skill of project.skills) {
		const skillLabel = skill.name.replace(/-/g, " ");
		// Extract meaningful trigger words (skip short filler words)
		const triggerWords = skill.name.split("-").filter(w => w.length > 2);
		units.push({
			id: `skill-${skill.name}`,
			path: `skills/${skill.name}.md`,
			intent: `How to ${skillLabel} on ${site.domain}`,
			scope: "module",
			audience: ["agent"],
			kind: "knowledge",
			format: "markdown",
			validated: now,
			depends_on: ["site-overview"],
			triggers: [skill.name, ...triggerWords],
			hints: {
				load_strategy: "lazy",
				priority: "supplementary",
			},
		});
	}

	// APIs
	for (const api of project.apis) {
		units.push({
			id: `api-${api.name}`,
			path: api.path,
			intent: `What is the ${api.name} API on ${site.domain}?`,
			scope: "module",
			audience: ["agent", "developer"],
			kind: "service",
			format: "markdown",
			validated: now,
			depends_on: ["site-overview"],
			access: api.confidence === "verified" ? "public" : "restricted",
			hints: {
				load_strategy: "lazy",
				priority: api.confidence === "verified" ? "critical" : "supplementary",
			},
		});
	}

	// Unknowns
	if (project.unknowns) {
		units.push({
			id: "unknowns",
			path: "unknowns.md",
			intent: `What suspected but unverified features or APIs exist on ${site.domain}?`,
			scope: "global",
			audience: ["agent", "developer"],
			kind: "knowledge",
			format: "markdown",
			validated: now,
			depends_on: ["site-overview"],
			hints: {
				load_strategy: "lazy",
				priority: "supplementary",
			},
		});
	}

	const manifest = {
		kcp_version: "0.10",
		project: site.domain,
		version: "1.0.0",
		updated: now,
		language: site.language ?? "nb",
		indexing: "read-only",
		rate_limits: {
			note: "Respect robots.txt crawl-delay; minimum 500ms between requests",
		},
		units,
	};

	return YAML.stringify(manifest, { lineWidth: 120 });
}

interface KcpUnit {
	id: string;
	path: string;
	intent: string;
	scope: "global" | "project" | "module";
	audience: string[];
	kind?: string;
	format?: string;
	validated?: string;
	update_frequency?: string;
	depends_on?: string[];
	supersedes?: string;
	triggers?: string[];
	access?: string;
	sensitivity?: string;
	hints?: {
		token_estimate?: number;
		load_strategy?: "eager" | "lazy" | "never";
		priority?: "critical" | "supplementary" | "reference";
		density?: "dense" | "standard" | "verbose";
	};
}
