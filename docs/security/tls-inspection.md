# TLS Certificate Inspection

## What to Check

| Property | What It Means | Grade Logic |
|----------|--------------|-------------|
| Protocol version | TLS 1.2 minimum, 1.3 preferred | < 1.2 = fail, 1.2 = pass, 1.3 = pass |
| Certificate expiry | Days until expiration | < 7 days = warn, expired = fail |
| Certificate chain | Complete chain to trusted root | Incomplete = warn |
| Subject match | Cert covers the domain | Mismatch = fail |

## Approach: Shell Out to OpenSSL

Bun/Node `fetch` doesn't expose TLS details. Use `openssl s_client` via a child process:

```typescript
import { $ } from "bun";

interface TlsInfo {
  protocol: string;
  cipher: string;
  certSubject: string;
  certIssuer: string;
  certExpiry: string;
  daysUntilExpiry: number;
  chainValid: boolean;
}

async function inspectTls(hostname: string): Promise<TlsInfo | null> {
  try {
    const result = await $`echo | openssl s_client -connect ${hostname}:443 -servername ${hostname} 2>/dev/null | openssl x509 -noout -subject -issuer -dates -text`.text();

    const protocol = extractField(result, /Protocol\s*:\s*(\S+)/);
    const cipher = extractField(result, /Cipher\s*:\s*(\S+)/);
    const subject = extractField(result, /subject=(.+)/);
    const issuer = extractField(result, /issuer=(.+)/);
    const notAfter = extractField(result, /notAfter=(.+)/);

    const expiryDate = notAfter ? new Date(notAfter) : new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      protocol: protocol ?? "unknown",
      cipher: cipher ?? "unknown",
      certSubject: subject ?? "unknown",
      certIssuer: issuer ?? "unknown",
      certExpiry: notAfter ?? "unknown",
      daysUntilExpiry,
      chainValid: !result.includes("verify error"),
    };
  } catch {
    return null;
  }
}

function extractField(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? null;
}
```

## Schema Extension

```typescript
tls: z.object({
  protocol: z.string(),
  cipher: z.string(),
  certExpiry: z.string(),
  daysUntilExpiry: z.number(),
  chainValid: z.boolean(),
  grade: z.enum(["pass", "warn", "fail"]),
}).optional(),
```

## Grading

```typescript
function gradeTls(info: TlsInfo): "pass" | "warn" | "fail" {
  if (info.daysUntilExpiry <= 0) return "fail";
  if (info.daysUntilExpiry <= 7) return "warn";
  if (!info.chainValid) return "warn";
  if (info.protocol === "TLSv1" || info.protocol === "TLSv1.1") return "fail";
  return "pass";
}
```

## Environment Note

This requires `openssl` to be installed on the system running the CLI. Most Linux and macOS environments have it. If not available, the TLS check should gracefully degrade to just `tlsValid: url.startsWith("https")`.
