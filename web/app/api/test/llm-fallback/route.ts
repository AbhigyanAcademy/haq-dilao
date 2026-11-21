// Test fallback chain by forcing Groq

import { NextResponse } from "next/server";
import { callGroq } from "@/lib/llm";
import { generateSchemeSummary, generatePersonalizedInsight } from "@/lib/llm";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const schemes = store.schemes.read();
    const scheme = schemes.find(s => s.id === "pm-kisan");
    const users = store.users.read();
    const user = users.find(u => u.email === "farmer@demo.com");

    if (!scheme || !user) {
      return NextResponse.json({ error: "Scheme or user not found" }, { status: 404 });
    }

    // Test Groq directly
    const groqResult = await callGroq([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say hello from Groq in one sentence." },
    ]);

    // Test full fallback chain by calling generateSchemeSummary
    // (it will try NVIDIA → Gemini → Groq → fallback)
    const summary = await generateSchemeSummary(scheme);
    const insight = await generatePersonalizedInsight(user, scheme);

    return NextResponse.json({
      scheme: scheme.name,
      groqDirect: groqResult,
      summary,
      usesFallback: summary === scheme.summary_fallback,
      insight,
    });
  } catch (error) {
    console.error("Test LLM fallback error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}