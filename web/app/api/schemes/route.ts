// Haq Dilao — Schemes API
// Returns all schemes (for command bar)

import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const schemes = store.schemes.read();
    return NextResponse.json({ schemes });
  } catch (error) {
    console.error("Schemes API error:", error);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
  }
}