# SARIF Output Format

## What is SARIF

Static Analysis Results Interchange Format — a JSON-based standard for expressing results from static analysis tools. Supported by GitHub Code Scanning, Azure DevOps, VS Code SARIF Viewer, and many CI/CD platforms.

## Mapping from SecurityAudit to SARIF

```typescript
import type { SecurityAudit } from "../schemas/index.js";

interface SarifResult {
  $schema: string;
  version: string;
  runs: Array<{
    tool: { driver: { name: string; version: string; rules: SarifRule[] } };
    results: SarifFinding[];
  }>;
}

interface SarifRule {
  id: string;
  shortDescription: { text: string };
  helpUri?: string;
}

interface SarifFinding {
  ruleId: string;
  level: "error" | "warning" | "note";
  message: { text: string };
  locations: Array<{
    physicalLocation: { artifactLocation: { uri: string } };
  }>;
}

function toSarif(audit: SecurityAudit): SarifResult {
  const rules: SarifRule[] = audit.headers.map((h) => ({
    id: `security-header/${h.header}`,
    shortDescription: { text: `Check for ${h.header} header` },
  }));

  const results: SarifFinding[] = audit.headers
    .filter((h) => h.grade === "fail" || h.grade === "warn")
    .map((h) => ({
      ruleId: `security-header/${h.header}`,
      level: h.grade === "fail" ? "error" : "warning",
      message: { text: h.recommendation ?? `${h.header} header issue` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: audit.url },
          },
        },
      ],
    }));

  // Also include vulnerability findings
  for (const vuln of audit.vulnerabilities) {
    results.push({
      ruleId: `vulnerability/${vuln.type}`,
      level: vuln.severity === "critical" || vuln.severity === "high" ? "error" : "warning",
      message: { text: vuln.description },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: audit.url },
          },
        },
      ],
    });
  }

  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "site-triage-meta",
            version: "0.1.0",
            rules,
          },
        },
        results,
      },
    ],
  };
}
```

## Usage

Add a `sarif` format option to the report command:

```typescript
case "sarif": {
  const sarif = toSarif(report.security);
  const outPath = join(outputDir, "triage-security.sarif");
  await writeFile(outPath, JSON.stringify(sarif, null, 2));
  console.log(`SARIF report written to ${outPath}`);
  break;
}
```

## GitHub Integration

Upload SARIF to GitHub Code Scanning:

```bash
gh api \
  -X POST \
  /repos/{owner}/{repo}/code-scanning/sarifs \
  -f "commit_sha=$(git rev-parse HEAD)" \
  -f "ref=refs/heads/main" \
  --input triage-security.sarif.gz
```
