import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { OrchestratorConfigSchema } from "../orchestration/config.js";
import { Dispatcher } from "../orchestration/dispatcher.js";
import { crawlSite } from "../crawlers/site-crawler.js";
import { classifyContent } from "../analyzers/content-classifier.js";
import { auditSecurityHeaders } from "../analyzers/security-headers.js";
import { synthesizeSite } from "../analyzers/site-synthesizer.js";
import { generateSiteProject } from "../analyzers/project-generator.js";
import { generateKcpManifest } from "../generators/kcp-manifest.js";
import { appendTriageLog } from "../generators/triage-log.js";
import type { TriageReport } from "../schemas/index.js";

interface RunOpts {
	dryRun: boolean;
	goal?: string;
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
		console.log(`  4. Synthesise site profile via ${chalk.magenta(config.routing.synthesize)}`);
		console.log(`  5. Generate site project via ${chalk.magenta(config.routing.generate)}`);
		console.log(`  6. Generate KCP knowledge.yaml manifest`);
		console.log(`  7. Assemble report`);
		console.log(`  8. Update triage log`);
		return;
	}

	// Validate API key before crawling
	const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		console.error(chalk.red("\nError: ANTHROPIC_API_KEY not set"));
		console.error(chalk.dim("Set it via environment variable or in triage.config.json"));
		process.exit(1);
	}

	const dispatcher = new Dispatcher(config);

	// ── Step 1: Crawl ────────────────────────────────────────────
	const crawlSpinner = ora("Crawling site…").start();
	const crawlResult = await crawlSite(targetUrl, {
		maxPages: config.maxCrawlPages,
		timeoutMs: config.requestTimeoutMs,
		politenessDelayMs: config.politenessDelayMs,
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

	// ── Step 4: Synthesise site profile (LLM) ────────────────────
	const synthSpinner = ora("Synthesising site profile…").start();
	const synthesis = await synthesizeSite(crawlResult, classification.data, security, dispatcher, config.routing);
	synthSpinner.succeed(`Synthesis complete: ${synthesis.data.interactionModel}`);

	// ── Step 5: Generate site project ───────────────────────────────────
	const genSpinner = ora("Generating site project…").start();
	const project = await generateSiteProject(
		crawlResult, classification.data, security, synthesis.data,
		dispatcher, config.routing,
	);
	genSpinner.succeed("Site project generated");

	// Write project files (clean generated dirs first to remove stale files from previous runs)
	await rm(join(outputDir, "skills"), { recursive: true, force: true });
	await rm(join(outputDir, "apis"), { recursive: true, force: true });
	await mkdir(join(outputDir, "skills"), { recursive: true });
	await mkdir(join(outputDir, "apis"), { recursive: true });

	await writeFile(join(outputDir, "CLAUDE.md"), project.data.claudeMd);
	await writeFile(join(outputDir, "README.md"), project.data.readmeMd);
	await writeFile(join(outputDir, "sitemap.md"), project.data.sitemapMd);

	for (const skill of project.data.skills) {
		await writeFile(join(outputDir, "skills", `${skill.name}.md`), skill.content);
	}

	for (const api of project.data.apis) {
		await writeFile(join(outputDir, api.path), api.content);
	}

	if (project.data.unknowns) {
		await writeFile(join(outputDir, "unknowns.md"), project.data.unknowns);
	}

	// ── Step 6: Generate KCP manifest (deterministic) ───────────
	const kcpSpinner = ora("Generating KCP manifest…").start();
	const kcpYaml = generateKcpManifest(crawlResult.site, classification.data, synthesis.data, project.data);
	await writeFile(join(outputDir, "knowledge.yaml"), kcpYaml);
	kcpSpinner.succeed(`KCP manifest: ${project.data.skills.length} skills, ${project.data.apis.length} APIs indexed`);

	// ── Step 7: Assemble report ──────────────────────────────────
	const report: TriageReport = {
		version: "0.1.0",
		site: crawlResult.site,
		crawl: crawlResult,
		classification: classification.data,
		security,
		synthesis: synthesis.data,
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
				{
					task: "site-synthesis",
					model: synthesis.model,
					durationMs: synthesis.durationMs,
					tokenUsage: synthesis.tokenUsage,
				},
				{
					task: "project-generation",
					model: project.model,
					durationMs: project.durationMs,
					tokenUsage: project.tokenUsage,
				},
			],
		},
	};

	const reportPath = join(outputDir, "triage-report.json");
	await writeFile(reportPath, JSON.stringify(report, null, 2));
	console.log(`\n${chalk.green("✓")} Report written to ${chalk.cyan(reportPath)}`);

	// ── Step 8: Update triage log ────────────────────────────────
	const logSpinner = ora("Updating triage log…").start();
	const logPath = await appendTriageLog(outputDir, report, opts.goal);
	logSpinner.succeed(`Triage log updated: ${chalk.cyan(logPath)}`);
}
