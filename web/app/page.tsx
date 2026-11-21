"use client";

import { useState, useEffect } from "react";
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

function MeshBackground() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className={`mesh-background ${paused ? "mesh-paused" : ""}`} aria-hidden="true">
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
    </div>
  );
}

interface SampleScheme {
  name: string;
  benefit: string;
  badge: "New" | "Closing soon" | "Open all year";
}

function SampleClaimSlip({ scheme, index }: { scheme: SampleScheme; index: number }) {
  const badgeClass = scheme.badge === "New" ? "badge-new"
    : scheme.badge === "Closing soon" ? "badge-urgent"
    : scheme.badge === "Open all year" ? "badge-open"
    : "badge-new";

  return (
    <article className="glass-card p-5 relative overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="serif text-[22px] text-[var(--text-1)] pr-4">{scheme.name}</h3>
        <span className={`badge ${badgeClass} flex-shrink-0`}>
          {scheme.badge}
        </span>
      </div>
      <p className="text-[var(--text-2)] text-sm mb-4">{scheme.benefit}</p>
      <div className="border-t border-dashed border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-3)]">Why you qualify: Land up to 2 ha</span>
          <span className="text-sm font-medium text-[var(--text-1)]">Closes in 5 days</span>
        </div>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<RoleId>("farmer");

  const role = roleChips.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Mesh background */}
      <MeshBackground />

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
            <span className="text-[10px] font-[var(--font-figtree)] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">Log in</Link>
            <Link href="/register" className="btn-primary text-sm">Check my schemes</Link>
          </nav>
        </div>
        {/* Gamosa thread */}
        <div className="gamosa-thread" aria-hidden="true" />
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 sm:py-16 relative z-10">
        {/* Hero */}
        <section className="text-center mb-12 sm:mb-16">
          <h1 className="serif text-[44px] sm:text-[56px] leading-tight text-[var(--text-1)] mb-6 max-w-prose mx-auto">
            Know what you can claim
          </h1>
          <p className="text-[var(--text-2)] text-lg max-w-2xl mx-auto">
            Hundreds of government schemes exist. Only a few are yours.
            Register once — we show you exactly which ones you qualify for, prepare your application, and remind you of deadlines.
          </p>
        </section>

        {/* Role selector */}
        <section className="mb-12" aria-labelledby="role-heading">
          <h2 id="role-heading" className="sr-only">Choose your role</h2>
          <div className="flex flex-wrap gap-3 justify-center mb-8" role="radiogroup" aria-label="Select your role">
            {roleChips.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={selectedRole === r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`px-5 py-2.5 rounded-[var(--radius-badge)] font-medium text-sm transition-all ${
                  selectedRole === r.id
                    ? "bg-white text-[var(--obsidian)] shadow-[var(--glass-shadow)]"
                    : "bg-white/5 text-[var(--text-1)] border border-white/10 hover:border-white/20"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Sample claim slips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {role.schemes.map((s, i) => (
              <SampleClaimSlip key={s.name} scheme={s} index={i} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 btn-primary text-base shadow-[var(--glass-shadow)]"
          >
            Check my schemes
          </Link>
          <p className="mt-4 text-sm text-[var(--text-3)]">
            2-minute registration · No Aadhaar stored · Works offline
          </p>
        </section>

        {/* Trust signals */}
        <section className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-[var(--text-3)] mb-2">Scheme data from official sources</p>
          <div className="flex flex-wrap gap-4 justify-center text-xs text-[var(--text-3)]">
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
          <p className="mt-2 text-xs text-[var(--text-3)]">
            Data is curated; verify on the official portal before applying.
          </p>
        </section>
      </main>
    </div>
  );
}