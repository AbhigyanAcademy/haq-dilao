// Haq Dilao — Admin Schemes API

import { NextRequest, NextResponse } from "next/server";
import { store, newSchemeId } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/auth";
import { evaluate } from "@/lib/eligibility";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const schemes = store.schemes.read();
    return NextResponse.json({ schemes });
  } catch (error) {
    console.error("Admin schemes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    // Basic validation
    const required = ["role", "name", "benefit", "rules", "documents", "form_fields", "posted_date", "last_date", "summary_fallback"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const scheme = {
      id: newSchemeId(),
      role: body.role,
      name: body.name,
      benefit: body.benefit,
      rules: body.rules,
      documents: body.documents,
      apply_url: body.apply_url || null,
      source_url: body.source_url || null,
      form_fields: body.form_fields,
      posted_date: body.posted_date,
      last_date: body.last_date,
      status_note: body.status_note || "",
      summary_fallback: body.summary_fallback,
      verified: body.verified || false,
      last_verified: null,
      verify_notes: "",
      is_demo: body.is_demo || false,
      autofill: body.autofill || null,
    };

    const schemes = store.schemes.read();
    schemes.push(scheme);
    store.schemes.write(schemes);

    // Notify eligible users
    const users = store.users.read();
    const notifications = store.notifications.read();

    for (const user of users) {
      if (user.role === scheme.role) {
        const result = evaluate(user, scheme);
        if (result.status === "eligible") {
          const dedupeKey = `${user.id}:new_scheme:${scheme.id}`;
          const exists = notifications.some(n => n.dedupe_key === dedupeKey);
          if (!exists) {
            notifications.push({
              id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
              user_id: user.id,
              type: "new_scheme",
              scheme_id: scheme.id,
              message: `New scheme available: ${scheme.name}`,
              created_at: new Date().toISOString(),
              read: false,
              dedupe_key: dedupeKey,
            });
          }
        }
      }
    }

    store.notifications.write(notifications);

    return NextResponse.json({ scheme }, { status: 201 });
  } catch (error) {
    console.error("Admin schemes POST error:", error);
    return NextResponse.json({ error: "Failed to add scheme" }, { status: 500 });
  }
}