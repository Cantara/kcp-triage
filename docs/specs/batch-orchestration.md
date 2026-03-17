# Batch Orchestration

## Running Multiple Sites

The CLI currently handles one site at a time. For batch runs, the orchestrator (Claude Code) should loop:

```bash
for url in $(cat sites.txt); do
  site-triage init "$url" -o "./output/$(echo $url | sed 's|https\?://||;s|/|_|g')"
done

for config in ./output/*/triage.config.json; do
  site-triage run --config "$config" &
done
wait
```

## Parallelism Considerations

- **Crawling**: Can parallelise freely — each site is independent
- **LLM calls**: Subject to Anthropic API rate limits. With a standard key, limit to ~5 concurrent classification calls
- **Reports**: Independent, parallelise freely

## Aggregation

After batch runs complete, the orchestrator can read all `triage-report.json` files and produce a summary:

```bash
# Find all reports
find ./output -name "triage-report.json" -exec cat {} \; | jq -s '.'
```

Or write a dedicated `site-triage batch-report` command that reads all reports from a directory and produces a comparative analysis.

## Cost Tracking

Each report includes `orchestrationMeta.delegatedTasks` with token counts. To estimate cost across a batch:

```bash
find ./output -name "triage-report.json" \
  -exec jq '.orchestrationMeta.delegatedTasks[] | {task, model, tokens: (.tokenUsage.input + .tokenUsage.output)}' {} \;
```

See `skills/prompt-engineering/references/cost-estimation.md` for per-model pricing.
