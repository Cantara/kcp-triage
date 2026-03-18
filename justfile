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
