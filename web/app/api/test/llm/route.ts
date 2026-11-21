// Test LLM API route (Next.js context with env vars)

import { NextResponse } from "next/server";
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

    const summary = await generateSchemeSummary(scheme);
    const insight = await generatePersonalizedInsight(user, scheme);

    return NextResponse.json({
      scheme: scheme.name,
      summary,
      usesFallback: summary === scheme.summary_fallback,
      insight,
    });
  } catch (error) {
    console.error("Test LLM error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}