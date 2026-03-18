# kcp-triage — common workflows
# Usage: just <recipe> [args...]

# Default: list available recipes
default:
    @just --list

# ── Site Triage ──────────────────────────────────────────────────

# Initialize a new site project
init url output_dir="":
    #!/usr/bin/env bash
    dir="{{ output_dir }}"
    if [ -z "$dir" ]; then
        # Derive from URL: https://www.example.com → sites/www.example.com
        dir="sites/$(echo '{{ url }}' | sed 's|https\?://||;s|/.*||')"
    fi
    bun run dev init "{{ url }}" -o "$dir"

# Run full triage pipeline for a site
scan domain:
    bun run dev run --config "sites/{{ domain }}/triage.config.json"

# Dry run — show execution plan without API calls
dry-run domain:
    bun run dev run --config "sites/{{ domain }}/triage.config.json" --dry-run

# Show triage report (format: summary|markdown|json)
report domain format="summary":
    bun run dev report --config "sites/{{ domain }}/triage.config.json" -f "{{ format }}"

# Write a triage report to disk (format: summary|markdown|json)
report-file domain format="markdown" output="":
    #!/usr/bin/env bash
    set -euo pipefail
    out="{{ output }}"
    if [ -z "$out" ]; then
        case "{{ format }}" in
            json) out="sites/{{ domain }}/triage-report.export.json" ;;
            markdown) out="sites/{{ domain }}/triage-report.export.md" ;;
            summary) out="sites/{{ domain }}/triage-report.export.txt" ;;
            *) echo "Unsupported format: {{ format }}" >&2; exit 1 ;;
        esac
    fi
    bun run dev report --config "sites/{{ domain }}/triage.config.json" -f "{{ format }}" > "$out"
    echo "Wrote $out"

# Init + scan in one step
triage url output_dir="":
    #!/usr/bin/env bash
    dir="{{ output_dir }}"
    if [ -z "$dir" ]; then
        dir="sites/$(echo '{{ url }}' | sed 's|https\?://||;s|/.*||')"
    fi
    domain=$(echo '{{ url }}' | sed 's|https\?://||;s|/.*||')
    bun run dev init "{{ url }}" -o "$dir"
    bun run dev run --config "$dir/triage.config.json"
    bun run dev report --config "$dir/triage.config.json" -f summary

# Scan all existing sites
scan-all:
    #!/usr/bin/env bash
    for config in sites/*/triage.config.json; do
        domain=$(basename $(dirname "$config"))
        echo "═══ Scanning $domain ═══"
        bun run dev run --config "$config" || echo "FAILED: $domain"
        echo
    done

# Show summary reports for all sites
report-all format="summary":
    #!/usr/bin/env bash
    for config in sites/*/triage.config.json; do
        bun run dev report --config "$config" -f "{{ format }}"
        echo
    done

# ── Live Verification ────────────────────────────────────────────

# Show live security-relevant headers for a path
sec-headers domain path="/":
    #!/usr/bin/env bash
    set -euo pipefail
    curl -sS -o /dev/null -D - "https://{{ domain }}{{ path }}" \
        | grep -Ei '^(HTTP/|location:|content-type:|cache-control:|server:|strict-transport-security:|content-security-policy:|x-content-type-options:|x-frame-options:|referrer-policy:|permissions-policy:|cross-origin-opener-policy:|cross-origin-resource-policy:|cross-origin-embedder-policy:|set-cookie:)' || true

# Inspect Set-Cookie behavior and what a standards-based client stores
sec-cookies domain path="/":
    #!/usr/bin/env bash
    set -euo pipefail
    headers=$(mktemp)
    jar=$(mktemp)
    trap 'rm -f "$headers" "$jar"' EXIT
    curl -sS -D "$headers" -o /dev/null -c "$jar" "https://{{ domain }}{{ path }}"
    echo "== Response Set-Cookie lines =="
    grep -i '^set-cookie:' "$headers" || true
    echo
    echo "== Cookies stored by the client =="
    if grep -iq '^set-cookie:' "$headers"; then
        echo "== Set-Cookie name counts =="
        grep -i '^set-cookie:' "$headers" \
            | sed -E 's/^set-cookie:[[:space:]]*//I; s/=.*$//' \
            | sort \
            | uniq -c
        echo
    else
        echo "No Set-Cookie headers observed."
        echo
    fi
    if grep -qv '^#' "$jar"; then
        cat "$jar"
    else
        echo "(none)"
    fi

# Fetch a path and grep the HTML for a pattern
sec-grep domain pattern path="/":
    #!/usr/bin/env bash
    set -euo pipefail
    body=$(mktemp)
    trap 'rm -f "$body"' EXIT
    curl -sS "https://{{ domain }}{{ path }}" -o "$body"
    rg -n "{{ pattern }}" "$body" || true

# Probe an endpoint with a specific method and print response headers
sec-probe domain path="/find_v2/" method="GET":
    #!/usr/bin/env bash
    set -euo pipefail
    curl -sS -X "{{ method }}" -o /dev/null -D - "https://{{ domain }}{{ path }}" | sed -n '1,40p'

