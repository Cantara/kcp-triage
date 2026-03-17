import type { SecurityAudit } from "../schemas/index.js";

const EXPECTED_HEADERS = [
	{
		header: "strict-transport-security",
		required: true,
		description: "Enforces HTTPS connections",
	},
	{
		header: "content-security-policy",
		required: true,
		description: "Controls resource loading sources",
	},
	{
		header: "x-content-type-options",
		required: true,
		expectedValue: "nosniff",
		description: "Prevents MIME type sniffing",
	},
	{
		header: "x-frame-options",
		required: false,
		description: "Clickjacking protection (CSP frame-ancestors preferred)",
	},
	{
		header: "referrer-policy",
		required: false,
		description: "Controls referrer information sent",
	},
	{
		header: "permissions-policy",
		required: false,
		description: "Controls browser feature access",
	},
	{
		header: "x-xss-protection",
		required: false,
		description: "Legacy XSS filter (CSP preferred)",
	},
] satisfies Array<{
	header: string;
	required: boolean;
	description: string;
	expectedValue?: string;
}>;

/**
 * Fetch a URL and audit its security headers.
 * This is deterministic — no LLM call. The LLM synthesises findings later.
 */
export async function auditSecurityHeaders(url: string, timeoutMs: number): Promise<SecurityAudit> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, { signal: controller.signal, redirect: "follow" });

		const headers = EXPECTED_HEADERS.map((check) => {
			const value = res.headers.get(check.header) ?? undefined;
			const present = value !== undefined;
			let grade: "pass" | "warn" | "fail" | "info";

			if (present) {
				if (check.expectedValue && value !== check.expectedValue) {
					grade = "warn";
				} else {
					grade = "pass";
				}
			} else {
				grade = check.required ? "fail" : "info";
			}

			return {
				header: check.header,
				present,
				value,
				grade,
				recommendation: !present ? `Add ${check.header}: ${check.description}` : undefined,
			};
		});

		const fails = headers.filter((h) => h.grade === "fail").length;
		const warns = headers.filter((h) => h.grade === "warn").length;

		let overallGrade: "A" | "B" | "C" | "D" | "F";
		if (fails === 0 && warns === 0) overallGrade = "A";
		else if (fails === 0 && warns <= 2) overallGrade = "B";
		else if (fails <= 1) overallGrade = "C";
		else if (fails <= 2) overallGrade = "D";
		else overallGrade = "F";

		return {
			url,
			tlsVersion: undefined, // TODO: extract from TLS handshake
			tlsValid: url.startsWith("https"),
			headers,
			overallGrade,
			vulnerabilities: [],
			auditedAt: new Date().toISOString(),
		};
	} finally {
		clearTimeout(timer);
	}
}
