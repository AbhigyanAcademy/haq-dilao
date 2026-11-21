// Haq Dilao — User Applications API

import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const applications = store.applications.read();
    const userApps = applications.filter(app => app.user_id === session.userId);

    return NextResponse.json({ applications: userApps });
  } catch (error) {
    console.error("User applications API error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}