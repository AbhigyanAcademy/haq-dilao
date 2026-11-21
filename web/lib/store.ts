// Haq Dilao — Atomic JSON file store (with in-memory fallback for Vercel)
// Only this file reads/writes web/data/*.json. Swappable later.

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const IS_VERCEL = process.env.VERCEL === "1";

// In-memory fallback for Vercel (read-only filesystem)
const memoryStore: Record<string, unknown> = {};

// Pre-seed demo users in memory so they persist across serverless invocations
function seedDemoUsers() {
  const demoUsers = [
    {
      id: "u_farmer_demo",
      email: "farmer@demo.com",
      password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", // Demo@1234
      created_at: new Date().toISOString(),
      role: "farmer",
      name: "Ravi Bora",
      age: 42,
      gender: "male",
      state: "Assam",
      district: "Jorhat",
      category: "obc",
      annual_income: 150000,
      disability: false,
      documents_have: ["Aadhaar", "Bank passbook", "Land record"],
      land_hectares: 1.2,
      land_ownership: "owner",
      crops: ["Rice", "Tea"],
      has_irrigation: false,
      has_kcc: false,
      bank_account_linked: true,
      education_level: "school",
      course: "",
      institution_type: "govt",
      last_exam_percent: 0,
      studying_outside_state: false,
      business_stage: "idea",
      sector: "",
      annual_turnover: 0,
      employees: 0,
      udyam_registered: false,
      loan_needed: false,
      woman_owned: false,
      sc_st_owned: false,
    },
    {
      id: "u_student_demo",
      email: "student@demo.com",
      password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", // Demo@1234
      created_at: new Date().toISOString(),
      role: "student",
      name: "Priya Das",
      age: 20,
      gender: "female",
      state: "Assam",
      district: "Kamrup Metropolitan",
      category: "sc",
      annual_income: 200000,
      disability: false,
      documents_have: ["Aadhaar", "Bank passbook", "Caste certificate", "Income certificate"],
      land_hectares: 0,
      land_ownership: "none",
      crops: [],
      has_irrigation: false,
      has_kcc: false,
      bank_account_linked: true,
      education_level: "ug",
      course: "B.Sc. Agriculture",
      institution_type: "govt",
      last_exam_percent: 84,
      studying_outside_state: false,
      business_stage: "idea",
      sector: "",
      annual_turnover: 0,
      employees: 0,
      udyam_registered: false,
      loan_needed: false,
      woman_owned: false,
      sc_st_owned: false,
    },
    {
      id: "u_business_demo",
      email: "business@demo.com",
      password_hash: "$2b$10$08573DH2UxGa7XQJxpOh.etS0xu7MXPTxQW2ANZ0I6cuRuAK5P0am", // Demo@1234
      created_at: new Date().toISOString(),
      role: "business",
      name: "Amit Sharma",
      age: 28,
      gender: "male",
      state: "Assam",
      district: "Kamrup Metropolitan",
      category: "general",
      annual_income: 600000,
      disability: false,
      documents_have: ["Aadhaar", "PAN", "Bank passbook", "Business registration"],
      land_hectares: 0,
      land_ownership: "none",
      crops: [],
      has_irrigation: false,
      has_kcc: false,
      bank_account_linked: true,
      education_level: "school",
      course: "",
      institution_type: "govt",
      last_exam_percent: 0,
      studying_outside_state: false,
      business_stage: "new",
      sector: "retail",
      annual_turnover: 500000,
      employees: 2,
      udyam_registered: true,
      loan_needed: true,
      woman_owned: false,
      sc_st_owned: false,
    },
  ];

  if (IS_VERCEL && !memoryStore["users.json"]) {
    memoryStore["users.json"] = demoUsers;
  }
  if (IS_VERCEL && !memoryStore["schemes.json"]) {
    // Load schemes from file if available, else will be loaded on demand
    try {
      const fs = require("fs");
      const path = require("path");
      const schemesPath = path.join(process.cwd(), "data", "schemes.json");
      if (fs.existsSync(schemesPath)) {
        memoryStore["schemes.json"] = JSON.parse(fs.readFileSync(schemesPath, "utf8"));
      }
    } catch {}
  }
  if (IS_VERCEL && !memoryStore["applications.json"]) {
    memoryStore["applications.json"] = [];
  }
  if (IS_VERCEL && !memoryStore["notifications.json"]) {
    memoryStore["notifications.json"] = [];
  }
  if (IS_VERCEL && !memoryStore["summary-cache.json"]) {
    memoryStore["summary-cache.json"] = [];
  }
  if (IS_VERCEL && !memoryStore["insight-cache.json"]) {
    memoryStore["insight-cache.json"] = [];
  }
}

// Seed on module load
seedDemoUsers();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function dataPath(filename: string) {
  return path.join(DATA_DIR, filename);
}

function tempPath(filename: string) {
  return path.join(DATA_DIR, `.${filename}.tmp`);
}

export function readJSON<T>(filename: string, fallback: T): T {
  // On Vercel, use in-memory store
  if (IS_VERCEL) {
    return (memoryStore[filename] as T) ?? fallback;
  }

  ensureDataDir();
  const file = dataPath(filename);
  if (!fs.existsSync(file)) {
    return fallback;
  }
  try {
    const content = fs.readFileSync(file, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  // On Vercel, use in-memory store
  if (IS_VERCEL) {
    memoryStore[filename] = data;
    return;
  }

  ensureDataDir();
  const file = dataPath(filename);
  const tmp = tempPath(filename);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file); // atomic on POSIX, near-atomic on Windows
}

// Specific typed readers/writers
import type { User, Scheme, Application, Notification } from "./types";

export const store = {
  users: {
    read: () => readJSON<User[]>("users.json", []),
    write: (users: User[]) => writeJSON("users.json", users),
  },
  schemes: {
    read: () => readJSON<Scheme[]>("schemes.json", []),
    write: (schemes: Scheme[]) => writeJSON("schemes.json", schemes),
  },
  applications: {
    read: () => readJSON<Application[]>("applications.json", []),
    write: (apps: Application[]) => writeJSON("applications.json", apps),
  },
  notifications: {
    read: () => readJSON<Notification[]>("notifications.json", []),
    write: (notifs: Notification[]) => writeJSON("notifications.json", notifs),
  },
  summaryCache: {
    read: () => readJSON<import("./types").SummaryCacheEntry[]>("summary-cache.json", []),
    write: (cache: import("./types").SummaryCacheEntry[]) => writeJSON("summary-cache.json", cache),
  },
  insightCache: {
    read: () => readJSON<import("./types").InsightCacheEntry[]>("insight-cache.json", []),
    write: (cache: import("./types").InsightCacheEntry[]) => writeJSON("insight-cache.json", cache),
  },
};

// ID generators
export function newUserId(): string {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newSchemeId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newApplicationId(): string {
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newNotificationId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}