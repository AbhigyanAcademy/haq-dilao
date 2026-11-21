// Haq Dilao — LLM Layer (NVIDIA → Gemini → Groq → Static Fallback)
// Plain fetch, 8s timeout per provider, caching in JSON files

import { store } from "./store";
import type { SummaryCacheEntry, InsightCacheEntry, Scheme, User } from "./types";

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL;

const TIMEOUT_MS = 8000;
const SYSTEM_PROMPT =
  "Use ONLY the facts provided. Do not add amounts, dates, links or eligibility rules that are not in the input. Write simple English for a first-time reader. 3-4 sentences.";

// --- Helpers ---

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function hashProfile(user: User): string {
  // Simple hash of relevant profile fields for cache key
  const relevant = {
    role: user.role,
    age: user.age,
    gender: user.gender,
    state: user.state,
    district: user.district,
    category: user.category,
    annual_income: user.annual_income,
    disability: user.disability,
    land_hectares: user.land_hectares,
    land_ownership: user.land_ownership,
    education_level: user.education_level,
    course: user.course,
    institution_type: user.institution_type,
    last_exam_percent: user.last_exam_percent,
    business_stage: user.business_stage,
    sector: user.sector,
    annual_turnover: user.annual_turnover,
    employees: user.employees,
    woman_owned: user.woman_owned,
    sc_st_owned: user.sc_st_owned,
  };
  let hash = 0;
  const str = JSON.stringify(relevant);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// --- NVIDIA (OpenAI-compatible) ---

export async function callNVIDIA(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!NVIDIA_API_KEY || !NVIDIA_MODEL) return null;

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
          messages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      console.warn(`NVIDIA API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.warn("NVIDIA call failed:", error);
    return null;
  }
}

// --- Gemini (Google AI Studio REST) ---

export async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY || !GEMINI_MODEL) return null;

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.warn("Gemini call failed:", error);
    return null;
  }
}

// --- Groq (OpenAI-compatible) ---

export async function callGroq(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!GROQ_API_KEY || !GROQ_MODEL) return null;

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
          messages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      console.warn(`Groq API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.warn("Groq call failed:", error);
    return null;
  }
}

// --- Scheme Summary Generation ---

function buildSchemeSummaryPrompt(scheme: Scheme): string {
  return `Scheme: ${scheme.name}
Benefit: ${scheme.benefit}
Eligibility rules:
${scheme.rules.map(r => `- ${r.label}`).join("\n")}
Required documents: ${scheme.documents.join(", ")}
Apply URL: ${scheme.apply_url || "Not provided"}
Source: ${scheme.source_url || "Not provided"}
Posted: ${scheme.posted_date || "Not available"}
Last date: ${scheme.last_date || "Open all year"}

Write a plain-language summary (3-4 sentences) for a citizen who may not know government terminology. Explain what the scheme does, who it's for, and the main benefit.`;
}

function buildInsightPrompt(user: User, scheme: Scheme, whyQualify: string[], missingDocs: string[]): string {
  const profile = [
    `Role: ${user.role}`,
    `Age: ${user.age}`,
    `Location: ${user.district}, ${user.state}`,
    `Category: ${user.category}`,
    `Annual income: ₹${user.annual_income.toLocaleString()}`,
  ];

  if (user.role === "farmer") {
    profile.push(`Land: ${user.land_hectares} ha (${user.land_ownership})`);
    profile.push(`Crops: ${user.crops?.join(", ") || "None"}`);
    profile.push(`Irrigation: ${user.has_irrigation ? "Yes" : "No"}`);
    profile.push(`KCC: ${user.has_kcc ? "Yes" : "No"}`);
  } else if (user.role === "student") {
    profile.push(`Education: ${user.education_level} (${user.course})`);
    profile.push(`Institution: ${user.institution_type}`);
    profile.push(`Last exam: ${user.last_exam_percent}%`);
  } else if (user.role === "business") {
    profile.push(`Stage: ${user.business_stage}`);
    profile.push(`Sector: ${user.sector}`);
    profile.push(`Turnover: ₹${(user.annual_turnover ?? 0).toLocaleString()}`);
    profile.push(`Employees: ${user.employees}`);
    profile.push(`Udyam: ${user.udyam_registered ? "Yes" : "No"}`);
    profile.push(`Woman-owned: ${user.woman_owned ? "Yes" : "No"}`);
    profile.push(`SC/ST-owned: ${user.sc_st_owned ? "Yes" : "No"}`);
  }

  return `User profile:
${profile.join("\n")}

Scheme: ${scheme.name}
Benefit: ${scheme.benefit}
Why they qualify: ${whyQualify.join("; ") || "No matching rules"}
Missing documents: ${missingDocs.join(", ") || "None"}

Write a short personalized insight (2-3 sentences) for this specific user. Mention their key qualifying factors and what documents they still need. Be encouraging but factual.`;
}

