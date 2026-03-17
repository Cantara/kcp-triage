# Cookie Security Checks

## What to Check

Every `Set-Cookie` header should include security flags:

| Flag | What It Does | Grade if Missing |
|------|-------------|------------------|
| `Secure` | Only sent over HTTPS | fail (on HTTPS sites) |
| `HttpOnly` | Not accessible via JS | warn |
| `SameSite` | CSRF protection | warn |

## Implementation

```typescript
interface CookieAudit {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none" | null;
  grade: "pass" | "warn" | "fail";
  issues: string[];
}

function auditCookies(response: Response): CookieAudit[] {
  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];

  return setCookieHeaders.map((raw) => {
    const parts = raw.split(";").map((s) => s.trim().toLowerCase());
    const name = raw.split("=")[0]?.trim() ?? "unknown";

    const secure = parts.some((p) => p === "secure");
    const httpOnly = parts.some((p) => p === "httponly");
    const sameSitePart = parts.find((p) => p.startsWith("samesite="));
    const sameSite = sameSitePart
      ? (sameSitePart.split("=")[1] as "strict" | "lax" | "none")
      : null;

    const issues: string[] = [];
    if (!secure) issues.push("Missing Secure flag");
    if (!httpOnly) issues.push("Missing HttpOnly flag");
    if (!sameSite) issues.push("Missing SameSite attribute");
    if (sameSite === "none" && !secure) issues.push("SameSite=None requires Secure flag");

    let grade: "pass" | "warn" | "fail" = "pass";
    if (!secure) grade = "fail";
    else if (issues.length > 0) grade = "warn";

    return { name, secure, httpOnly, sameSite, grade, issues };
  });
}
```

## Schema Extension

Add to `SecurityAuditSchema`:

```typescript
cookies: z.array(z.object({
  name: z.string(),
  secure: z.boolean(),
  httpOnly: z.boolean(),
  sameSite: z.enum(["strict", "lax", "none"]).nullable(),
  grade: z.enum(["pass", "warn", "fail"]),
  issues: z.array(z.string()),
})).optional(),
```

## Integration Point

Call `auditCookies(response)` inside `auditSecurityHeaders` right after fetching, before the `finally` block. Add the results to the return object.
