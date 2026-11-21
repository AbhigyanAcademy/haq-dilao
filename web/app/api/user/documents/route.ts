// Haq Dilao — Update User Documents API

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { documents_have } = body;

    if (!Array.isArray(documents_have)) {
      return NextResponse.json({ error: "documents_have must be an array" }, { status: 400 });
    }

    const users = store.users.read();
    const userIndex = users.findIndex(u => u.id === session.userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users[userIndex] = {
      ...users[userIndex],
      documents_have,
    };

    store.users.write(users);

    return NextResponse.json({ user: users[userIndex] });
  } catch (error) {
    console.error("Update documents error:", error);
    return NextResponse.json({ error: "Failed to update documents" }, { status: 500 });
  }
}