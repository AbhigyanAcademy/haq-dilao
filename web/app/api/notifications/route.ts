// Haq Dilao — Notifications API

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const notifications = store.notifications.read();
    const userNotifications = notifications
      .filter(n => n.user_id === session.userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = userNotifications.filter(n => !n.read).length;

    return NextResponse.json({ notifications: userNotifications, unreadCount });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    const notifications = store.notifications.read();

    if (markAllRead) {
      notifications.forEach(n => {
        if (n.user_id === session.userId && !n.read) {
          n.read = true;
        }
      });
    } else if (notificationId) {
      const notif = notifications.find(n => n.id === notificationId && n.user_id === session.userId);
      if (notif) notif.read = true;
    }

    store.notifications.write(notifications);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}