"use client";

import { useState } from "react";
import Link from "next/link";

const roleChips = [
  {
    id: "farmer",
    label: "Farmer",
    description: "PM-KISAN, KCC, Fasal Bima, PM-KUSUM, Soil Health Card…",
    schemes: [
      { name: "PM-KISAN", benefit: "₹6,000/year income support", badge: "Closing soon" },
      { name: "Kisan Credit Card", benefit: "Low-interest crop loans", badge: "New" },
      { name: "PM Fasal Bima", benefit: "Crop insurance", badge: "Open all year" },
    ],
  },
  {
    id: "student",
    label: "Student",
    description: "Central Sector Scholarship, Post-Matric, PM-Vidyalaxmi, Nijut Moina…",
    schemes: [
      { name: "Central Sector Scholarship", benefit: "Up to ₹20,000/year", badge: "New" },
      { name: "Post-Matric (SC/ST/OBC)", benefit: "Full fee reimbursement", badge: "Closing soon" },
      { name: "Nijut Moina (Assam)", benefit: "Monthly stipend for girls", badge: "Open all year" },
    ],
  },
  {
    id: "business",
    label: "Business owner",
    description: "PM Mudra, Stand-Up India, PMEGP, CGTMSE, PM Vishwakarma…",
    schemes: [
      { name: "PM Mudra Yojana", benefit: "Up to ₹10 lakh loan", badge: "New" },
      { name: "Stand-Up India", benefit: "₹10 lakh–₹1 cr for SC/ST/women", badge: "Closing soon" },
      { name: "PMEGP", benefit: "Subsidy on project cost", badge: "Open all year" },
    ],
  },
] as const;

type RoleId = "farmer" | "student" | "business";

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<RoleId>("farmer");

  const role = roleChips.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gamosa edge at top */}
      <div className="gamosa-edge w-full" aria-hidden="true" />

      <header className="border-b border-[var(--sage)] bg-[var(--surface)] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-[var(--font-young-serif)] text-[var(--ink)]">Haq Dilao</span>
            <span className="text-[10px] font-[var(--font-figtree)] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--slate)] hover:text-[var(--ink)] transition-colors">Log in</Link>
            <Link href="/register" className="px-4 py-2 bg-[var(--ink)] text-white rounded-[var(--radius-input)] text-sm font-medium hover:bg-[var(--ink)]/90 transition-colors">Check my schemes</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center mb-12 sm:mb-16">
          <h1 className="font-[var(--font-young-serif)] text-[40px] sm:text-[56px] leading-tight text-[var(--ink)] mb-6 max-w-prose mx-auto">
            Know what you can claim
          </h1>
          <p className="text-[var(--slate)] text-lg max-w-2xl mx-auto">
            Hundreds of government schemes exist. Only a few are yours.
            Register once — we show you exactly which ones you qualify for, prepare your application, and remind you of deadlines.
          </p>
        </section>

        {/* Role selector */}
        <section className="mb-12" aria-labelledby="role-heading">
          <h2 id="role-heading" className="sr-only">Choose your role</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8" role="radiogroup" aria-label="Select your role">
            {roleChips.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={selectedRole === r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`px-6 py-3 rounded-[var(--radius-badge)] font-medium text-base transition-all ${
                  selectedRole === r.id
                    ? "bg-[var(--ink)] text-white shadow-[var(--shadow-soft)]"
                    : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--sage)] hover:border-[var(--slate)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Sample claim slips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {role.schemes.map((s, i) => (
              <article key={s.name} className="claim-slip p-4 relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-[var(--font-young-serif)] text-[22px] text-[var(--ink)] pr-4">{s.name}</h3>
                  <span className={`badge-${s.badge === "New" ? "new" : s.badge === "Closing soon" ? "closing" : "open"} px-2 py-0.5 rounded-[var(--radius-badge)] text-xs font-medium whitespace-nowrap flex-shrink-0`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-[var(--slate)] text-sm mb-4">{s.benefit}</p>
                <div className="border-t border-dashed border-[var(--sage)] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--slate)]">Why you qualify: Land up to 2 ha</span>
                    <span className="text-sm font-medium text-[var(--ink)]">Closes in 5 days</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--ink)] text-white text-base font-medium rounded-[var(--radius-input)] hover:bg-[var(--ink)]/90 transition-colors shadow-[var(--shadow-soft)]"
          >
            Check my schemes
          </Link>
          <p className="mt-4 text-sm text-[var(--slate)]">
            2-minute registration · No Aadhaar stored · Works offline
          </p>
        </section>

        {/* Trust signals */}
        <section className="mt-16 border-t border-[var(--sage)] pt-8 text-center">
          <p className="text-xs text-[var(--slate)] mb-2">Scheme data from official sources</p>
          <div className="flex flex-wrap gap-4 justify-center text-xs text-[var(--slate)]">
            <span>myscheme.gov.in</span>
            <span>·</span>
            <span>pmkisan.gov.in</span>
            <span>·</span>
            <span>scholarships.gov.in</span>
            <span>·</span>
            <span>udyamregistration.gov.in</span>
            <span>·</span>
            <span>Assam govt portals</span>
          </div>
          <p className="mt-2 text-xs text-[var(--slate)]">
            Data is curated; verify on the official portal before applying.
          </p>
        </section>
      </main>

      {/* Footer gamosa edge */}
      <div className="gamosa-edge w-full" aria-hidden="true" />
    </div>
  );
}