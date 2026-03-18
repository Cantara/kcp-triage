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
export async function auditSecurityHeaders(
	url: string,
	timeoutMs: number,
): Promise<SecurityAudit> {
	const httpUrl = url.replace(/^https:/, "http:");
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const [httpsRes, httpRes] = await Promise.all([
			fetch(url, { signal: controller.signal, redirect: "follow" }),
			fetch(httpUrl, { signal: controller.signal, redirect: "manual" }),
		]);

		const headers = EXPECTED_HEADERS.map((check) => {
			const value = httpsRes.headers.get(check.header) ?? undefined;
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
				recommendation: !present
					? `Add ${check.header}: ${check.description}`
					: undefined,
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

		const redirectLocation = httpRes.headers.get("location") ?? undefined;
		const httpRedirectsToHttps =
			httpRes.status >= 300 &&
			httpRes.status < 400 &&
			redirectLocation !== undefined &&
			redirectLocation.startsWith("https://");

		const vulnerabilities: SecurityAudit["vulnerabilities"] = [];
		if (!httpRedirectsToHttps) {
			vulnerabilities.push({
				type: "insecure-transport",
				severity: "high",
				description: `HTTP endpoint does not redirect to HTTPS (status ${httpRes.status})`,
			});
			overallGrade = downgradeGrade(overallGrade);
		}

		return {
			url,
			tlsVersion: undefined, // TODO: extract from TLS handshake
			tlsValid: url.startsWith("https"),
			transport: {
				httpUrl,
				httpsUrl: url,
				httpStatusCode: httpRes.status,
				httpsStatusCode: httpsRes.status,
				httpRedirectsToHttps,
				redirectLocation,
			},
			headers,
			overallGrade,
			vulnerabilities,
			auditedAt: new Date().toISOString(),
		};
	} finally {
		clearTimeout(timer);
	}
}

function downgradeGrade(
	grade: SecurityAudit["overallGrade"],
): SecurityAudit["overallGrade"] {
	switch (grade) {
		case "A":
			return "B";
		case "B":
			return "C";
		case "C":
			return "D";
		case "D":
			return "F";
		case "F":
			return "F";
	}
}
