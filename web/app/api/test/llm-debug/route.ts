// Debug LLM API calls with detailed error logging

import { NextResponse } from "next/server";

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function testNVIDIA() {
  if (!NVIDIA_API_KEY || !NVIDIA_MODEL) return { error: "Missing credentials" };

  try {
    const response = await fetchWithTimeout(
      `${NVIDIA_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello in one sentence." },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      },
      8000
    );

    const status = response.status;
    const text = await response.text();

    if (!response.ok) {
      return { error: `HTTP ${status}: ${text.slice(0, 500)}` };
    }

    const data = JSON.parse(text);
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { error: "Empty content in response" };
    return { success: true, content };
  } catch (e) {
    return { error: `Exception: ${String(e)}` };
  }
}

async function testGemini() {
  if (!GEMINI_API_KEY || !GEMINI_MODEL) return { error: "Missing credentials" };

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello in one sentence." }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      },
      8000
    );

    const status = response.status;
    const text = await response.text();

    if (!response.ok) {
      return { error: `HTTP ${status}: ${text.slice(0, 500)}` };
    }

    const data = JSON.parse(text);
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) return { error: "Empty content in response" };
    return { success: true, content };
  } catch (e) {
    return { error: `Exception: ${String(e)}` };
  }
}

async function testGroq() {
  if (!GROQ_API_KEY || !GROQ_MODEL) return { error: "Missing credentials" };

  try {
    const response = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello in one sentence." },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      },
      8000
    );

    const status = response.status;
    const text = await response.text();

    if (!response.ok) {
      return { error: `HTTP ${status}: ${text.slice(0, 500)}` };
    }

    const data = JSON.parse(text);
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { error: "Empty content in response" };
    return { success: true, content };
  } catch (e) {
    return { error: `Exception: ${String(e)}` };
  }
}

export async function GET() {
  const [nvidia, gemini, groq] = await Promise.all([
    testNVIDIA(),
    testGemini(),
    testGroq(),
  ]);

  return NextResponse.json({ nvidia, gemini, groq });
}