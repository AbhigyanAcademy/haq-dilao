// Haq Dilao — Seed script for demo users and demo schemes
// Run with: npx tsx scripts/seed.ts

import { store, newUserId, newSchemeId } from "../lib/store";
import * as bcrypt from "bcryptjs";
import { todayISO } from "../lib/dates";

const PASSWORD = "Demo@1234";
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);

function main() {
  console.log("🌱 Seeding demo data...");

  // --- 1. Demo Users ---
  const existingUsers = store.users.read();
  const existingEmails = new Set(existingUsers.map(u => u.email));

  const demoUsers = [
    {
      email: "farmer@demo.com",
      role: "farmer" as const,
      name: "Ravi Bora",
      age: 42,
      gender: "male" as const,
      state: "Assam",
      district: "Jorhat",
      category: "obc" as const,
      annual_income: 150000,
      disability: false,
      documents_have: ["Aadhaar", "Bank passbook", "Land record"],
      // Farmer fields
      land_hectares: 1.2,
      land_ownership: "owner" as const,
      crops: ["Rice", "Tea"],
      has_irrigation: false,
      has_kcc: false,
      bank_account_linked: true,
      // Student fields (empty)
      // Business fields (empty)
    },
    {
      email: "student@demo.com",
      role: "student" as const,
      name: "Priya Das",
      age: 20,
      gender: "female" as const,
      state: "Assam",
      district: "Kamrup Metropolitan",
      category: "sc" as const,
      annual_income: 200000,
      disability: false,
      documents_have: ["Aadhaar", "Bank passbook", "Caste certificate", "Income certificate"],
      // Student fields
      education_level: "ug" as const,
      course: "B.Sc. Agriculture",
      institution_type: "govt" as const,
      last_exam_percent: 84,
      studying_outside_state: false,
      // Farmer fields (empty)
      // Business fields (empty)
    },
    {
      email: "business@demo.com",
      role: "business" as const,
      name: "Amit Sharma",
      age: 28,
      gender: "male" as const,
      state: "Assam",
      district: "Kamrup Metropolitan",
      category: "general" as const,
      annual_income: 600000,
      disability: false,
      documents_have: ["Aadhaar", "PAN", "Bank passbook", "Business registration"],
      // Business fields
      business_stage: "new" as const,
      sector: "retail",
      annual_turnover: 500000,
      employees: 2,
      udyam_registered: true,
      loan_needed: true,
      woman_owned: false,
      sc_st_owned: false,
      // Farmer fields (empty)
      // Student fields (empty)
    },
  ];

  let usersAdded = 0;
  for (const du of demoUsers) {
    if (existingEmails.has(du.email)) {
      console.log(`  ⏭ User ${du.email} already exists, skipping`);
      continue;
    }
    const user = {
      id: newUserId(),
      email: du.email,
      password_hash: PASSWORD_HASH,
      created_at: new Date().toISOString(),
      role: du.role,
      name: du.name,
      age: du.age,
      gender: du.gender,
      state: du.state,
      district: du.district,
      category: du.category,
      annual_income: du.annual_income,
      disability: du.disability,
      documents_have: du.documents_have,
      // Farmer
      land_hectares: du.land_hectares ?? 0,
      land_ownership: du.land_ownership ?? ("none" as const),
      crops: du.crops ?? [],
      has_irrigation: du.has_irrigation ?? false,
      has_kcc: du.has_kcc ?? false,
      bank_account_linked: du.bank_account_linked ?? true,
      // Student
      education_level: du.education_level ?? ("school" as const),
      course: du.course ?? "",
      institution_type: du.institution_type ?? ("govt" as const),
      last_exam_percent: du.last_exam_percent ?? 0,
      studying_outside_state: du.studying_outside_state ?? false,
      // Business
      business_stage: du.business_stage ?? ("idea" as const),
      sector: du.sector ?? "",
      annual_turnover: du.annual_turnover ?? 0,
      employees: du.employees ?? 0,
      udyam_registered: du.udyam_registered ?? false,
      loan_needed: du.loan_needed ?? false,
      woman_owned: du.woman_owned ?? false,
      sc_st_owned: du.sc_st_owned ?? false,
    };
    existingUsers.push(user);
    usersAdded++;
    console.log(`  ✅ Added user: ${du.email} (${du.role})`);
  }
  if (usersAdded > 0) {
    store.users.write(existingUsers);
  }

  // --- 2. Demo Schemes (one per role, last_date = today + 3 days) ---
  const existingSchemes = store.schemes.read();
  const existingSchemeIds = new Set(existingSchemes.map(s => s.id));

  const demoSchemes = [
    {
      id: "demo-farmer-scheme",
      role: "farmer" as const,
      name: "DEMO: PM-KISAN (Demo)",
      benefit: "₹6,000/year — demo scheme for testing",
      rules: [
        { field: "land_hectares", op: "lte" as const, value: 2, label: "Land holding up to 2 hectares" },
        { field: "land_ownership", op: "eq" as const, value: "owner", label: "Land owner" }
      ],
      documents: ["Aadhaar", "Land record", "Bank passbook"],
      apply_url: "/mock-portal/scholarship",
      source_url: null,
      form_fields: ["name", "district", "land_hectares"],
      posted_date: todayISO(),
      last_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); })(),
      status_note: "Demo scheme — expires in 3 days",
      summary_fallback: "Demo scheme for testing the apply flow. This is not a real government scheme.",
      verified: false,
      last_verified: null,
      verify_notes: "Demo scheme only",
      is_demo: true,
      autofill: {
        portal_match: "localhost:3000/mock-portal",
        fields: [
          { profile: "name", selector: "#name", type: "text" as const },
          { profile: "district", selector: "#district", type: "text" as const },
          { profile: "land_hectares", selector: "#land_hectares", type: "text" as const },
        ]
      }
    },
    {
      id: "demo-student-scheme",
      role: "student" as const,
      name: "DEMO: Central Sector Scholarship (Demo)",
      benefit: "₹10,000-20,000/year — demo scheme for testing",
      rules: [
        { field: "education_level", op: "in" as const, value: ["ug", "pg"], label: "UG or PG student" },
        { field: "last_exam_percent", op: "gte" as const, value: 80, label: "80%+ in Class 12" },
        { field: "annual_income", op: "lte" as const, value: 450000, label: "Income up to ₹4.5 lakh" },
        { field: "institution_type", op: "eq" as const, value: "govt", label: "Government institution" }
      ],
      documents: ["Aadhaar", "Class 12 marksheet", "Income certificate", "Bank passbook", "Bonafide certificate"],
      apply_url: "/mock-portal/scholarship",
      source_url: null,
      form_fields: ["name", "course", "institution_name", "class12_percentage", "annual_income"],
      posted_date: todayISO(),
      last_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); })(),
      status_note: "Demo scheme — expires in 3 days",
      summary_fallback: "Demo scheme for testing the apply flow. This is not a real government scheme.",
      verified: false,
      last_verified: null,
      verify_notes: "Demo scheme only",
      is_demo: true,
      autofill: {
        portal_match: "localhost:3000/mock-portal",
        fields: [
          { profile: "name", selector: "#name", type: "text" as const },
          { profile: "course", selector: "#course", type: "text" as const },
          { profile: "institution_type", selector: "#institution_type", type: "text" as const },
        ]
      }
    },
    {
      id: "demo-business-scheme",
      role: "business" as const,
      name: "DEMO: PM Mudra Yojana (Demo)",
      benefit: "Up to ₹10 lakh loan — demo scheme for testing",
      rules: [
        { field: "business_stage", op: "in" as const, value: ["idea", "new", "existing"], label: "Any business stage" },
        { field: "annual_turnover", op: "lte" as const, value: 5000000, label: "Turnover up to ₹50 lakh" }
      ],
      documents: ["Aadhaar", "PAN", "Business proof", "Bank statement"],
      apply_url: "/mock-portal/scholarship",
      source_url: null,
      form_fields: ["name", "business_name", "business_stage", "annual_turnover", "loan_amount"],
      posted_date: todayISO(),
      last_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); })(),
      status_note: "Demo scheme — expires in 3 days",
      summary_fallback: "Demo scheme for testing the apply flow. This is not a real government scheme.",
      verified: false,
      last_verified: null,
      verify_notes: "Demo scheme only",
      is_demo: true,
      autofill: {
        portal_match: "localhost:3000/mock-portal",
        fields: [
          { profile: "name", selector: "#name", type: "text" as const },
          { profile: "business_name", selector: "#business_name", type: "text" as const },
          { profile: "business_stage", selector: "#business_stage", type: "text" as const },
        ]
      }
    },
  ];

  let schemesAdded = 0;
  for (const ds of demoSchemes) {
    if (existingSchemeIds.has(ds.id)) {
      console.log(`  ⏭ Demo scheme ${ds.id} already exists, skipping`);
      continue;
    }
    existingSchemes.push(ds);
    schemesAdded++;
    console.log(`  ✅ Added demo scheme: ${ds.name}`);
  }
  if (schemesAdded > 0) {
    store.schemes.write(existingSchemes);
  }

  // --- 3. Ensure empty data files exist ---
  const emptyFiles = [
    { name: "applications.json", fallback: [] },
    { name: "notifications.json", fallback: [] },
    { name: "summary-cache.json", fallback: [] },
    { name: "insight-cache.json", fallback: [] },
  ];

  for (const f of emptyFiles) {
    const data = store.applications.read(); // readJSON handles missing files
    // Files will be created on first write
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Users added: ${usersAdded}`);
  console.log(`   Demo schemes added: ${schemesAdded}`);
  console.log(`   All demo users password: ${PASSWORD}`);
}

main();