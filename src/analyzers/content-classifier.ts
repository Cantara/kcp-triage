import type { ContentClassification, CrawlResult } from "../schemas/index.js";
import { ContentClassificationSchema } from "../schemas/index.js";
import type { Dispatcher, TaskResult } from "../orchestration/dispatcher.js";
import type { TaskRouting } from "../orchestration/config.js";

const VALID_CATEGORIES = ["ecommerce", "blog", "news", "saas", "portfolio", "documentation", "government", "education", "social", "forum", "other"] as const;

const SYSTEM_PROMPT = `You are a website content classifier. Given crawl data from a website, classify it into categories and extract key information.

Respond ONLY with a JSON object matching this schema:
{
  "primaryCategory": one of "ecommerce"|"blog"|"news"|"saas"|"portfolio"|"documentation"|"government"|"education"|"social"|"forum"|"other",
  "secondaryCategories": array of zero or more values, each must be one of "ecommerce"|"blog"|"news"|"saas"|"portfolio"|"documentation"|"government"|"education"|"social"|"forum"|"other",
  "confidence": number 0-1,
  "topics": string[],
  "techStack": string[],
  "reasoning": string
}

IMPORTANT: secondaryCategories values MUST come from the same enum as primaryCategory. Do not invent new category names.
No markdown fences. No preamble. Just the JSON object.`;

export async function classifyContent(
	crawl: CrawlResult,
	dispatcher: Dispatcher,
	routing: TaskRouting,
): Promise<TaskResult<ContentClassification>> {
	const condensed = {
		domain: crawl.site.domain,
		pageCount: crawl.pages.length,
		pages: crawl.pages.slice(0, 5).map((p) => ({
			url: p.url,
			title: p.title,
			headings: p.headings.slice(0, 10),
			metaTags: p.metaTags,
			bodyPreview: p.bodyTextPreview.slice(0, 500),
		})),
	};

	return dispatcher.dispatch({
		tier: routing.classify,
		system: SYSTEM_PROMPT,
		prompt: JSON.stringify(condensed, null, 2),
		parse: (raw) => {
			const obj = JSON.parse(raw);
			// Filter out any secondary categories that aren't in the valid enum
			if (Array.isArray(obj.secondaryCategories)) {
				obj.secondaryCategories = obj.secondaryCategories.filter((c: unknown) =>
					VALID_CATEGORIES.includes(c as (typeof VALID_CATEGORIES)[number]),
				);
			}
			return ContentClassificationSchema.parse(obj);
		},
	});
}
