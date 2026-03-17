import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { OrchestratorConfigSchema } from "../orchestration/config.js";

export async function initProject(
	url: string,
	opts: { outputDir: string; maxPages: number },
): Promise<void> {
	const spinner = ora(`Initialising triage project for ${chalk.cyan(url)}`).start();

	try {
		new URL(url); // validate
	} catch {
		spinner.fail(`Invalid URL: ${url}`);
		process.exit(1);
	}

	const config = OrchestratorConfigSchema.parse({
		outputDir: opts.outputDir,
		maxCrawlPages: opts.maxPages,
	});

	await mkdir(opts.outputDir, { recursive: true });

	const projectConfig = {
		$schema: "./triage.schema.json",
		targetUrl: url,
		...config,
		createdAt: new Date().toISOString(),
	};

	const configPath = join(opts.outputDir, "triage.config.json");
	await writeFile(configPath, JSON.stringify(projectConfig, null, 2));

	spinner.succeed(`Project initialised at ${chalk.green(opts.outputDir)}`);
	console.log(`  Config: ${chalk.dim(configPath)}`);
	console.log(`  Next:   ${chalk.yellow("site-triage run")} --config ${configPath}`);
}
