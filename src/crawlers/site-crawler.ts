import * as cheerio from "cheerio";
import type { CrawlPage, CrawlResult, SiteIdentity } from "../schemas/index.js";

export interface CrawlOptions {
	maxPages: number;
	timeoutMs: number;
	politenessDelayMs?: number;
}

/**
 * Crawl a site starting from `url`, collecting up to `maxPages` pages.
 * This is the deterministic (non-LLM) portion — pure fetch + HTML parsing.
 */
export async function crawlSite(url: string, options: CrawlOptions): Promise<CrawlResult> {
	const base = new URL(url);
	const visited = new Set<string>();
	const pages: CrawlPage[] = [];
	const delay = options.politenessDelayMs ?? 500;

	// Strip fragment from a URL to avoid crawling the same page twice
	const stripFragment = (u: string): string => {
		try { const parsed = new URL(u); parsed.hash = ""; return parsed.href; } catch { return u; }
	};

	const queue: string[] = [stripFragment(base.href)];

	while (queue.length > 0 && pages.length < options.maxPages) {
		const current = queue.shift();
		if (!current || visited.has(current)) continue;
		visited.add(current);

		try {
			const page = await fetchAndParse(current, options.timeoutMs);
			pages.push(page);

			// Politeness delay between requests
			if (pages.length < options.maxPages) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			// Only enqueue same-origin links when the page was actually HTML from the target site
			if (page.outcome === "ok") {
				for (const link of page.links) {
					try {
						const resolved = new URL(link.href, current);
						resolved.hash = ""; // strip fragments
						if (resolved.hostname === base.hostname && !visited.has(resolved.href)) {
							queue.push(resolved.href);
						}
					} catch {
						// skip malformed URLs
					}
				}
			}
		} catch (err) {
			// Log but continue — partial crawl is fine
			console.warn(`[crawl] Failed to fetch ${current}:`, err);
		}
	}

	// After BFS loop, fetch robots.txt
	let robotsTxt: string | undefined;
	const sitemapUrls: string[] = [];
	try {
		const robotsUrl = new URL("/robots.txt", base).href;
		const robotsRes = await fetch(robotsUrl, {
			headers: { "User-Agent": "kcp-triage-bot/0.1.0 (+https://github.com/Cantara/kcp-triage)" },
			signal: AbortSignal.timeout(5000),
		});
		if (robotsRes.ok) {
			robotsTxt = await robotsRes.text();
			// Extract sitemap URLs from robots.txt
			for (const line of robotsTxt.split("\n")) {
				const m = line.match(/^Sitemap:\s*(.+)/i);
				if (m?.[1]) sitemapUrls.push(m[1].trim());
			}
		}
	} catch {
		// ignore
	}

	// Populate description and language from first page's meta tags
	const firstPage = pages[0];
	const description =
		firstPage?.metaTags.description ?? firstPage?.metaTags["og:description"];
	const language = firstPage?.metaTags["og:locale"];

	const site: SiteIdentity = {
		url: base.href,
		domain: base.hostname,
		title: firstPage?.title,
		description,
		language,
		discoveredAt: new Date().toISOString(),
	};

	return { site, pages, robotsTxt, sitemapUrls: sitemapUrls.length > 0 ? sitemapUrls : undefined };
}

function classifyCrawlOutcome(
	requestedUrl: string,
	finalUrl: string,
	statusCode: number,
	contentType: string,
): "ok" | "auth-required" | "http-error" | "non-html" {
	const reqHost = new URL(requestedUrl).hostname.toLowerCase();
	const finalParsed = new URL(finalUrl);
	const finalHost = finalParsed.hostname.toLowerCase();
	const finalPath = finalParsed.pathname.toLowerCase();

	if (statusCode === 401 || statusCode === 403) {
		return "auth-required";
	}
	if (
		(finalHost !== reqHost && /(login|auth|sso|idporten|oauth|saml|microsoftonline|okta|auth0)/i.test(finalHost)) ||
		/(\/my\.policy|\/oauth2\/|\/saml|\/login|\/signin)/i.test(finalPath)
	) {
		return "auth-required";
	}
	if (statusCode >= 400) {
		return "http-error";
	}
	if (!contentType.toLowerCase().includes("html")) {
		return "non-html";
	}
	return "ok";
}

async function fetchAndParse(url: string, timeoutMs: number): Promise<CrawlPage> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "kcp-triage-bot/0.1.0 (+https://github.com/Cantara/kcp-triage)" },
		});
		const finalUrl = res.url || url;
		const redirected = res.redirected || finalUrl !== url;
		const contentType = res.headers.get("content-type") ?? "unknown";
		const outcome = classifyCrawlOutcome(url, finalUrl, res.status, contentType);
		const rawBody = await res.text();

		if (outcome === "non-html") {
			return {
				url,
				finalUrl,
				redirected,
				outcome,
				statusCode: res.status,
				contentType,
				headings: [],
				links: [],
				metaTags: {},
				bodyTextPreview: rawBody.replace(/\s+/g, " ").trim().slice(0, 2000),
				crawledAt: new Date().toISOString(),
			};
		}

		const $ = cheerio.load(rawBody);

		// Inventory closed <dialog> elements separately before removing them from visible body extraction
		const dialogs = $("dialog:not([open])")
			.map((_, el) => $(el).text().replace(/\s+/g, " ").trim().slice(0, 300))
			.get()
			.filter(Boolean);

		$("dialog:not([open]), template, script, style, noscript").remove();

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
			.get()
			.slice(0, 50);

		const metaTags: Record<string, string> = {};
		$("meta[name], meta[property]").each((_, el) => {
			const key = $(el).attr("name") ?? $(el).attr("property") ?? "";
			const content = $(el).attr("content") ?? "";
			if (key) metaTags[key] = content;
		});

		const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);

		return {
			url,
			finalUrl,
			redirected,
			outcome,
			statusCode: res.status,
			contentType,
			title: $("title").text().trim() || undefined,
			headings,
			links,
			...(dialogs.length > 0 ? { dialogs } : {}),
			metaTags,
			bodyTextPreview: bodyText,
			crawledAt: new Date().toISOString(),
		};
	} finally {
		clearTimeout(timer);
	}
}
