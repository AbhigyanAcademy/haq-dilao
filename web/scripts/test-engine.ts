// Haq Dilao — Eligibility Engine Test Script
// Run with: npx tsx scripts/test-engine.ts
// Uses node:assert, no test framework

import assert from "node:assert/strict";
import { evaluate, applyScore, whyYouQualify } from "../lib/eligibility";
import type { User, Scheme, SchemeRule } from "../lib/types";

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

function makeScheme(rules: SchemeRule[], overrides: Partial<Scheme> = {}): Scheme {
  return {
    id: "test-scheme",
    role: "farmer",
    name: "Test Scheme",
    benefit: "Test benefit",
    rules,
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

// --- Test Cases ---

console.log("\n🧪 Running eligibility engine tests...\n");

// 1. eq operator - matches
test("eq operator: exact match passes", () => {
  const user = makeUser({ category: "obc" });
  const scheme = makeScheme([{ field: "category", op: "eq", value: "obc", label: "OBC category" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
  assertEqual(result.passed.length, 1);
});

// 2. eq operator - no match
test("eq operator: mismatch fails", () => {
  const user = makeUser({ category: "general" });
  const scheme = makeScheme([{ field: "category", op: "eq", value: "obc", label: "OBC category" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "not_eligible");
  assertEqual(result.failed.length, 1);
});

// 3. neq operator
test("neq operator: different value passes", () => {
  const user = makeUser({ gender: "female" });
  const scheme = makeScheme([{ field: "gender", op: "neq", value: "male", label: "Not male" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

// 4. lt operator
test("lt operator: less than passes", () => {
  const user = makeUser({ age: 25 });
  const scheme = makeScheme([{ field: "age", op: "lt", value: 30, label: "Under 30" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

test("lt operator: not less than fails -> near_miss (single numeric rule)", () => {
  const user = makeUser({ age: 35 });
  const scheme = makeScheme([{ field: "age", op: "lt", value: 30, label: "Under 30" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
});

// 5. lte operator
test("lte operator: less than or equal passes", () => {
  const user = makeUser({ land_hectares: 2 });
  const scheme = makeScheme([{ field: "land_hectares", op: "lte", value: 2, label: "Up to 2 hectares" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

test("lte operator: greater than fails -> near_miss (single numeric rule)", () => {
  const user = makeUser({ land_hectares: 2.5 });
  const scheme = makeScheme([{ field: "land_hectares", op: "lte", value: 2, label: "Up to 2 hectares" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
});

// 6. gt operator
test("gt operator: greater than passes", () => {
  const user = makeUser({ annual_income: 500000 });
  const scheme = makeScheme([{ field: "annual_income", op: "gt", value: 400000, label: "Income above ₹4L" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

// 7. gte operator
test("gte operator: greater than or equal passes", () => {
  const user = makeUser({ last_exam_percent: 80 });
  const scheme = makeScheme([{ field: "last_exam_percent", op: "gte", value: 80, label: "80% or above" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

// 8. in operator
test("in operator: value in list passes", () => {
  const user = makeUser({ category: "sc" });
  const scheme = makeScheme([{ field: "category", op: "in", value: ["sc", "st", "obc"], label: "Reserved category" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

test("in operator: value not in list fails", () => {
  const user = makeUser({ category: "general" });
  const scheme = makeScheme([{ field: "category", op: "in", value: ["sc", "st", "obc"], label: "Reserved category" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "not_eligible");
});

// 9. not_in operator
test("not_in operator: value not in excluded list passes", () => {
  const user = makeUser({ business_stage: "new" });
  const scheme = makeScheme([{ field: "business_stage", op: "not_in", value: ["existing"], label: "Not existing business" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

// 10. between operator
test("between operator: value in range passes", () => {
  const user = makeUser({ age: 25 });
  const scheme = makeScheme([{ field: "age", op: "between", value: [18, 35], label: "Age 18-35" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "eligible");
});

test("between operator: value outside range fails -> near_miss (single numeric rule)", () => {
  const user = makeUser({ age: 40 });
  const scheme = makeScheme([{ field: "age", op: "between", value: [18, 35], label: "Age 18-35" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
});

// 11. Missing field counts as failed with reason "unknown"
test("missing field: counts as failed with reason unknown", () => {
  const user = makeUser({ land_ownership: "owner" });
  // User has no land_hectares field (it's 1.5 by default, but let's test with a field they don't have)
  // We'll use a field that doesn't exist in the user object
  const scheme = makeScheme([{ field: "nonexistent_field", op: "eq", value: "test", label: "Nonexistent" }]);
  const result = evaluate(user, scheme);
  assertEqual(result.unknown.length, 1);
  assertEqual(result.unknown[0].reason, "unknown");
  assertEqual(result.status, "not_eligible");
});

// 12. near_miss: exactly one numeric rule fails
test("near_miss: single numeric rule failure (lte)", () => {
  const user = makeUser({ land_hectares: 2.5 }); // Just over the limit
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 hectares" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
  ]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
  assertEqual(result.failed.length, 1);
  assertEqual(result.passed.length, 1);
});

// 13. near_miss: single numeric rule failure (gte)
test("near_miss: single numeric rule failure (gte)", () => {
  const user = makeUser({ last_exam_percent: 75 }); // Just under 80%
  const scheme = makeScheme([
    { field: "last_exam_percent", op: "gte", value: 80, label: "80% or above" },
    { field: "annual_income", op: "lte", value: 450000, label: "Income up to ₹4.5L" }
  ]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
});

// 14. near_miss: single numeric rule failure (between)
test("near_miss: single numeric rule failure (between)", () => {
  const user = makeUser({ age: 17 }); // Just under 18
  const scheme = makeScheme([
    { field: "age", op: "between", value: [18, 35], label: "Age 18-35" },
    { field: "category", op: "in", value: ["general", "obc"], label: "General or OBC" }
  ]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "near_miss");
});

// 15. Not near_miss: two rules fail
test("not near_miss: two rules fail", () => {
  const user = makeUser({ land_hectares: 3, land_ownership: "lessee" });
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 hectares" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
  ]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "not_eligible");
});

// 16. Not near_miss: non-numeric rule fails
test("not near_miss: non-numeric (eq) rule fails", () => {
  const user = makeUser({ category: "general" });
  const scheme = makeScheme([
    { field: "category", op: "eq", value: "obc", label: "OBC category" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
  ]);
  const result = evaluate(user, scheme);
  assertEqual(result.status, "not_eligible");
});

// 17. Closed scheme: last_date before today (handled by dates.ts, but engine should work)
// Just verify engine works with any scheme regardless of dates

// 18. applyScore math: rule score + doc score
test("applyScore: 70% rules + 30% docs", () => {
  const user = makeUser({
    land_hectares: 1.5,
    land_ownership: "owner",
    documents_have: ["Aadhaar", "Bank passbook"], // Missing "Land record"
  });
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 ha" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Owner" }
  ], { documents: ["Aadhaar", "Land record", "Bank passbook"] });

  const score = applyScore(user, scheme);
  // 2/2 rules passed = 1.0, 2/3 docs = 0.666...
  // 70 * 1.0 + 30 * 0.666... = 70 + 20 = 90
  assertEqual(score.score, 90);
  assertEqual(score.passed_rules, 2);
  assertEqual(score.total_rules, 2);
  assertEqual(score.docs_owned, 2);
  assertEqual(score.docs_required, 3);
  assert(score.reason.includes("90%"));
});

// 19. applyScore: all rules pass, all docs owned
test("applyScore: perfect score", () => {
  const user = makeUser({
    land_hectares: 1.5,
    land_ownership: "owner",
    documents_have: ["Aadhaar", "Land record", "Bank passbook"],
  });
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 ha" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Owner" }
  ], { documents: ["Aadhaar", "Land record", "Bank passbook"] });

  const score = applyScore(user, scheme);
  assertEqual(score.score, 100);
  assert(score.reason.includes("100%"));
});

// 20. applyScore: zero rules (edge case) - both ruleScore and docScore = 1 when denominator 0
test("applyScore: zero rules and zero docs -> 100 (both treated as 1)", () => {
  const user = makeUser();
  const scheme = makeScheme([], { documents: [] });
  const score = applyScore(user, scheme);
  // 0 rules -> ruleScore = 1, 0 docs -> docScore = 1
  // 70 * 1 + 30 * 1 = 100
  assertEqual(score.score, 100);
});

test("applyScore: zero rules but has docs -> 70*1 + 30*0 = 70", () => {
  const user = makeUser({ documents_have: [] });
  const scheme = makeScheme([], { documents: ["Aadhaar"] });
  const score = applyScore(user, scheme);
  // 0 rules -> ruleScore = 1, 0/1 docs = 0
  // 70 * 1 + 30 * 0 = 70
  assertEqual(score.score, 70);
});

// 21. applyScore: zero docs required
test("applyScore: zero docs defaults to 1", () => {
  const user = makeUser();
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 ha" }
  ], { documents: [] });
  const score = applyScore(user, scheme);
  // 1/1 rules = 1, 0 docs -> docScore = 1
  // 70 * 1 + 30 * 1 = 100
  assertEqual(score.score, 100);
});

// 22. whyYouQualify returns passed rule labels
test("whyYouQualify: returns passed rule labels", () => {
  const user = makeUser({ land_hectares: 1.5, land_ownership: "owner" });
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Land up to 2 hectares" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
  ]);
  const result = whyYouQualify(user, scheme);
  assertEqual(result.labels.length, 2);
  assertEqual(result.labels[0], "Land up to 2 hectares");
  assertEqual(result.labels[1], "Land owner");
});

// 23. whyYouQualify: only some rules pass
test("whyYouQualify: only returns passed labels", () => {
  const user = makeUser({ land_hectares: 2.5, land_ownership: "owner" });
  const scheme = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Land up to 2 hectares" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Land owner" }
  ]);
  const result = whyYouQualify(user, scheme);
  assertEqual(result.labels.length, 1);
  assertEqual(result.labels[0], "Land owner");
});

// 24. Demo users get different eligible lists
test("demo users: farmer gets farmer schemes", () => {
  const farmer = makeUser({
    role: "farmer",
    land_hectares: 1.2,
    land_ownership: "owner",
    has_kcc: false,
  });
  const pmKisan = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 ha" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Owner" }
  ], { id: "pm-kisan", role: "farmer" });

  const result = evaluate(farmer, pmKisan);
  assertEqual(result.status, "eligible");
});

test("demo users: student does not get farmer schemes", () => {
  const student = makeUser({
    role: "student",
    education_level: "ug",
    last_exam_percent: 84,
    annual_income: 200000,
    institution_type: "govt",
    land_hectares: 0,
    land_ownership: "none",
  });
  const pmKisan = makeScheme([
    { field: "land_hectares", op: "lte", value: 2, label: "Up to 2 ha" },
    { field: "land_ownership", op: "eq", value: "owner", label: "Owner" }
  ], { id: "pm-kisan", role: "farmer" });

  const result = evaluate(student, pmKisan);
  // Student has land_hectares=0 (passes lte 2) but land_ownership="none" (fails eq "owner")
  // Failed rule is non-numeric (eq) -> not near_miss -> not_eligible
  assertEqual(result.status, "not_eligible");
  assertEqual(result.failed.length, 1);
  assertEqual(result.passed.length, 1);
});

test("demo users: student gets student scheme", () => {
  const student = makeUser({
    role: "student",
    education_level: "ug",
    last_exam_percent: 84,
    annual_income: 200000,
    institution_type: "govt",
  });
  const csss = makeScheme([
    { field: "education_level", op: "in", value: ["ug", "pg"], label: "UG or PG" },
    { field: "last_exam_percent", op: "gte", value: 80, label: "80%+" },
    { field: "annual_income", op: "lte", value: 450000, label: "Income ≤ ₹4.5L" },
    { field: "institution_type", op: "eq", value: "govt", label: "Govt institution" }
  ], { id: "csss", role: "student" });

  const result = evaluate(student, csss);
  assertEqual(result.status, "eligible");
});

test("demo users: business gets business scheme", () => {
  const business = makeUser({
    role: "business",
    business_stage: "new",
    annual_turnover: 500000,
  });
  const mudra = makeScheme([
    { field: "business_stage", op: "in", value: ["idea", "new", "existing"], label: "Any stage" },
    { field: "annual_turnover", op: "lte", value: 5000000, label: "Turnover ≤ ₹50L" }
  ], { id: "pm-mudra", role: "business" });

  const result = evaluate(business, mudra);
  assertEqual(result.status, "eligible");
});

// Summary
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
}