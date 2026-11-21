// Haq Dilao — Atomic JSON file store
// Only this file reads/writes web/data/*.json. Swappable later.

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

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