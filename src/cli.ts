#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";

const program = new Command()
	.name("site-triage")
	.version("0.1.0")
	.description("Meta-scaffolding CLI for LLM-orchestrated website triage");

// ─── init: generate a triage config for a target site ────────────
program
	.command("init")
	.description("Initialise a triage project for a target URL")
	.argument("<url>", "The site URL to triage")
	.option("-o, --output <dir>", "Output directory", "./triage-output")
	.option("--max-pages <n>", "Max pages to crawl", "20")
	.action(async (url: string, opts: { output: string; maxPages: string }) => {
		const { initProject } = await import("./commands/init.js");
		await initProject(url, {
			outputDir: opts.output,
			maxPages: Number.parseInt(opts.maxPages, 10),
		});
	});

// ─── run: execute the full triage pipeline ───────────────────────
program
	.command("run")
	.description("Run the full triage pipeline on an initialised project")
	.option("-c, --config <path>", "Path to triage config", "./triage.config.json")
	.option("--dry-run", "Print the execution plan without calling LLMs")
	.action(async (opts: { config: string; dryRun?: boolean }) => {
		const { runPipeline } = await import("./commands/run.js");
		await runPipeline(opts.config, { dryRun: opts.dryRun ?? false });
	});

// ─── report: display or export the latest triage report ─────────
program
	.command("report")
	.description("Display or export the triage report")
	.option("-c, --config <path>", "Path to triage config", "./triage.config.json")
	.option("-f, --format <fmt>", "Output format: json | markdown | summary", "summary")
	.action(async (opts: { config: string; format: string }) => {
		const { showReport } = await import("./commands/report.js");
		await showReport(opts.config, opts.format as "json" | "markdown" | "summary");
	});

program.parse();
