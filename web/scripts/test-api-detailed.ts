// Test API calls with detailed logging

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL;

console.log("Env check:");
console.log("  NVIDIA_BASE_URL:", NVIDIA_BASE_URL);
console.log("  NVIDIA_API_KEY:", NVIDIA_API_KEY ? `${NVIDIA_API_KEY.slice(0, 10)}...` : "MISSING");
console.log("  NVIDIA_MODEL:", NVIDIA_MODEL);
console.log("  GEMINI_API_KEY:", GEMINI_API_KEY ? `${GEMINI_API_KEY.slice(0, 10)}...` : "MISSING");
console.log("  GEMINI_MODEL:", GEMINI_MODEL);
console.log("  GROQ_API_KEY:", GROQ_API_KEY ? `${GROQ_API_KEY.slice(0, 10)}...` : "MISSING");
console.log("  GROQ_MODEL:", GROQ_MODEL);

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
  console.log("\n--- Testing NVIDIA ---");
  if (!NVIDIA_API_KEY || !NVIDIA_MODEL) {
    console.log("Missing credentials");
    return;
  }

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

    console.log("Status:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response:", text.slice(0, 500));

    if (!response.ok) {
      console.log("ERROR:", response.status);
      return;
    }

    const data = JSON.parse(text);
    console.log("Content:", data.choices?.[0]?.message?.content?.trim());
  } catch (e) {
    console.log("Exception:", e);
  }
}

async function testGemini() {
  console.log("\n--- Testing Gemini ---");
  if (!GEMINI_API_KEY || !GEMINI_MODEL) {
    console.log("Missing credentials");
    return;
  }

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

    console.log("Status:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response:", text.slice(0, 500));

    if (!response.ok) {
      console.log("ERROR:", response.status);
      return;
    }

    const data = JSON.parse(text);
    console.log("Content:", data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  } catch (e) {
    console.log("Exception:", e);
  }
}

async function testGroq() {
  console.log("\n--- Testing Groq ---");
  if (!GROQ_API_KEY || !GROQ_MODEL) {
    console.log("Missing credentials");
    return;
  }

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

    console.log("Status:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response:", text.slice(0, 500));

    if (!response.ok) {
      console.log("ERROR:", response.status);
      return;
    }

    const data = JSON.parse(text);
    console.log("Content:", data.choices?.[0]?.message?.content?.trim());
  } catch (e) {
    console.log("Exception:", e);
  }
}

async function main() {
  await testNVIDIA();
  await testGemini();
  await testGroq();
}

main().catch(console.error);