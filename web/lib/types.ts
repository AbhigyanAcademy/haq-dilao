// Haq Dilao — Type definitions
// All data in web/data/*.json uses snake_case field names exactly as below.

export type Role = "farmer" | "student" | "business";
export type Gender = "male" | "female" | "other";
export type Category = "general" | "obc" | "sc" | "st";
export type LandOwnership = "owner" | "lessee" | "none";
export type InstitutionType = "govt" | "private";
export type EducationLevel = "school" | "ug" | "pg";
export type BusinessStage = "idea" | "new" | "existing";
export type ApplicationStatus = "applied" | "under_review" | "more_info_needed" | "approved" | "rejected";
export type NotificationType = "new_scheme" | "deadline_7d" | "deadline_1d" | "status_change";
export type RuleOp = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in" | "not_in" | "between";

// --- User ---
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string; // ISO
  role: Role;
  name: string;
  age: number;
  gender: Gender;
  state: string;
  district: string;
  category: Category;
  annual_income: number; // rupees
  disability: boolean;
  documents_have: string[]; // document NAMES only, never numbers

  // Student
  education_level?: EducationLevel;
  course?: string;
  institution_type?: InstitutionType;
  last_exam_percent?: number;
  studying_outside_state?: boolean;

  // Farmer
  land_hectares?: number;
  land_ownership?: LandOwnership;
  crops?: string[];
  has_irrigation?: boolean;
  has_kcc?: boolean;
  bank_account_linked?: boolean;

  // Business
  business_stage?: BusinessStage;
  sector?: string;
  annual_turnover?: number; // rupees
  employees?: number;
  udyam_registered?: boolean;
  loan_needed?: boolean;
  woman_owned?: boolean;
  sc_st_owned?: boolean;
}

// --- Scheme ---
export interface SchemeRule {
  field: string;
  op: RuleOp;
  value: number | string | number[] | string[];
  label: string;
}

export interface AutofillMap {
  portal_match: string;
  fields: Array<{
    profile: string;
    selector: string;
    type: "text" | "select" | "checkbox" | "radio" | "date";
  }>;
}

export interface Scheme {
  id: string;
  role: Role;
  name: string;
  benefit: string;
  rules: SchemeRule[];
  documents: string[];
  apply_url: string | null;
  source_url: string | null;
  form_fields: string[];
  posted_date: string | null; // YYYY-MM-DD
  last_date: string | null; // YYYY-MM-DD or null = open all year
  status_note: string;
  summary_fallback: string;
  verified: boolean;
  last_verified: string | null; // ISO date
  verify_notes: string;
  is_demo: boolean;
  autofill: AutofillMap | null;
}

// --- Application ---
export interface Application {
  id: string;
  user_id: string;
  scheme_id: string;
  applied_at: string; // ISO
  application_ref: string;
  status: ApplicationStatus;
  history: Array<{
    status: ApplicationStatus;
    at: string; // ISO
    note: string;
  }>;
}

// --- Notification ---
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  scheme_id: string;
  message: string;
  created_at: string; // ISO
  read: boolean;
  dedupe_key: string;
}

// --- Eligibility evaluation result ---
export interface RuleResult {
  field: string;
  label: string;
  passed: boolean;
  reason: string;
}

export interface EligibilityResult {
  status: "eligible" | "near_miss" | "not_eligible";
  passed: RuleResult[];
  failed: RuleResult[];
  unknown: RuleResult[];
}

// --- Apply score ---
export interface ApplyScoreResult {
  score: number; // 0-100
  reason: string;
  passed_rules: number;
  total_rules: number;
  docs_owned: number;
  docs_required: number;
}

// --- Why you qualify ---
export interface WhyYouQualifyResult {
  labels: string[];
}

// --- Command bar intents ---
export type Intent =
  | "list_all"
  | "closing_soon"
  | "new_schemes"
  | "best_matches"
  | "missing_documents"
  | "explain_scheme"
  | "my_applications"
  | "search_text"
  | "unknown";

export interface ParsedIntent {
  intent: Intent;
  term?: string;
}

// --- LLM cache ---
export interface SummaryCacheEntry {
  scheme_id: string;
  summary: string;
  generated_at: string; // ISO
}

export interface InsightCacheEntry {
  key: string; // userId+schemeId+profileHash
  insight: string;
  generated_at: string; // ISO
}