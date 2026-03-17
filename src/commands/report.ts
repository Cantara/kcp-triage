import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import { TriageReportSchema, type TriageReport } from "../schemas/index.js";

type Format = "json" | "markdown" | "summary";

export async function showReport(configPath: string, format: Format): Promise<void> {
	const raw = JSON.parse(await readFile(configPath, "utf-8"));
	const outputDir = dirname(configPath);
	const reportPath = join(outputDir, "triage-report.json");

	let reportRaw: string;
	try {
		reportRaw = await readFile(reportPath, "utf-8");
	} catch {
		console.error(chalk.red(`No report found at ${reportPath}. Run the pipeline first.`));
		process.exit(1);
	}

	const report = TriageReportSchema.parse(JSON.parse(reportRaw));

	switch (format) {
		case "json":
			console.log(JSON.stringify(report, null, 2));
			break;
		case "markdown":
			console.log(renderMarkdown(report));
			break;
		case "summary":
			renderSummary(report);
			break;
	}
}

function renderSummary(r: TriageReport): void {
	console.log();
	console.log(chalk.bold.underline(`Site Triage: ${r.site.domain}`));
	console.log();
	console.log(`  URL:        ${chalk.cyan(r.site.url)}`);
	console.log(`  Category:   ${chalk.green(r.classification.primaryCategory)} (${pct(r.classification.confidence)})`);
	console.log(`  Topics:     ${r.classification.topics.join(", ")}`);
	console.log(`  Tech Stack: ${r.classification.techStack.join(", ") || chalk.dim("none detected")}`);
	console.log(`  Security:   ${gradeColor(r.security.overallGrade)}`);
	console.log(`  Pages:      ${r.crawl.pages.length} crawled`);
	console.log();

	const failHeaders = r.security.headers.filter((h) => h.grade === "fail");
	if (failHeaders.length > 0) {
		console.log(chalk.yellow("  Missing security headers:"));
		for (const h of failHeaders) {
			console.log(`    ${chalk.red("✗")} ${h.header}${h.recommendation ? chalk.dim(` — ${h.recommendation}`) : ""}`);
		}
		console.log();
	}

	const meta = r.orchestrationMeta;
	console.log(chalk.dim(`  Orchestrator: ${meta.orchestratorModel}`));
	for (const t of meta.delegatedTasks) {
		console.log(
			chalk.dim(`  └─ ${t.task}: ${t.model} (${t.durationMs}ms, ${t.tokenUsage.input + t.tokenUsage.output} tokens)`),
		);
	}
	console.log();
}

function renderMarkdown(r: TriageReport): string {
	const lines: string[] = [
		`# Site Triage Report: ${r.site.domain}`,
		"",
		`**URL:** ${r.site.url}  `,
		`**Generated:** ${r.generatedAt}  `,
		`**Version:** ${r.version}`,
		"",
		"## Content Classification",
		"",
		`- **Primary:** ${r.classification.primaryCategory} (${pct(r.classification.confidence)})`,
		`- **Secondary:** ${r.classification.secondaryCategories.join(", ") || "none"}`,
		`- **Topics:** ${r.classification.topics.join(", ")}`,
		`- **Tech Stack:** ${r.classification.techStack.join(", ") || "none detected"}`,
		`- **Reasoning:** ${r.classification.reasoning}`,
		"",
		"## Security Audit",
		"",
		`**Overall Grade:** ${r.security.overallGrade}`,
		"",
		"| Header | Present | Grade | Recommendation |",
		"|--------|---------|-------|----------------|",
		...r.security.headers.map(
			(h) =>
				`| ${h.header} | ${h.present ? "✓" : "✗"} | ${h.grade} | ${h.recommendation ?? "—"} |`,
		),
		"",
		"## Crawl Summary",
		"",
		`Pages crawled: ${r.crawl.pages.length}`,
		"",
		...r.crawl.pages.slice(0, 10).map((p) => `- [${p.title ?? p.url}](${p.url}) — ${p.statusCode}`),
		"",
		"## Orchestration",
		"",
		`Orchestrator: ${r.orchestrationMeta.orchestratorModel}`,
		"",
		...r.orchestrationMeta.delegatedTasks.map(
			(t) => `- **${t.task}**: ${t.model} (${t.durationMs}ms, ${t.tokenUsage.input + t.tokenUsage.output} tokens)`,
		),
	];
	return lines.join("\n");
}

function pct(n: number): string {
	return `${Math.round(n * 100)}%`;
}

function gradeColor(grade: string): string {
	switch (grade) {
		case "A": return chalk.green.bold(grade);
		case "B": return chalk.green(grade);
		case "C": return chalk.yellow(grade);
		case "D": return chalk.red(grade);
		case "F": return chalk.red.bold(grade);
		default: return grade;
	}
}
