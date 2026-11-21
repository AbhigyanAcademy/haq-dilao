// Test LLM layer
import { generateSchemeSummary, generatePersonalizedInsight } from "../lib/llm";
import { store } from "../lib/store";

async function main() {
  const schemes = store.schemes.read();
  const scheme = schemes.find(s => s.id === "pm-kisan");
  const users = store.users.read();
  const user = users.find(u => u.email === "farmer@demo.com");

  if (!scheme || !user) {
    console.log("Scheme or user not found");
    return;
  }

  console.log("Testing scheme:", scheme.name);
  console.log("Fallback:", scheme.summary_fallback.slice(0, 100), "...");

  const summary = await generateSchemeSummary(scheme);
  console.log("\nSummary:", summary.slice(0, 150), "...");
  console.log("Uses fallback:", summary === scheme.summary_fallback);

  const insight = await generatePersonalizedInsight(user, scheme);
  console.log("\nInsight:", insight.slice(0, 150), "...");
}

main().catch(console.error);