import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { type TriageReport, TriageReportSchema } from "../schemas/index.js";

type Format = "json" | "markdown" | "summary";

export async function showReport(
	configPath: string,
	format: Format,
): Promise<void> {
	const raw = JSON.parse(await readFile(configPath, "utf-8"));
	const outputDir = dirname(configPath);
	const reportPath = join(outputDir, "triage-report.json");

	let reportRaw: string;
	try {
		reportRaw = await readFile(reportPath, "utf-8");
	} catch {
		console.error(
			chalk.red(`No report found at ${reportPath}. Run the pipeline first.`),
		);
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
	console.log(
		`  Category:   ${chalk.green(r.classification.primaryCategory)} (${pct(r.classification.confidence)})`,
	);
	console.log(`  Topics:     ${r.classification.topics.join(", ")}`);
	console.log(
		`  Tech Stack: ${r.classification.techStack.join(", ") || chalk.dim("none detected")}`,
	);
	console.log(`  Security:   ${gradeColor(r.security.overallGrade)}`);
	console.log(
		`  Transport:  ${
			r.security.transport.httpRedirectsToHttps
				? chalk.green(
						`HTTP→HTTPS redirect (${r.security.transport.httpStatusCode ?? "?"})`,
					)
				: chalk.red(
						`HTTP served directly (${r.security.transport.httpStatusCode ?? "?"})`,
					)
		}`,
	);
	console.log(`  Interaction: ${r.synthesis.interactionModel}`);
	console.log(`  Narrative:   ${r.synthesis.narrative}`);
	console.log(`  Pages:      ${r.crawl.pages.length} crawled`);
	console.log();

	if (!r.security.transport.httpRedirectsToHttps) {
		console.log(chalk.yellow("  Transport finding:"));
		console.log(
			`    ${chalk.red("✗")} HTTP root does not redirect to HTTPS${r.security.transport.redirectLocation ? chalk.dim(` (location: ${r.security.transport.redirectLocation})`) : ""}`,
		);
		console.log();
	}

	const failHeaders = r.security.headers.filter((h) => h.grade === "fail");
	if (failHeaders.length > 0) {
		console.log(chalk.yellow("  Missing security headers:"));
		for (const h of failHeaders) {
			console.log(
				`    ${chalk.red("✗")} ${h.header}${h.recommendation ? chalk.dim(` — ${h.recommendation}`) : ""}`,
			);
		}
		console.log();
	}

	const meta = r.orchestrationMeta;
	console.log(chalk.dim(`  Orchestrator: ${meta.orchestratorModel}`));
	for (const t of meta.delegatedTasks) {
		console.log(
			chalk.dim(
				`  └─ ${t.task}: ${t.model} (${t.durationMs}ms, ${t.tokenUsage.input + t.tokenUsage.output} tokens)`,
			),
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
		"## Synthesis",
		"",
		`${r.synthesis.narrative}`,
		"",
		`**Interaction Model:** ${r.synthesis.interactionModel}`,
		"",
		"**Key Capabilities:**",
		...r.synthesis.keyCapabilities.map((c) => `- ${c}`),
		"",
		...(r.synthesis.apiEndpoints.length > 0
			? [
					"**API Endpoints:**",
					...r.synthesis.apiEndpoints.map((e) => `- ${e}`),
					"",
				]
			: []),
		...(r.synthesis.authentication
			? [`**Authentication:** ${r.synthesis.authentication}`, ""]
			: []),
		"## Security Audit",
		"",
		`**Overall Grade:** ${r.security.overallGrade}`,
		`**Transport:** ${
			r.security.transport.httpRedirectsToHttps
				? `HTTP redirects to HTTPS (${r.security.transport.httpStatusCode ?? "?"})`
				: `HTTP does not redirect to HTTPS (${r.security.transport.httpStatusCode ?? "?"})`
		}`,
		"",
		"| Header | Present | Grade | Recommendation |",
		"|--------|---------|-------|----------------|",
		...r.security.headers.map(
			(h) =>
				`| ${h.header} | ${h.present ? "✓" : "✗"} | ${h.grade} | ${h.recommendation ?? "—"} |`,
		),
		"",
		...(r.security.vulnerabilities.length > 0
			? [
					"**Detected Vulnerabilities:**",
					...r.security.vulnerabilities.map(
						(v) => `- **${v.severity}** ${v.type}: ${v.description}`,
					),
					"",
				]
			: []),
		"## Crawl Summary",
		"",
		`Pages crawled: ${r.crawl.pages.length}`,
		"",
		...r.crawl.pages
			.slice(0, 10)
			.map((p) => `- [${p.title ?? p.url}](${p.url}) — ${p.statusCode}`),
		"",
		"## Orchestration",
		"",
		`Orchestrator: ${r.orchestrationMeta.orchestratorModel}`,
		"",
		...r.orchestrationMeta.delegatedTasks.map(
			(t) =>
				`- **${t.task}**: ${t.model} (${t.durationMs}ms, ${t.tokenUsage.input + t.tokenUsage.output} tokens)`,
		),
	];
	return lines.join("\n");
}

function pct(n: number): string {
	return `${Math.round(n * 100)}%`;
}

function gradeColor(grade: string): string {
	switch (grade) {
		case "A":
			return chalk.green.bold(grade);
		case "B":
			return chalk.green(grade);
		case "C":
			return chalk.yellow(grade);
		case "D":
			return chalk.red(grade);
		case "F":
			return chalk.red.bold(grade);
		default:
			return grade;
	}
}
