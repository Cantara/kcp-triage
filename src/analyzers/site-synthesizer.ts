import type { ContentClassification, CrawlResult, SecurityAudit, SiteSynthesis } from "../schemas/index.js";
import { SiteSynthesisSchema } from "../schemas/index.js";
import type { Dispatcher, TaskResult } from "../orchestration/dispatcher.js";
import type { TaskRouting } from "../orchestration/config.js";

const SYSTEM_PROMPT = `You are a web service analyst. Given crawl data, content classification, and security audit results for a website, produce a structured synthesis for an AI agent that needs to understand and interact with this site.

Respond ONLY with a JSON object matching this schema:
{
  "narrative": string (2-4 sentence description of the site, its purpose, and audience),
  "apiEndpoints": string[] (any discovered API endpoints or service URLs — empty array if none found),
  "authentication": string | null (detected auth method or null),
  "keyCapabilities": string[] (3-7 key things this site does),
  "interactionModel": one of "read-only"|"authenticated"|"api-first"|"cms"|"unknown"
}

No markdown fences. No preamble. Just the JSON object.`;

export async function synthesizeSite(
	crawl: CrawlResult,
	classification: ContentClassification,
	security: SecurityAudit,
	dispatcher: Dispatcher,
	routing: TaskRouting,
): Promise<TaskResult<SiteSynthesis>> {
	const input = {
		domain: crawl.site.domain,
		title: crawl.site.title,
		description: crawl.site.description,
		pageCount: crawl.pages.length,
		primaryCategory: classification.primaryCategory,
		topics: classification.topics,
		techStack: classification.techStack,
		classificationReasoning: classification.reasoning,
		securityGrade: security.overallGrade,
		pages: crawl.pages.slice(0, 8).map((p) => ({
			url: p.url,
			title: p.title,
			headings: p.headings.slice(0, 8),
			bodyPreview: p.bodyTextPreview.slice(0, 400),
		})),
	};

	return dispatcher.dispatch({
		tier: routing.synthesize,
		system: SYSTEM_PROMPT,
		prompt: JSON.stringify(input, null, 2),
		parse: (raw) => {
			const obj = JSON.parse(raw);
			// LLM may return null for optional fields — coerce to undefined
			if (obj.authentication === null) obj.authentication = undefined;
			return SiteSynthesisSchema.parse(obj);
		},
	});
}
