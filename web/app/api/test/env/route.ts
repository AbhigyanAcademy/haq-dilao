// Debug env vars

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY ? `${process.env.NVIDIA_API_KEY.slice(0, 10)}...` : "MISSING",
    NVIDIA_BASE_URL: process.env.NVIDIA_BASE_URL,
    NVIDIA_MODEL: process.env.NVIDIA_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.slice(0, 10)}...` : "MISSING",
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GROQ_API_KEY: process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0, 10)}...` : "MISSING",
    GROQ_MODEL: process.env.GROQ_MODEL,
  });
}