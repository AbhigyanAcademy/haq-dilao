// Haq Dilao — Register Step 2 API
// Updates user with role-specific fields

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get current session user
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const users = store.users.read();
    const userIndex = users.findIndex(u => u.id === session.userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];
    const role = user.role;

    // Validate role-specific fields
    const roleFields: Record<string, string[]> = {
      farmer: ["land_hectares", "land_ownership", "crops"],
      student: ["education_level", "course", "institution_type", "last_exam_percent"],
      business: ["business_stage", "sector", "annual_turnover", "employees"],
    };

    const requiredFields = roleFields[role] || [];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json({ error: `${field} is required for ${role}` }, { status: 400 });
      }
    }

    // Update user with role-specific fields
    const updates: Record<string, unknown> = {};

    if (role === "farmer") {
      updates.land_hectares = Number(body.land_hectares) || 0;
      updates.land_ownership = body.land_ownership;
      updates.crops = Array.isArray(body.crops) ? body.crops : [body.crops].filter(Boolean);
      updates.has_irrigation = Boolean(body.has_irrigation);
      updates.has_kcc = Boolean(body.has_kcc);
      updates.bank_account_linked = Boolean(body.bank_account_linked);
    } else if (role === "student") {
      updates.education_level = body.education_level;
      updates.course = body.course;
      updates.institution_type = body.institution_type;
      updates.last_exam_percent = Number(body.last_exam_percent) || 0;
      updates.studying_outside_state = Boolean(body.studying_outside_state);
    } else if (role === "business") {
      updates.business_stage = body.business_stage;
      updates.sector = body.sector;
      updates.annual_turnover = Number(body.annual_turnover) || 0;
      updates.employees = Number(body.employees) || 0;
      updates.udyam_registered = Boolean(body.udyam_registered);
      updates.loan_needed = Boolean(body.loan_needed);
      updates.woman_owned = Boolean(body.woman_owned);
      updates.sc_st_owned = Boolean(body.sc_st_owned);
    }

    users[userIndex] = { ...user, ...updates };
    store.users.write(users);

    // Return updated user without password_hash
    const { password_hash: _, ...safeUser } = users[userIndex];
    return NextResponse.json({ user: safeUser, step: 2, complete: true });

  } catch (error) {
    console.error("Register step 2 error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}