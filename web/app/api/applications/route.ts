// Haq Dilao — Create Application API

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import type { Application } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    // Verify the application belongs to the current user
    if (body.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const application: Application = {
      id: body.id || `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: body.user_id,
      scheme_id: body.scheme_id,
      applied_at: body.applied_at || new Date().toISOString(),
      application_ref: body.application_ref,
      status: body.status || "applied",
      history: body.history || [{ status: "applied", at: new Date().toISOString(), note: "Application submitted" }],
    };

    const applications = store.applications.read();
    applications.push(application);
    store.applications.write(applications);

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}