// --- Cache Functions ---

async function getCachedSummary(schemeId: string): Promise<string | null> {
  const cache = store.summaryCache.read();
  const entry = cache.find(e => e.scheme_id === schemeId);
  return entry?.summary || null;
}

async function setCachedSummary(schemeId: string, summary: string): Promise<void> {
  const cache = store.summaryCache.read();
  const existingIndex = cache.findIndex(e => e.scheme_id === schemeId);
  const entry: SummaryCacheEntry = {
    scheme_id: schemeId,
    summary,
    generated_at: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    cache[existingIndex] = entry;
  } else {
    cache.push(entry);
  }
  store.summaryCache.write(cache);
}

async function getCachedInsight(key: string): Promise<string | null> {
  const cache = store.insightCache.read();
  const entry = cache.find(e => e.key === key);
  return entry?.insight || null;
}

async function setCachedInsight(key: string, insight: string): Promise<void> {
  const cache = store.insightCache.read();
  const existingIndex = cache.findIndex(e => e.key === key);
  const entry: InsightCacheEntry = {
    key,
    insight,
    generated_at: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    cache[existingIndex] = entry;
  } else {
    cache.push(entry);
  }
  store.insightCache.write(cache);
}

// --- Public API ---

export async function generateSchemeSummary(scheme: Scheme): Promise<string> {
  // Check cache first
  const cached = await getCachedSummary(scheme.id);
  if (cached) return cached;

  const prompt = buildSchemeSummaryPrompt(scheme);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  // Try NVIDIA
  let result = await callNVIDIA(messages);
  if (result) {
    await setCachedSummary(scheme.id, result);
    return result;
  }

  // Try Gemini
  result = await callGemini(`${SYSTEM_PROMPT}\n\n${prompt}`);
  if (result) {
    await setCachedSummary(scheme.id, result);
    return result;
  }

  // Try Groq
  result = await callGroq(messages);
  if (result) {
    await setCachedSummary(scheme.id, result);
    return result;
  }

  // Static fallback
  return scheme.summary_fallback;
}

export async function generatePersonalizedInsight(user: User, scheme: Scheme): Promise<string> {
  const evalResult = await import("./eligibility").then(m => m.evaluate(user, scheme));
  const whyQualify = evalResult.passed.map(p => p.label);
  const missingDocs = scheme.documents.filter(
    doc => !user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase())
  );

  const profileHash = hashProfile(user);
  const cacheKey = `${user.id}:${scheme.id}:${profileHash}`;

  // Check cache
  const cached = await getCachedInsight(cacheKey);
  if (cached) return cached;

  const prompt = buildInsightPrompt(user, scheme, whyQualify, missingDocs);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  // Try NVIDIA
  let result = await callNVIDIA(messages);
  if (result) {
    await setCachedInsight(cacheKey, result);
    return result;
  }

  // Try Gemini
  result = await callGemini(`${SYSTEM_PROMPT}\n\n${prompt}`);
  if (result) {
    await setCachedInsight(cacheKey, result);
    return result;
  }

  // Try Groq
  result = await callGroq(messages);
  if (result) {
    await setCachedInsight(cacheKey, result);
    return result;
  }

  // Deterministic fallback from whyQualify and missing docs
  const fallback = whyQualify.length > 0
    ? `You qualify because: ${whyQualify.join(", ")}. ${missingDocs.length > 0 ? `Still need: ${missingDocs.join(", ")}.` : "You have all required documents."}`
    : `Based on your profile, check the eligibility rules for ${scheme.name}. ${missingDocs.length > 0 ? `Missing documents: ${missingDocs.join(", ")}.` : ""}`;

  await setCachedInsight(cacheKey, fallback);
  return fallback;
}

// --- Warm Cache Script ---

export async function warmAllSummaries(): Promise<{ success: number; failed: number }> {
  const schemes = store.schemes.read();
  let success = 0;
  let failed = 0;

  for (const scheme of schemes) {
    try {
      await generateSchemeSummary(scheme);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}