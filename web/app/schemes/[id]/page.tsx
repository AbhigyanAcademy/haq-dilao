// Haq Dilao — Scheme Detail Page
// Shows AI summary, why you qualify, documents checklist, dates, apply button

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { evaluate, applyScore, whyYouQualify } from "@/lib/eligibility";
import { getSchemeDateInfo } from "@/lib/dates";
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

// --- Badge ---
function Badge({ label, variant }: { label: string; variant: "new" | "closing" | "urgent" | "open" | "eligible" | "applied" }) {
  const variantClass = {
    new: "badge-new",
    closing: "badge-closing",
    urgent: "badge-urgent",
    open: "badge-open",
    eligible: "badge-eligible",
    applied: "badge-applied",
  }[variant];

  return <span className={`badge ${variantClass}`}>{label}</span>;
}

// --- Score Ring ---
function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg className="score-ring-svg" viewBox="0 0 100 100" role="img" aria-label={`${score}% ready`}>
      <circle className="score-ring-bg" cx="50" cy="50" r="45" />
      <circle
        className="score-ring-progress"
        cx="50"
        cy="50"
        r="45"
        style={{ strokeDashoffset: offset }}
      />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="600" fontFamily="Figtree, sans-serif">
        {score}%
      </text>
    </svg>
  );
}

