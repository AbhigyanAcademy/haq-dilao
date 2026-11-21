// Haq Dilao — Apply Sheet Page
// Pre-filled answers from profile + form_fields, copy buttons, open portal, mark applied

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { User, Scheme } from "@/lib/types";

// --- Mesh Background ---
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

// --- Gamosa Thread ---
function GamosaThread() {
  return <div className="gamosa-thread" aria-hidden="true" />;
}

// --- Toast ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 toast animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--eligible)]">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

function ApplyPageContent() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showMarkApplied, setShowMarkApplied] = useState(false);
  const [applicationRef, setApplicationRef] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, schemeRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/schemes/${schemeId}`),
        ]);

        const userData = await userRes.json();
        const schemeData = await schemeRes.json();

        if (!userData.user) {
          router.push("/login");
          return;
        }

        if (!schemeData.scheme) {
          setError("Scheme not found");
          return;
        }

        setUser(userData.user);
        setScheme(schemeData.scheme);

        // Pre-fill answers from user profile
        const prefilled: Record<string, string> = {};
        for (const field of schemeData.scheme.form_fields) {
          const value = getProfileValue(userData.user, field);
          if (value) prefilled[field] = value;
        }
        setAnswers(prefilled);
      } catch (err) {
        console.error("Failed to load apply page:", err);
        setError("Failed to load scheme");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [schemeId, router]);

  function getProfileValue(user: User, field: string): string {
    const fieldMap: Record<string, keyof User> = {
      name: "name",
      email: "email",
      age: "age",
      gender: "gender",
      state: "state",
      district: "district",
      category: "category",
      annual_income: "annual_income",
      land_hectares: "land_hectares",
      land_ownership: "land_ownership",
      crops: "crops",
      has_irrigation: "has_irrigation",
      has_kcc: "has_kcc",
      bank_account_linked: "bank_account_linked",
      education_level: "education_level",
      course: "course",
      institution_type: "institution_type",
      last_exam_percent: "last_exam_percent",
      studying_outside_state: "studying_outside_state",
      business_stage: "business_stage",
      sector: "sector",
      annual_turnover: "annual_turnover",
      employees: "employees",
      udyam_registered: "udyam_registered",
      loan_needed: "loan_needed",
      woman_owned: "woman_owned",
      sc_st_owned: "sc_st_owned",
    };

    const key = fieldMap[field];
    if (!key) return "";

    const value = user[key];
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value ?? "");
  }

  function handleCopy(field: string, value: string) {
    navigator.clipboard.writeText(value);
    setToast(`Copied ${field}`);
    setTimeout(() => setToast(null), 2500);
  }

  function handleOpenPortal() {
    if (scheme?.apply_url) {
      window.open(scheme.apply_url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleMarkApplied() {
    if (!applicationRef.trim()) return;

    const newApplication = {
      id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: user!.id,
      scheme_id: scheme!.id,
      applied_at: new Date().toISOString(),
      application_ref: applicationRef.trim(),
      status: "applied" as const,
      history: [{ status: "applied" as const, at: new Date().toISOString(), note: "Application submitted" }],
    };

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApplication),
      });

      if (!response.ok) {
        console.error("Failed to create application");
        return;
      }

      setShowMarkApplied(false);
      setApplicationRef("");
      router.push("/applications");
    } catch (error) {
      console.error("Failed to create application:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <MeshBackground />
        <GamosaThread />
        <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
            </div>
          </div>
        </header>
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center w-full max-w-3xl">
            <div className="skeleton h-10 w-3/4 mx-auto mb-4 rounded" />
            <div className="skeleton h-6 w-1/2 mx-auto mb-4 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !scheme || !user) {
    return (
      <div className="min-h-screen relative">
        <MeshBackground />
        <GamosaThread />
        <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
            </div>
            <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Back to dashboard
            </Link>
          </div>
        </header>
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16">
          <div className="empty-state glass-card text-center">
            <h2 className="empty-state-title">Scheme not found</h2>
            <p className="text-[var(--text-2)] mb-4">{error || "The scheme you're looking for doesn't exist."}</p>
            <Link href="/dashboard" className="btn-primary inline-block empty-state-action">
              Back to dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <MeshBackground />
      <GamosaThread />

      <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Back to schemes
            </Link>
            <Link href="/profile" className="px-3 py-1.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Profile
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="px-3 py-1.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16">
        {/* Scheme header */}
        <div className="mb-8">
          <Link href={`/schemes/${scheme.id}`} className="text-[var(--new)] hover:underline text-sm mb-4 inline-block">
            ← Back to scheme details
          </Link>
          <h1 className="serif text-[40px] text-[var(--text-1)] mb-2">{scheme.name}</h1>
          <p className="text-[var(--text-2)] text-lg">{scheme.benefit}</p>
        </div>

        {/* Application Sheet */}
        <section className="glass-card overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10">
            <h2 className="serif text-[22px] text-[var(--text-1)]">Application sheet</h2>
            <p className="text-[var(--text-2)] text-sm mt-1">Pre-filled from your profile. Verify and copy each field.</p>
          </div>
          <div className="p-5 glass-inner space-y-4">
            {scheme.form_fields.length > 0 ? (
              <div className="space-y-3">
                {scheme.form_fields.map(field => {
                  const value = answers[field] || "";
                  const label = field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={field} className="flex items-center justify-between p-3 rounded-[var(--radius-input)] bg-white/5 border border-white/10">
                      <div className="flex-1 min-w-0">
                        <label className="text-xs text-[var(--text-3)] mb-1 block">{label}</label>
                        <div className="text-[var(--text-1)] font-mono text-sm bg-white/5 px-3 py-2 rounded-[var(--radius-input)] break-all">
                          {value || <span className="text-[var(--text-3)]">Not filled</span>}
                        </div>
                      </div>
                      {value && (
                        <button
                          onClick={() => handleCopy(field, value)}
                          className="btn-copy ml-3 flex-shrink-0"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--text-2)]">No form fields defined for this scheme.</p>
            )}

            {scheme.apply_url && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleOpenPortal}
                  className="btn-primary w-full md:w-auto py-3"
                >
                  Open official portal
                </button>
                <p className="text-xs text-[var(--text-3)] mt-2 text-center md:text-left">
                  Opens in a new tab. You will need to log in, solve captcha/OTP, and submit manually.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Document Checklist */}
        <section className="glass-card overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10">
            <h2 className="serif text-[22px] text-[var(--text-1)]">Documents needed</h2>
          </div>
          <div className="p-5 glass-inner">
            <ul className="space-y-3">
              {scheme.documents.map(doc => {
                const hasDoc = user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase());
                return (
                  <li key={doc} className="flex items-center justify-between p-3 rounded-[var(--radius-input)] bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className={hasDoc ? "text-[var(--eligible)]" : "text-[var(--urgent)]"}>
                        {hasDoc ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[var(--text-1)]">{doc}</span>
                    </div>
                    <span className={`text-sm font-medium ${hasDoc ? "text-[var(--eligible)]" : "text-[var(--urgent)]"}`}>
                      {hasDoc ? "Ready" : "Missing"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Mark as Applied */}
        <section className="glass-card overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10">
            <h2 className="serif text-[22px] text-[var(--text-1)]">I have applied</h2>
          </div>
          <div className="p-5 glass-inner space-y-4">
            <p className="text-[var(--text-2)]">
              After submitting on the official portal, enter your application/reference ID here to track it.
            </p>
            {showMarkApplied ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="application_ref" className="field-label">Application / Reference ID</label>
                  <input
                    id="application_ref"
                    type="text"
                    value={applicationRef}
                    onChange={e => setApplicationRef(e.target.value)}
                    className="field-input"
                    placeholder="e.g., PMKISAN2024123456"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleMarkApplied}
                    disabled={!applicationRef.trim()}
                    className="btn-primary flex-1 py-3 disabled:opacity-50"
                  >
                    Mark as applied
                  </button>
                  <button
                    onClick={() => setShowMarkApplied(false)}
                    className="px-6 py-3 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowMarkApplied(true)}
                className="btn-primary w-full md:w-auto py-3"
              >
                I have applied
              </button>
            )}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-[var(--text-3)] max-w-3xl mx-auto">
          Scheme data is curated; verify on the official portal before applying.
        </p>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative">
        <MeshBackground />
        <GamosaThread />
        <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
            </div>
          </div>
        </header>
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center w-full max-w-3xl">
            <div className="skeleton h-10 w-3/4 mx-auto mb-4 rounded" />
            <div className="skeleton h-6 w-1/2 mx-auto mb-4 rounded" />
            <div className="skeleton h-4 w-1/3 mx-auto mb-8 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="skeleton h-64 w-full rounded-[var(--radius-card)]" />
                <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
              </div>
              <div className="space-y-4">
                <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
                <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  );
}