// Haq Dilao — Get Current User API

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { sanitizeUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const users = store.users.read();
    const user = users.find(u => u.id === session.userId);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}