// Haq Dilao — Login API (stateless - works on Vercel serverless)

// Haq Dilao — Login API (stateless - works on Vercel serverless)

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { verifyPassword, createSessionToken, setSessionCookie, sanitizeUser } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Try to find user in store (works locally, may not work on Vercel)
    let user: { id: string; email: string; password_hash: string; name: string; role: Role } | null = null;
    try {
      const users = store.users.read();
      user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (e) {
      console.warn("Store read failed:", e);
    }

    // If user not found in store, try demo users (works everywhere)
    if (!user) {
      const demoUsers = [
        { id: "u_farmer_demo", email: "farmer@demo.com", password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", name: "Ravi Bora", role: "farmer" as Role },
        { id: "u_student_demo", email: "student@demo.com", password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", name: "Priya Das", role: "student" as Role },
        { id: "u_business_demo", email: "business@demo.com", password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", name: "Amit Sharma", role: "business" as Role },
      ];
      user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // If user was just registered, try to find in store
    if (!user) {
      try {
        const users = store.users.read();
        user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
      } catch (e) {
        console.warn("Store read failed:", e);
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session token with full user data (stateless)
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set cookie
    await setSessionCookie(token);

    // Return user without password_hash
    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}