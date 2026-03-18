import * as cheerio from "cheerio";
import type { CrawlPage, CrawlResult, SiteIdentity } from "../schemas/index.js";

export interface CrawlOptions {
	maxPages: number;
	timeoutMs: number;
}

/**
 * Crawl a site starting from `url`, collecting up to `maxPages` pages.
 * This is the deterministic (non-LLM) portion — pure fetch + HTML parsing.
 */
export async function crawlSite(url: string, options: CrawlOptions): Promise<CrawlResult> {
	const base = new URL(url);
	const visited = new Set<string>();
	const pages: CrawlPage[] = [];
	const queue: string[] = [base.href];

	while (queue.length > 0 && pages.length < options.maxPages) {
		const current = queue.shift();
		if (!current || visited.has(current)) continue;
		visited.add(current);

		try {
			const page = await fetchAndParse(current, options.timeoutMs);
			pages.push(page);

			// Politeness delay between requests
			if (pages.length < options.maxPages) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}

			// Enqueue same-origin links
			for (const link of page.links) {
				try {
					const resolved = new URL(link.href, current);
					if (resolved.hostname === base.hostname && !visited.has(resolved.href)) {
						queue.push(resolved.href);
					}
				} catch {
					// skip malformed URLs
				}
			}
		} catch (err) {
			// Log but continue — partial crawl is fine
			console.warn(`[crawl] Failed to fetch ${current}:`, err);
		}
	}

	const site: SiteIdentity = {
		url: base.href,
		domain: base.hostname,
		title: pages[0]?.title,
		discoveredAt: new Date().toISOString(),
	};

	return { site, pages };
}

async function fetchAndParse(url: string, timeoutMs: number): Promise<CrawlPage> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "kcp-triage-bot/0.1.0 (+https://github.com/StigLau/kcp-triage)" },
		});
		const html = await res.text();
		const $ = cheerio.load(html);

		const headings = $("h1, h2, h3, h4, h5, h6")
			.map((_, el) => ({
				level: Number.parseInt(el.tagName.slice(1), 10),
				text: $(el).text().trim(),
			}))
			.get();

		const links = $("a[href]")
			.map((_, el) => ({
				href: $(el).attr("href") ?? "",
				text: $(el).text().trim(),
				rel: $(el).attr("rel"),
			}))
			.get();

		const metaTags: Record<string, string> = {};
		$("meta[name], meta[property]").each((_, el) => {
			const key = $(el).attr("name") ?? $(el).attr("property") ?? "";
			const content = $(el).attr("content") ?? "";
			if (key) metaTags[key] = content;
		});

		const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);

		return {
			url,
			statusCode: res.status,
			contentType: res.headers.get("content-type") ?? "unknown",
			title: $("title").text().trim() || undefined,
			headings,
			links,
			metaTags,
			bodyTextPreview: bodyText,
			crawledAt: new Date().toISOString(),
		};
	} finally {
		clearTimeout(timer);
	}
}
