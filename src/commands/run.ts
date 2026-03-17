import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { OrchestratorConfigSchema } from "../orchestration/config.js";
import { Dispatcher } from "../orchestration/dispatcher.js";
import { crawlSite } from "../crawlers/site-crawler.js";
import { classifyContent } from "../analyzers/content-classifier.js";
import { auditSecurityHeaders } from "../analyzers/security-headers.js";
import type { TriageReport } from "../schemas/index.js";

interface RunOpts {
	dryRun: boolean;
}

export async function runPipeline(configPath: string, opts: RunOpts): Promise<void> {
	const raw = JSON.parse(await readFile(configPath, "utf-8"));
	const config = OrchestratorConfigSchema.parse(raw);
	const targetUrl: string = raw.targetUrl;
	const outputDir = dirname(configPath);

	if (opts.dryRun) {
		console.log(chalk.yellow("DRY RUN — execution plan:"));
		console.log(`  1. Crawl ${chalk.cyan(targetUrl)} (max ${config.maxCrawlPages} pages)`);
		console.log(`  2. Classify content via ${chalk.magenta(config.routing.classify)}`);
		console.log(`  3. Audit security headers`);
		console.log(`  4. Synthesise report via ${chalk.magenta(config.routing.synthesize)}`);
		return;
	}

	const dispatcher = new Dispatcher(config);

	// ── Step 1: Crawl ────────────────────────────────────────────
	const crawlSpinner = ora("Crawling site…").start();
	const crawlResult = await crawlSite(targetUrl, {
		maxPages: config.maxCrawlPages,
		timeoutMs: config.requestTimeoutMs,
	});
	crawlSpinner.succeed(`Crawled ${crawlResult.pages.length} pages`);

	// ── Step 2: Classify (LLM) ───────────────────────────────────
	const classifySpinner = ora("Classifying content…").start();
	const classification = await classifyContent(crawlResult, dispatcher, config.routing);
	classifySpinner.succeed(
		`Classified as ${chalk.green(classification.data.primaryCategory)} (${Math.round(classification.data.confidence * 100)}%)`,
	);

	// ── Step 3: Security audit (deterministic) ───────────────────
	const secSpinner = ora("Auditing security headers…").start();
	const security = await auditSecurityHeaders(targetUrl, config.requestTimeoutMs);
	secSpinner.succeed(`Security grade: ${chalk.bold(security.overallGrade)}`);

	// ── Step 4: Assemble report ──────────────────────────────────
	const report: TriageReport = {
		version: "0.1.0",
		site: crawlResult.site,
		crawl: crawlResult,
		classification: classification.data,
		security,
		generatedAt: new Date().toISOString(),
		orchestrationMeta: {
			orchestratorModel: "claude-code (opus)",
			delegatedTasks: [
				{
					task: "content-classification",
					model: classification.model,
					durationMs: classification.durationMs,
					tokenUsage: classification.tokenUsage,
				},
			],
		},
	};

	const reportPath = join(outputDir, "triage-report.json");
	await writeFile(reportPath, JSON.stringify(report, null, 2));
	console.log(`\n${chalk.green("✓")} Report written to ${chalk.cyan(reportPath)}`);
}
