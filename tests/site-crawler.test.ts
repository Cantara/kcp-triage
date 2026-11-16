import { describe, expect, test } from "bun:test";
import { crawlSite } from "../src/crawlers/site-crawler.js";

describe("crawlSite outcome classification & closed dialog filtering", () => {
	test("separates closed <dialog> text from bodyTextPreview and inventories dialogs", async () => {
		const server = Bun.serve({
			port: 0,
			fetch() {
				return new Response(
					`<!doctype html>
					<html>
						<head><title>Portal</title></head>
						<body>
							<h1>Main Heading</h1>
							<p>Visible page content.</p>
							<dialog>Hidden modal controls that should not pollute body preview</dialog>
							<dialog open>Open modal content</dialog>
						</body>
					</html>`,
					{ headers: { "content-type": "text/html; charset=utf-8" } },
				);
			},
		});

		try {
			const res = await crawlSite(`http://localhost:${server.port}/`, {
				maxPages: 1,
				timeoutMs: 5000,
			});
			expect(res.pages.length).toBe(1);
			const page = res.pages[0]!;
			expect(page.outcome).toBe("ok");
			expect(page.bodyTextPreview).toContain("Visible page content.");
			expect(page.bodyTextPreview).toContain("Open modal content");
			expect(page.bodyTextPreview).not.toContain("Hidden modal controls");
			expect(page.dialogs).toEqual(["Hidden modal controls that should not pollute body preview"]);
		} finally {
			server.stop();
		}
	});

	test("marks non-HTML JSON gateway responses as non-html", async () => {
		const server = Bun.serve({
			port: 0,
			fetch() {
				return new Response(JSON.stringify({ status: 400, message: "gateway error" }), {
					status: 400,
					headers: { "content-type": "application/json" },
				});
			},
		});

		try {
			const res = await crawlSite(`http://localhost:${server.port}/`, {
				maxPages: 1,
				timeoutMs: 5000,
			});
			expect(res.pages.length).toBe(1);
			expect(res.pages[0]?.outcome).toBe("http-error");
		} finally {
			server.stop();
		}
	});

	test("detects redirect to login policy path as auth-required", async () => {
		const server = Bun.serve({
			port: 0,
			fetch(req) {
				const url = new URL(req.url);
				if (url.pathname === "/app") {
					return Response.redirect(`http://localhost:${server.port}/my.policy`, 302);
				}
				return new Response("<html><body>Logon Page</body></html>", {
					headers: { "content-type": "text/html" },
				});
			},
		});

		try {
			const res = await crawlSite(`http://localhost:${server.port}/app`, {
				maxPages: 2,
				timeoutMs: 5000,
			});
			expect(res.pages.length).toBe(1);
			const page = res.pages[0]!;
			expect(page.redirected).toBe(true);
			expect(page.finalUrl).toContain("/my.policy");
			expect(page.outcome).toBe("auth-required");
		} finally {
			server.stop();
		}
	});
});
