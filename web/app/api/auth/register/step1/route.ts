// Haq Dilao — Register Step 1 API
// Creates user account with common fields

import { NextRequest, NextResponse } from "next/server";
import { store, newUserId } from "@/lib/store";
import { hashPassword, validateEmail, validatePassword, validateRequiredFields, COMMON_FIELDS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const missing = validateRequiredFields(body, ["email", "password", "name", "role", ...COMMON_FIELDS]);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    const { email, password, name, role, ...commonFields } = body;

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      return NextResponse.json({ error: pwdCheck.message }, { status: 400 });
    }

    // Validate role
    const validRoles = ["farmer", "student", "business"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const users = store.users.read();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user with common fields
    const user = {
      id: newUserId(),
      email: email.toLowerCase(),
      password_hash,
      created_at: new Date().toISOString(),
      role,
      name,
      age: Number(commonFields.age) || 0,
      gender: commonFields.gender || "other",
      state: commonFields.state || "",
      district: commonFields.district || "",
      category: commonFields.category || "general",
      annual_income: Number(commonFields.annual_income) || 0,
      disability: Boolean(commonFields.disability),
      documents_have: commonFields.documents_have || ["Aadhaar", "Bank passbook"],
      // Initialize role-specific fields with defaults
      education_level: "school" as const,
      course: "",
      institution_type: "govt" as const,
      last_exam_percent: 0,
      studying_outside_state: false,
      land_hectares: 0,
      land_ownership: "none" as const,
      crops: [],
      has_irrigation: false,
      has_kcc: false,
      bank_account_linked: true,
      business_stage: "idea" as const,
      sector: "",
      annual_turnover: 0,
      employees: 0,
      udyam_registered: false,
      loan_needed: false,
      woman_owned: false,
      sc_st_owned: false,
    };

    users.push(user);
    store.users.write(users);

    // Return user without password_hash
    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, step: 1 }, { status: 201 });

  } catch (error) {
    console.error("Register step 1 error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}