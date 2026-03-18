import type { ContentClassification, CrawlResult, SecurityAudit, SiteSynthesis, SiteProject } from "../schemas/index.js";
import { SiteProjectSchema } from "../schemas/index.js";
import type { Dispatcher, TaskResult } from "../orchestration/dispatcher.js";
import type { TaskRouting } from "../orchestration/config.js";

const SYSTEM_PROMPT = `You are a site documentation generator for the KCP (Knowledge Context Protocol) system. Given triage data about a website — crawl results, content classification, security audit, and synthesis — generate a set of project files that will orient an LLM agent to work with this site effectively.

Scale output to site complexity:
- Simple read-only sites (blogs, docs): minimal skills, no API docs, brief CLAUDE.md
- Interactive sites (e-commerce, SaaS): detailed skills per workflow, API inventory, auth docs
- API-first sites: comprehensive API docs with endpoints, params, response shapes

Respond ONLY with a JSON object matching this schema:
{
  "claudeMd": string (Markdown — site orientation for LLM: identity, interaction model, allowed ops, navigation, APIs summary, tech stack, rate limits, skills list),
  "readmeMd": string (Markdown — human-readable project card, 5-15 lines),
  "sitemapMd": string (Markdown — site sections, URL patterns, navigation flows),
  "skills": [{"name": string, "content": string}] (site-specific skill files — only include skills relevant to this site type),
  "apis": [{"name": string, "path": string, "content": string, "confidence": "verified"|"inferred"|"rumor"}] (API inventory — empty array if no APIs found),
  "unknowns": string | null (suspected but unverified features/APIs with evidence and verification steps — null if none)
}

Guidelines for CLAUDE.md:
- Start with site identity (domain, title, what it is)
- Interaction model: read-only / authenticated / api-first / cms
- Allowed operations: distinguish between three levels:
  1. "Always allowed" — reading, browsing, searching (no user auth needed)
  2. "With user authorization" — adding to cart, starting checkout, submitting forms (agent may do this when explicitly instructed by user, but MUST stop before payment/irreversible actions)
  3. "Never do" — completing payment, deleting data, bypassing auth
- Navigation: URL patterns, key entry points
- Tech stack: detected frameworks/CMS
- If APIs exist: summary table pointing to apis/ directory
- Rate limiting note: be polite, respect robots.txt crawl-delay
- List available skills — IMPORTANT: the skill names listed here MUST exactly match the "name" field in the skills array (these become filenames like skills/<name>.md)

Guidelines for skills:
- Each skill should be a focused how-to for one operation
- Always include a "navigate" skill
- Only add skills that match what the site actually supports
- For blogs: navigate (archive, labels, posts)
- For e-commerce: MUST include an "order-flow" skill documenting the full purchase path (browse → select → add to cart → checkout → STOP before payment). Document each step, what inputs are needed, what the expected UI/API responses are. Note where the agent must stop and hand off to the human.
- For transit/travel sites: include a "plan-trip" skill documenting how to search routes, interpret results, and understand the journey options
- For SaaS/API: navigate, authenticate, api-usage
- For sites with separate subdomains or SPAs (e.g., a journey planner, applicant portal, cart system): document how to access and use these even if they weren't directly crawled

Guidelines for unknowns:
- Each entry: what's suspected, evidence, confidence (low/medium/high), how to verify
- IMPORTANT: If the site has separate subdomains or SPAs (e.g., SPA journey planners, separate portals), these almost certainly have backend APIs. Document these as "inferred" or "rumor" unknowns with notes on how to investigate (e.g., "check browser network tab", "inspect XHR calls")
- Include unknowns even for read-only informational sites if they link to interactive subdomains

No markdown fences around the JSON. No preamble. Just the JSON object.`;

export async function generateSiteProject(
	crawl: CrawlResult,
	classification: ContentClassification,
	security: SecurityAudit,
	synthesis: SiteSynthesis,
	dispatcher: Dispatcher,
	routing: TaskRouting,
): Promise<TaskResult<SiteProject>> {
	const input = {
		domain: crawl.site.domain,
		url: crawl.site.url,
		title: crawl.site.title,
		description: crawl.site.description,
		language: crawl.site.language,
		classification: {
			primary: classification.primaryCategory,
			secondary: classification.secondaryCategories,
			topics: classification.topics,
			techStack: classification.techStack,
			reasoning: classification.reasoning,
		},
		synthesis: {
			narrative: synthesis.narrative,
			interactionModel: synthesis.interactionModel,
			keyCapabilities: synthesis.keyCapabilities,
			apiEndpoints: synthesis.apiEndpoints,
			authentication: synthesis.authentication,
		},
		security: {
			grade: security.overallGrade,
			missingHeaders: security.headers.filter(h => h.grade === "fail").map(h => h.header),
		},
		crawl: {
			pageCount: crawl.pages.length,
			robotsTxt: crawl.robotsTxt?.slice(0, 500),
			sitemapUrls: crawl.sitemapUrls,
			pages: crawl.pages.slice(0, 10).map(p => ({
				url: p.url,
				title: p.title,
				headings: p.headings.slice(0, 5),
				bodyPreview: p.bodyTextPreview.slice(0, 300),
				links: p.links.slice(0, 15).map(l => ({ href: l.href, text: l.text })),
			})),
		},
	};

	return dispatcher.dispatch({
		tier: routing.generate,
		system: SYSTEM_PROMPT,
		prompt: JSON.stringify(input, null, 2),
		maxTokens: 32768,
		parse: (raw) => {
			// Strip markdown fences if present
			const stripped = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
			const obj = JSON.parse(stripped);
			// LLM may return null for optional fields — coerce to undefined
			if (obj.unknowns === null) obj.unknowns = undefined;
			// Ensure arrays exist
			if (!Array.isArray(obj.skills)) obj.skills = [];
			if (!Array.isArray(obj.apis)) obj.apis = [];
			return SiteProjectSchema.parse(obj);
		},
	});
}
