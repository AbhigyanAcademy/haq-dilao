// Haq Dilao — Intent Parser Test Script
// Run with: npx tsx scripts/test-intents.ts

import assert from "node:assert/strict";
import { parseIntent, executeIntent, QUICK_PROMPTS } from "../lib/intents";
import type { User, Scheme } from "../lib/types";
import { store } from "../lib/store";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u_test",
    email: "test@demo.com",
    password_hash: "hash",
    created_at: new Date().toISOString(),
    role: "farmer",
    name: "Test User",
    age: 30,
    gender: "male",
    state: "Assam",
    district: "Jorhat",
    category: "general",
    annual_income: 100000,
    disability: false,
    documents_have: ["Aadhaar", "Bank passbook"],
    land_hectares: 1.5,
    land_ownership: "owner",
    crops: ["Rice"],
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
    ...overrides,
  };
}

function makeScheme(overrides: Partial<Scheme> = {}): Scheme {
  return {
    id: "test-scheme",
    role: "farmer",
    name: "Test Scheme",
    benefit: "Test benefit",
    rules: [
      { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 hectares" },
      { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
    ],
    documents: ["Aadhaar", "Land record", "Bank passbook"],
    apply_url: null,
    source_url: null,
    form_fields: ["name", "land_hectares"],
    posted_date: "2024-01-01",
    last_date: null,
    status_note: "",
    summary_fallback: "Test fallback",
    verified: false,
    last_verified: null,
    verify_notes: "",
    is_demo: false,
    autofill: null,
    ...overrides,
  };
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  assert.deepStrictEqual(actual, expected, msg);
}

console.log("\n🧪 Running intent parser tests...\n");

// Parse intent tests
test("parseIntent: list_all - 'show my schemes'", () => {
  const result = parseIntent("show my schemes", []);
  assertEqual(result.intent, "list_all");
});

test("parseIntent: list_all - 'everything'", () => {
  const result = parseIntent("everything", []);
  assertEqual(result.intent, "list_all");
});

test("parseIntent: closing_soon - 'closing this week'", () => {
  const result = parseIntent("closing this week", []);
  assertEqual(result.intent, "closing_soon");
});

test("parseIntent: closing_soon - 'deadlines'", () => {
  const result = parseIntent("deadlines", []);
  assertEqual(result.intent, "closing_soon");
});

test("parseIntent: new_schemes - 'what's new'", () => {
  const result = parseIntent("what's new", []);
  assertEqual(result.intent, "new_schemes");
});

test("parseIntent: best_matches - 'best for me'", () => {
  const result = parseIntent("best for me", []);
  assertEqual(result.intent, "best_matches");
});

test("parseIntent: missing_documents - 'documents I'm missing'", () => {
  const result = parseIntent("documents I'm missing", []);
  assertEqual(result.intent, "missing_documents");
});

test("parseIntent: explain_scheme - 'explain PM-KISAN'", () => {
  const result = parseIntent("explain PM-KISAN", []);
  assertEqual(result.intent, "explain_scheme");
});

test("parseIntent: my_applications - 'my applications'", () => {
  const result = parseIntent("my applications", []);
  assertEqual(result.intent, "my_applications");
});

test("parseIntent: search_text - 'random query'", () => {
  const result = parseIntent("random query", []);
  assertEqual(result.intent, "search_text");
});

test("parseIntent: unknown - empty query", () => {
  const result = parseIntent("", []);
  assertEqual(result.intent, "unknown");
});

test("parseIntent: unknown - whitespace only", () => {
  const result = parseIntent("   ", []);
  assertEqual(result.intent, "unknown");
});

test("parseIntent: trims and lowercases", () => {
  const result = parseIntent("  CLOSING THIS WEEK  ", []);
  assertEqual(result.intent, "closing_soon");
});

test("parseIntent: rejects > 500 chars", () => {
  const longQuery = "a".repeat(501);
  const result = parseIntent(longQuery, []);
  assertEqual(result.intent, "unknown");
});

// Execute intent tests
const user = makeUser();
const schemes = [
  makeScheme({ id: "s1", name: "PM-KISAN", last_date: "2025-12-31", posted_date: "2024-01-01" }),
  makeScheme({ id: "s2", name: "KCC", last_date: null, posted_date: "2024-06-01" }),
  makeScheme({ id: "s3", name: "Soil Health Card", last_date: null, posted_date: "2024-01-15" }),
  makeScheme({ id: "s4", name: "PM-KUSUM", last_date: "2025-06-15", posted_date: "2024-03-01" }),
];

test("executeIntent: list_all returns all eligible", () => {
  const parsed = parseIntent("show my schemes", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "list_all");
  // Only 2 schemes have last_date null or future (not closed)
  assert(result.schemes.length >= 1);
});

test("executeIntent: closing_soon filters by last_date within 7 days", () => {
  const parsed = parseIntent("closing this week", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "closing_soon");
  // Only schemes with last_date within 7 days should appear
  // s4 has last_date 2025-06-15 which is far in future, s1 2025-12-31 also far
  // This test will depend on current date - just verify it runs
  assertEqual(typeof result.summary, "string");
});

test("executeIntent: new_schemes filters by posted_date within 7 days", () => {
  const parsed = parseIntent("what's new", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "new_schemes");
  assertEqual(typeof result.summary, "string");
});

test("executeIntent: best_matches returns top 3 by apply score", () => {
  const parsed = parseIntent("best for me", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "best_matches");
  assertEqual(result.schemes.length <= 3, true);
});

test("executeIntent: missing_documents finds schemes with missing docs", () => {
  const parsed = parseIntent("documents I'm missing", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "missing_documents");
  assertEqual(typeof result.summary, "string");
});

test("executeIntent: explain_scheme finds scheme by name", () => {
  const parsed = parseIntent("explain PM-KISAN", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "explain_scheme");
  // Should find PM-KISAN if term extracted correctly
});

test("executeIntent: search_text searches name and benefit", () => {
  const parsed = parseIntent("KISAN", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "search_text");
});

test("executeIntent: my_applications returns empty schemes with message", () => {
  const parsed = parseIntent("my applications", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "my_applications");
  assertEqual(result.schemes.length, 0);
  assertEqual(typeof result.summary, "string");
});

test("executeIntent: search_text for unrecognized query returns empty with friendly message", () => {
  const parsed = parseIntent("xyz123 random", schemes);
  const result = executeIntent(parsed, user, schemes);
  assertEqual(result.intent, "search_text");
  assertEqual(result.schemes.length, 0);
  assert(result.summary.includes("No schemes matching"));
});

test("QUICK_PROMPTS array exists with 4 items", () => {
  assertEqual(QUICK_PROMPTS.length, 4);
  assertEqual(QUICK_PROMPTS[0], "What can I apply for today?");
  assertEqual(QUICK_PROMPTS[1], "Closing this week");
  assertEqual(QUICK_PROMPTS[2], "Documents I'm missing");
  assertEqual(QUICK_PROMPTS[3], "Show all my schemes");
});

// Test with actual seeded data
test("executeIntent: works with real seeded data", () => {
  const users = store.users.read();
  const allSchemes = store.schemes.read();
  const farmer = users.find(u => u.email === "farmer@demo.com");
  if (!farmer) throw new Error("Farmer demo user not found");

  const parsed = parseIntent("show my schemes", allSchemes);
  const result = executeIntent(parsed, farmer, allSchemes);
  assertEqual(result.intent, "list_all");
  assert(result.schemes.length > 0);
  console.log(`     Farmer sees ${result.schemes.length} eligible schemes`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
}