// --- Document Checklist ---
function DocChecklist({
  scheme,
  user,
  onToggleDoc,
}: {
  scheme: Scheme;
  user: User;
  onToggleDoc: (doc: string) => void;
}) {
  const score = applyScore(user, scheme);

  return (
    <div className="glass-inner p-5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="serif text-[22px] text-[var(--text-1)]">Documents</h3>
        <div className="flex items-center gap-2">
          <ScoreRing score={score.score} />
          <span className="text-sm font-medium text-[var(--text-1)]">{score.docs_owned}/{score.docs_required} ready</span>
        </div>
      </div>

      <div className="space-y-2">
        {scheme.documents.map(doc => {
          const hasDoc = user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase());
          return (
            <button
              key={doc}
              onClick={() => onToggleDoc(doc)}
              className="w-full flex items-center justify-between p-4 rounded-[var(--radius-input)] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={hasDoc ? "text-[var(--eligible)]" : "text-[var(--urgent)]"}>
                  {hasDoc ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </span>
                <span className="text-[var(--text-1)]">{doc}</span>
              </div>
              <span className={`text-sm font-medium ${hasDoc ? "text-[var(--eligible)]" : "text-[var(--urgent)]"}`}>
                {hasDoc ? "You have this" : "Tap to mark collected"}
              </span>
            </button>
          );
        })}

        {score.docs_owned < score.docs_required && (
          <p className="text-xs text-[var(--text-3)] pt-2 border-t border-white/10">
            Tap a missing document to mark it as collected. Your apply score will update.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Sticky Apply Bar (Mobile) ---
function StickyApplyBar({
  scheme,
  user,
  onApply,
}: {
  scheme: Scheme;
  user: User;
  onApply: () => void;
}) {
  const score = applyScore(user, scheme);
  const dateInfo = getSchemeDateInfo(scheme.posted_date, scheme.last_date);

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden glass-card border-t border-white/10 p-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="serif text-[22px] text-[var(--text-1)]">{scheme.name}</p>
          <p className="text-[var(--text-2)] text-sm">{score.reason}</p>
        </div>
        <Badge label={dateInfo.label} variant={
          dateInfo.label === "New" ? "new" :
          dateInfo.label === "Closing soon" ? (dateInfo.daysUntilClose !== null && dateInfo.daysUntilClose <= 3 ? "urgent" : "closing") :
          "open"
        } />
      </div>
      <button onClick={onApply} className="btn-primary w-full py-3">
        View and apply
      </button>
    </div>
  );
}

// --- Main Scheme Detail Content ---
function SchemeDetailContentInner() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documentsHave, setDocumentsHave] = useState<string[]>([]);

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
        setDocumentsHave(userData.user.documents_have || []);
      } catch (err) {
        console.error("Failed to load scheme:", err);
        setError("Failed to load scheme");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [schemeId, router]);

  const handleToggleDoc = (doc: string) => {
    setDocumentsHave(prev => {
      const hasDoc = prev.some(d => d.toLowerCase() === doc.toLowerCase());
      const updated = hasDoc
        ? prev.filter(d => d.toLowerCase() !== doc.toLowerCase())
        : [...prev, doc];

      // Sync with server
      fetch("/api/user/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents_have: updated }),
      }).catch(console.error);

      return updated;
    });
  };

  const handleApply = () => {
    router.push(`/schemes/${schemeId}/apply`);
  };

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

  const evalResult = evaluate(user, scheme);
  const score = applyScore(user, scheme);
  const whyQualify = whyYouQualify(user, scheme);
  const dateInfo = getSchemeDateInfo(scheme.posted_date, scheme.last_date);
  const isEligible = evalResult.status === "eligible";

  return (
    <div className="min-h-screen relative pb-[100px] md:pb-0">
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
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="serif text-[40px] text-[var(--text-1)] mb-2">{scheme.name}</h1>
              <p className="text-[var(--text-2)] text-lg">{scheme.benefit}</p>
            </div>
            <Badge label={dateInfo.label} variant={
              dateInfo.label === "New" ? "new" :
              dateInfo.label === "Closing soon" ? (dateInfo.daysUntilClose !== null && dateInfo.daysUntilClose <= 3 ? "urgent" : "closing") :
              "open"
            } />
          </div>

          {/* Countdown */}
          {dateInfo.countdownText && (
            <p className="text-lg font-medium text-[var(--text-1)]">
              {dateInfo.countdownText}
            </p>
          )}

          {/* Eligibility status */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-badge)] ${isEligible ? "bg-[var(--eligible)]/20 text-[var(--eligible)]" : "bg-[var(--urgent)]/20 text-[var(--urgent)]"}`}>
              <span className={`w-2 h-2 rounded-full ${isEligible ? "bg-[var(--eligible)]" : "bg-[var(--urgent)]"}`} />
              {isEligible ? "You are eligible" : "Not eligible"}
            </span>
            {evalResult.status === "near_miss" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-badge)] bg-[var(--soon)]/20 text-[var(--soon)]">
                Near miss — check missing requirement
              </span>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Summary & Why you qualify */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            {/* AI Summary */}
            <section className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h2 className="serif text-[22px] text-[var(--text-1)]">About this scheme</h2>
              </div>
              <div className="p-5 glass-inner">
                <p className="text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">
                  {scheme.summary_fallback}
                </p>
              </div>
            </section>

            {/* Why you qualify */}
            <section className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h2 className="serif text-[22px] text-[var(--text-1)]">Why you qualify</h2>
              </div>
              <div className="p-5 glass-inner">
                {whyQualify.labels.length > 0 ? (
                  <ul className="space-y-3">
                    {whyQualify.labels.map((label, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--eligible)] flex-shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[var(--text-1)]">{label}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--text-2)]">No matching rules found.</p>
                )}

                {evalResult.failed.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-medium text-[var(--urgent)] mb-2">Requirements not met:</p>
                    <ul className="space-y-2">
                      {evalResult.failed.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[var(--urgent)] text-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          <span>{f.label} ({f.reason})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evalResult.unknown.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-medium text-[var(--soon)] mb-2">Information needed:</p>
                    <ul className="space-y-2">
                      {evalResult.unknown.map((u, i) => (
                        <li key={i} className="flex items-start gap-2 text-[var(--soon)] text-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <span>{u.label} (missing from your profile)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* AI Insight (placeholder) */}
            <section className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h2 className="serif text-[22px] text-[var(--text-1)]">Personalized insight</h2>
              </div>
              <div className="p-5 glass-inner">
                <p className="text-[var(--text-2)]">
                  {whyQualify.labels.length > 0
                    ? `You meet ${whyQualify.labels.length} of ${scheme.rules.length} eligibility requirements for ${scheme.name}.`
                    : "Complete your profile to see how you qualify."}
                  {score.docs_owned < score.docs_required && ` You have ${score.docs_owned} of ${score.docs_required} required documents.`}
                </p>
              </div>
            </section>
          </div>

          {/* Right: Sticky panel with score, documents, dates, apply */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Score Ring */}
              <section className="glass-card overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <h2 className="serif text-[22px] text-[var(--text-1)]">Apply readiness</h2>
                </div>
                <div className="p-5 glass-inner text-center">
                  <ScoreRing score={score.score} />
                  <p className="mt-3 text-[var(--text-1)] font-medium">{score.reason}</p>
                </div>
              </section>

              {/* Documents Checklist */}
              <DocChecklist
                scheme={scheme}
                user={{ ...user, documents_have: documentsHave }}
                onToggleDoc={handleToggleDoc}
              />

              {/* Dates & Source */}
              <section className="glass-card overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <h2 className="serif text-[22px] text-[var(--text-1)]">Details</h2>
                </div>
                <div className="p-5 glass-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-2)]">Posted</span>
                    <span className="text-[var(--text-1)]">{scheme.posted_date || "Not available"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-2)]">Last date to apply</span>
                    <span className="text-[var(--text-1)]">{scheme.last_date || "Open all year"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-2)]">Status</span>
                    <span className="text-[var(--text-1)]">{scheme.status_note || "Active"}</span>
                  </div>
                  {scheme.source_url && (
                    <div className="pt-4 border-t border-white/10">
                      <a
                        href={scheme.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--new)] hover:underline text-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        View official source
                      </a>
                    </div>
                  )}
                  {scheme.last_verified && (
                    <div className="text-xs text-[var(--text-3)]">
                      Last verified: {new Date(scheme.last_verified).toLocaleDateString("en-IN")}
                      {scheme.verified && <span className="text-[var(--eligible)] ml-2">✓ Verified</span>}
                    </div>
                  )}
                </div>
              </section>

              {/* Apply Button (Desktop) */}
              <div className="hidden md:block">
                <button
                  onClick={handleApply}
                  className="btn-primary w-full py-4 text-lg"
                  disabled={!isEligible}
                >
                  {isEligible ? "View and apply" : "Complete requirements to apply"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-xs text-[var(--text-3)] max-w-3xl mx-auto">
          Scheme data is curated; verify on the official portal before applying.
        </p>
      </main>

      {/* Sticky Apply Bar (Mobile) */}
      <StickyApplyBar scheme={scheme} user={user} onApply={handleApply} />
    </div>
  );
}

function SchemeDetailContent() {
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
      <SchemeDetailContentInner />
    </Suspense>
  );
}

export default function SchemeDetailPage() {
  return <SchemeDetailContent />;
}