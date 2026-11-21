// Haq Dilao — Auth Library (JWT + bcryptjs)
// Pure functions for auth operations

import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { User, Role } from "./types";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_KEY = new TextEncoder().encode(SESSION_SECRET);
const COOKIE_NAME = "haq_dilao_session";
const ADMIN_COOKIE_NAME = "haq_dilao_admin";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  exp: number;
}

export interface AdminSessionPayload {
  admin: true;
  exp: number;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT tokens
export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_KEY);
}

export async function createAdminToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours
  return new SignJWT({ admin: true, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SESSION_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_KEY);
    if (payload.admin === true) {
      return payload as unknown as AdminSessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Cookie helpers
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function getAdminCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value;
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifySessionToken(token);
}

// Get current admin from session
export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const token = await getAdminCookie();
  if (!token) return null;
  return verifyAdminToken(token);
}

// Validation helpers
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  return { valid: true };
}

export function validateRequiredFields(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      return `${field} is required`;
    }
  }
  return null;
}

// Role-specific required fields
export const ROLE_FIELDS: Record<Role, string[]> = {
  farmer: ["land_hectares", "land_ownership", "crops"],
  student: ["education_level", "course", "institution_type", "last_exam_percent"],
  business: ["business_stage", "sector", "annual_turnover", "employees"],
};

export const COMMON_FIELDS = [
  "name", "age", "gender", "state", "district", "category", "annual_income"
];

// Sanitize user for client (remove password_hash)
export function sanitizeUser(user: User): Omit<User, "password_hash"> {
  const { password_hash, ...rest } = user;
  return rest;
}