# Compare HTTP and HTTPS behavior for the root path
sec-transport domain:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "== HTTP root =="
    curl -sS -o /dev/null -D - "http://{{ domain }}/" | sed -n '1,20p'
    echo
    echo "== HTTPS root =="
    curl -sS -o /dev/null -D - "https://{{ domain }}/" | sed -n '1,20p'

# Run the standard live verification bundle used during report review
sec-verify domain path1="/" path2="/robots.txt" path3="/sitemap.xml":
    #!/usr/bin/env bash
    set -euo pipefail
    headers=$(mktemp)
    jar=$(mktemp)
    body=$(mktemp)
    trap 'rm -f "$headers" "$jar" "$body"' EXIT

    echo "== HTTP root =="
    curl -sS -o /dev/null -D - "http://{{ domain }}/" | sed -n '1,20p'
    echo

    for path in "{{ path1 }}" "{{ path2 }}" "{{ path3 }}"; do
        echo "== Headers: $path =="
        curl -sS -o /dev/null -D - "https://{{ domain }}$path" \
            | grep -Ei '^(HTTP/|location:|content-type:|cache-control:|server:|strict-transport-security:|content-security-policy:|x-content-type-options:|x-frame-options:|referrer-policy:|permissions-policy:|set-cookie:)' || true
        echo
    done

    echo "== Cookies: {{ path1 }} =="
    curl -sS -D "$headers" -o /dev/null -c "$jar" "https://{{ domain }}{{ path1 }}"
    if grep -iq '^set-cookie:' "$headers"; then
        grep -i '^set-cookie:' "$headers" \
            | sed -E 's/^set-cookie:[[:space:]]*//I; s/=.*$//' \
            | sort \
            | uniq -c
        echo
        echo "Stored cookies:"
        if grep -qv '^#' "$jar"; then
            cat "$jar"
        else
            echo "(none)"
        fi
    else
        echo "No Set-Cookie headers observed."
    fi
    echo
    echo "== HTML grep: {{ path1 }} =="
    curl -sS "https://{{ domain }}{{ path1 }}" -o "$body"
    rg -n 'canonical|og:url|httpsEnabled|GOOGLE_API_KEY|LIPSCORE_API_KEY|instrumentationKey|__RequestVerificationToken|csrf|gapi|adsbygoogle|iframe' "$body" || true

# ── Site Configuration ───────────────────────────────────────────

# Set politeness delay for a site (ms)
set-politeness domain delay_ms:
    #!/usr/bin/env bash
    config="sites/{{ domain }}/triage.config.json"
    tmp=$(mktemp)
    bun -e "
        const c = JSON.parse(require('fs').readFileSync('$config','utf8'));
        c.politenessDelayMs = {{ delay_ms }};
        require('fs').writeFileSync('$config', JSON.stringify(c, null, 2));
    "
    echo "Set politenessDelayMs={{ delay_ms }} for {{ domain }}"

# Set model for a pipeline step (e.g., just set-model www.skeidar.no generate sonnet)
set-model domain step tier:
    #!/usr/bin/env bash
    config="sites/{{ domain }}/triage.config.json"
    bun -e "
        const c = JSON.parse(require('fs').readFileSync('$config','utf8'));
        c.routing['{{ step }}'] = '{{ tier }}';
        require('fs').writeFileSync('$config', JSON.stringify(c, null, 2));
    "
    echo "Set routing.{{ step }}={{ tier }} for {{ domain }}"

# ── Development ──────────────────────────────────────────────────

# Type check
check:
    bun run typecheck

# Run tests
test:
    bun test

# Format code
fmt:
    bun run fmt

# Lint code
lint:
    bun run lint

# ── Inspection ───────────────────────────────────────────────────

# List all triaged sites with their categories
sites:
    #!/usr/bin/env bash
    printf "%-30s %-15s %-8s %s\n" "DOMAIN" "CATEGORY" "SECURITY" "INTERACTION"
    printf "%-30s %-15s %-8s %s\n" "------" "--------" "--------" "-----------"
    for dir in sites/*/; do
        domain=$(basename "$dir")
        [ "$domain" = ".gitkeep" ] && continue
        report="$dir/triage-report.json"
        [ -f "$report" ] || continue
        cat=$(bun -e "const r=JSON.parse(require('fs').readFileSync('$report','utf8')); console.log(r.classification.primaryCategory)")
        sec=$(bun -e "const r=JSON.parse(require('fs').readFileSync('$report','utf8')); console.log(r.security.overallGrade)")
        int=$(bun -e "const r=JSON.parse(require('fs').readFileSync('$report','utf8')); console.log(r.synthesis.interactionModel)")
        printf "%-30s %-15s %-8s %s\n" "$domain" "$cat" "$sec" "$int"
    done

# Show KCP units for a site
kcp domain:
    @cat "sites/{{ domain }}/knowledge.yaml"

# Show skills for a site
skills domain:
    @ls "sites/{{ domain }}/skills/"
