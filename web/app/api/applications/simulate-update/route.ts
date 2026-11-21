// Haq Dilao — Simulate Application Status Update API

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, nextStatus } = body;

    if (!applicationId || !nextStatus) {
      return NextResponse.json({ error: "applicationId and nextStatus required" }, { status: 400 });
    }

    // Verify ownership
    const applications = store.applications.read();
    const appIndex = applications.findIndex(a => a.id === applicationId && a.user_id === session.userId);

    if (appIndex === -1) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update application status
    const updatedApplication = {
      ...applications[appIndex],
      status: nextStatus,
      history: [
        ...applications[appIndex].history,
        { status: nextStatus, at: new Date().toISOString(), note: "Demo status update" },
      ],
    };

    applications[appIndex] = updatedApplication;
    store.applications.write(applications);

    // Create notification
    const schemeId = updatedApplication.scheme_id;
    const notifications = store.notifications.read();
    notifications.push({
      id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: session.userId,
      type: "status_change",
      scheme_id: schemeId,
      message: `Your application for ${schemeId} is now ${nextStatus.replace("_", " ")}.`,
      created_at: new Date().toISOString(),
      read: false,
      dedupe_key: `${session.userId}:status_change:${schemeId}:${nextStatus}`,
    });
    store.notifications.write(notifications);

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error("Simulate update error:", error);
    return NextResponse.json({ error: "Failed to simulate update" }, { status: 500 });
  }
}