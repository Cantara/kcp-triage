import Anthropic from "@anthropic-ai/sdk";
import type { ModelTier, OrchestratorConfig } from "./config.js";
import { MODEL_IDS } from "./config.js";

export interface TaskResult<T> {
	data: T;
	model: string;
	durationMs: number;
	tokenUsage: { input: number; output: number };
}

export class Dispatcher {
	private client: Anthropic;

	constructor(private config: OrchestratorConfig) {
		this.client = new Anthropic({
			apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
		});
	}

	async dispatch<T>(opts: {
		tier: ModelTier;
		system: string;
		prompt: string;
		parse: (raw: string) => T;
		maxTokens?: number;
	}): Promise<TaskResult<T>> {
		const model = MODEL_IDS[opts.tier];
		const maxTokens = opts.maxTokens ?? 4096;
		const start = performance.now();

		// Use streaming for large token limits to avoid SDK timeout errors
		if (maxTokens > 8192) {
			const stream = this.client.messages.stream({
				model,
				max_tokens: maxTokens,
				system: opts.system,
				messages: [{ role: "user", content: opts.prompt }],
			});
			const response = await stream.finalMessage();
			const durationMs = Math.round(performance.now() - start);
			const text = response.content
				.filter((block): block is Anthropic.TextBlock => block.type === "text")
				.map((block) => block.text)
				.join("\n");

			return {
				data: opts.parse(text),
				model,
				durationMs,
				tokenUsage: {
					input: response.usage.input_tokens,
					output: response.usage.output_tokens,
				},
			};
		}

		const response = await this.client.messages.create({
			model,
			max_tokens: maxTokens,
			system: opts.system,
			messages: [{ role: "user", content: opts.prompt }],
		});

		const durationMs = Math.round(performance.now() - start);
		const text = response.content
			.filter((block): block is Anthropic.TextBlock => block.type === "text")
			.map((block) => block.text)
			.join("\n");

		return {
			data: opts.parse(text),
			model,
			durationMs,
			tokenUsage: {
				input: response.usage.input_tokens,
				output: response.usage.output_tokens,
			},
		};
	}
}
