// Haq Dilao — Scheme Detail API

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schemes = store.schemes.read();
    const scheme = schemes.find(s => s.id === id);

    if (!scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    return NextResponse.json({ scheme });
  } catch (error) {
    console.error("Scheme detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch scheme" }, { status: 500 });
  }
}