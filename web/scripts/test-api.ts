// Test API calls directly
import { callNVIDIA, callGemini, callGroq } from "../lib/llm";

async function main() {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Say hello in one sentence." },
  ];

  console.log("Testing NVIDIA...");
  try {
    const nvidia = await callNVIDIA(messages);
    console.log("NVIDIA result:", nvidia);
  } catch (e) {
    console.log("NVIDIA error:", e);
  }

  console.log("\nTesting Gemini...");
  try {
    const gemini = await callGemini("Say hello in one sentence.");
    console.log("Gemini result:", gemini);
  } catch (e) {
    console.log("Gemini error:", e);
  }

  console.log("\nTesting Groq...");
  try {
    const groq = await callGroq(messages);
    console.log("Groq result:", groq);
  } catch (e) {
    console.log("Groq error:", e);
  }
}

main().catch(console.error);