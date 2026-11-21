// Haq Dilao — Warm Cache Script
// Pre-generates all scheme summaries so demo never waits
// Run with: npx tsx scripts/warm-cache.ts

import { store } from "../lib/store";
import { generateSchemeSummary, warmAllSummaries } from "../lib/llm";

async function main() {
  console.log("🔥 Warming LLM cache...\n");

  const schemes = store.schemes.read();
  console.log(`Found ${schemes.length} schemes`);

  const startTime = Date.now();
  const result = await warmAllSummaries();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n✅ Cache warmed in ${elapsed}s`);
  console.log(`   Success: ${result.success}`);
  console.log(`   Failed: ${result.failed}`);

  // Show a sample
  const cache = store.summaryCache.read();
  if (cache.length > 0) {
    const sample = cache[0];
    console.log(`\n📝 Sample (${sample.scheme_id}):`);
    console.log(`   ${sample.summary.slice(0, 120)}...`);
  }
}

main().catch(console.error);