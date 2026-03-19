import { readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import YAML from "yaml";
import type { TriageReport, TriageLog, TriageLogEntry } from "../schemas/index.js";

const PIPELINE_VERSION = "0.1.0";
const LOG_FILENAME = "triage-log.yaml";

/**
 * Walk up from startDir until we find a directory containing package.json,
 * or return startDir if we reach the filesystem root without finding one.
 */
async function findProjectRoot(startDir: string): Promise<string> {
	let dir = startDir;
	while (true) {
		try {
			await access(join(dir, "package.json"));
			return dir;
		} catch {
			const parent = dirname(dir);
			if (parent === dir) {
				// Reached filesystem root without finding package.json
				return startDir;
			}
			dir = parent;
		}
	}
}

/**
 * Append a triage log entry derived from a TriageReport to triage-log.yaml
 * at the project root. Creates the file if it doesn't exist.
 *
 * @param outputDir  - The site output directory (dirname of triage.config.json)
 * @param report     - The completed TriageReport
 * @param goal       - Why this triage was initiated (default: "Routine triage")
 */
export async function appendTriageLog(
	outputDir: string,
	report: TriageReport,
	goal = "Routine triage",
): Promise<string> {
	const projectRoot = await findProjectRoot(outputDir);
	const logPath = join(projectRoot, LOG_FILENAME);

	// Load existing log or initialise empty one
	let log: TriageLog;
	try {
		const raw = await readFile(logPath, "utf-8");
		log = YAML.parse(raw) as TriageLog;
		// Ensure entries array exists (guard against hand-edited files)
		if (!Array.isArray(log.entries)) {
			log.entries = [];
		}
	} catch {
		log = { version: "1.0", entries: [] };
	}

	// Build a stable ID: domain + date (YYYY-MM-DD), with a suffix if there's
	// already an entry for this domain on this date.
	const dateStr = new Date().toISOString().split("T")[0]!;
	const baseId = `${report.site.domain}-${dateStr}`;
	const existingIds = new Set(log.entries.map((e) => e.id));
	let id = baseId;
	let suffix = 1;
	while (existingIds.has(id)) {
		id = `${baseId}-${suffix}`;
		suffix++;
	}

	const entry: TriageLogEntry = {
		id,
		timestamp: new Date().toISOString(),
		domain: report.site.domain,
		url: report.site.url,
		goal,
		pipelineVersion: PIPELINE_VERSION,
		stepsRun: ["crawl", "classify", "security", "synthesize", "generate", "kcp"],
		results: {
			category: report.classification.primaryCategory,
			securityGrade: report.security.overallGrade,
			interactionModel: report.synthesis.interactionModel,
			pagesCrawled: report.crawl.pages.length,
		},
		learnings: [],
		problems: [],
		followUp: [],
	};

	log.entries.push(entry);

	await writeFile(logPath, YAML.stringify(log, { lineWidth: 120 }), "utf-8");

	return logPath;
}
