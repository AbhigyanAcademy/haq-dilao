// Haq Dilao — Dashboard with Command Bar
// Main citizen dashboard showing eligible schemes as glass cards

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { evaluate, applyScore, whyYouQualify } from "@/lib/eligibility";
import { parseIntent, executeIntent, QUICK_PROMPTS } from "@/lib/intents";
import { getSchemeDateInfo } from "@/lib/dates";
import type { User, Scheme } from "@/lib/types";

// --- Notification Bell ---
function NotificationBell({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<{ id: string; message: string; read: boolean; created_at: string; scheme_id?: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    load();
  }, [user.id]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (notifications.length === 0 && unreadCount === 0) {
    return (
      <Link href="/notifications" className="relative p-2 text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--urgent)] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-[var(--radius-panel)] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="serif text-[18px] text-[var(--text-1)]">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-[var(--new)] hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map(n => (
              <button
                key={n.id}
                onClick={async () => {
                  await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notificationId: n.id }),
                  });
                  setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                  setUnreadCount(prev => Math.max(0, prev - 1));
                  if (n.scheme_id) window.location.href = `/schemes/${n.scheme_id}`;
                }}
                className={`w-full text-left p-3 hover:bg-white/5 transition-colors ${!n.read ? "bg-white/5" : ""}`}
              >
                <p className={`text-sm ${!n.read ? "font-medium" : ""} text-[var(--text-1)]`}>{n.message}</p>
                <p className="text-xs text-[var(--text-3)] mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <Link href="/notifications" className="text-sm text-[var(--new)] hover:underline block text-center">View all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}

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

// --- Document Readiness Drawer ---
function DocReadinessDrawer({
  scheme,
  user,
  onToggleDoc,
  isOpen,
  onClose,
}: {
  scheme: Scheme;
  user: User;
  onToggleDoc: (doc: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const score = applyScore(user, scheme);
  const missingDocs = scheme.documents.filter(
    doc => !user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 glass-card p-4 rounded-[var(--radius-panel)] border-t-0 shadow-lg z-20 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--text-1)]">
          {score.docs_owned} of {score.docs_required} ready
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {scheme.documents.map(doc => {
          const hasDoc = user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase());
          return (
            <button
              key={doc}
              onClick={() => onToggleDoc(doc)}
              className="w-full flex items-center justify-between p-3 rounded-[var(--radius-input)] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
            >
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
                <span className="text-[var(--text-2)] text-sm">{doc}</span>
              </div>
              <span className={`text-xs font-medium ${hasDoc ? "text-[var(--eligible)]" : "text-[var(--urgent)]"}`}>
                {hasDoc ? "You have this" : "Missing"}
              </span>
            </button>
          );
        })}
      </div>

      {missingDocs.length > 0 && (
        <p className="mt-3 text-xs text-[var(--text-3)]">
          Tap a missing document to mark it as collected. Your apply score will update.
        </p>
      )}
    </div>
  );
}

// --- Scheme Glass Card ---
function SchemeGlassCard({
  scheme,
  user,
  onApply,
  onToggleDoc,
  onExplain,
}: {
  scheme: Scheme;
  user: User;
  onApply: (scheme: Scheme) => void;
  onToggleDoc: (doc: string) => void;
  onExplain: (scheme: Scheme) => void;
}) {
  const evalResult = evaluate(user, scheme);
  const score = applyScore(user, scheme);
  const whyQualify = whyYouQualify(user, scheme);
  const dateInfo = getSchemeDateInfo(scheme.posted_date, scheme.last_date);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getBadgeVariant = () => {
    if (evalResult.status !== "eligible") return "open";
    if (dateInfo.label === "New") return "new";
    if (dateInfo.label === "Closing soon") return dateInfo.daysUntilClose !== null && dateInfo.daysUntilClose <= 3 ? "urgent" : "closing";
    if (dateInfo.label === "Open all year") return "open";
    return "open";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDrawerOpen(!drawerOpen);
    }
  };

  return (
    <article className="glass-card relative overflow-hidden group" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Magnetic hover effect (desktop only) */}
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .group:hover {
            --mx: 50%;
            --my: 50%;
          }
          .group::before {
            content: "";
            position: absolute;
            inset: -20px;
            background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(34,211,238,0.08), transparent 70%);
            opacity: 0;
            transition: opacity 300ms ease;
            pointer-events: none;
            z-index: -1;
          }
          .group:hover::before {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .group::before {
            display: none;
          }
        }
      `}</style>

      {/* Card header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="serif text-[22px] text-[var(--text-1)] flex-1 pr-4">{scheme.name}</h3>
          <Badge label={dateInfo.label} variant={getBadgeVariant()} />
        </div>

        <p className="text-[var(--text-2)] text-sm mb-4">{scheme.benefit}</p>

        {/* Score ring + countdown */}
        <div className="flex items-center justify-between">
          <ScoreRing score={score.score} />
          {dateInfo.countdownText && (
            <span className="text-sm font-medium text-[var(--text-1)]">
              {dateInfo.countdownText}
            </span>
          )}
        </div>

        {/* Why you qualify */}
        {whyQualify.labels.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-[var(--text-3)] mb-1">Why you qualify</p>
            <p className="text-sm text-[var(--text-1)]">{whyQualify.labels[0]}</p>
          </div>
        )}

        {/* Documents toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            setDrawerOpen(!drawerOpen);
          }}
          className="mt-4 w-full flex items-center justify-between p-3 rounded-[var(--radius-input)] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          aria-expanded={drawerOpen}
          aria-controls="doc-drawer"
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-3)]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-sm font-medium text-[var(--text-1)]">Documents</span>
          </div>
          <span className="text-xs text-[var(--text-3)]">
            {score.docs_owned}/{score.docs_required} ready
          </span>
        </button>

        {/* Doc drawer */}
        <DocReadinessDrawer
          scheme={scheme}
          user={user}
          onToggleDoc={onToggleDoc}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Primary action */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={e => {
            e.stopPropagation();
            onApply(scheme);
          }}
          className="btn-primary w-full py-3"
        >
          View and apply
        </button>
      </div>
    </article>
  );
}

// --- Command Bar ---
function CommandBar({
  user,
  schemes,
  onSearch,
  onApply,
  onToggleDoc,
  onExplain,
}: {
  user: User;
  schemes: Scheme[];
  onSearch: (query: string) => void;
  onApply: (scheme: Scheme) => void;
  onToggleDoc: (doc: string) => void;
  onExplain: (scheme: Scheme) => void;
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Scheme[]>([]);
  const [summary, setSummary] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const parsed = parseIntent(query, schemes);
    const result = executeIntent(parsed, user, schemes);

    setResults(result.schemes);
    setSummary(result.summary);
    setShowResults(true);
    onSearch(query);
  };

  const handlePillClick = (prompt: string) => {
    setQuery(prompt);
    const parsed = parseIntent(prompt, schemes);
    const result = executeIntent(parsed, user, schemes);

    setResults(result.schemes);
    setSummary(result.summary);
    setShowResults(true);
    onSearch(prompt);
  };

  const handleBlur = () => {
    setTimeout(() => setFocused(false), 200);
  };

  return (
    <div className="relative">
      {/* Start state: centered */}
      {!showResults && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="text-center mb-8">
            <h1 className="serif text-[44px] text-[var(--text-1)] mb-4">
              Good morning, {user.name.split(" ")[0]}.
            </h1>
            <p className="text-[var(--text-2)] text-lg">
              {summary || "Type a question or choose a prompt below"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <div className="command-bar flex items-center gap-3 p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-3)] flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={handleBlur}
                placeholder="Which schemes close this week?"
                className="command-bar-input flex-1"
                autoFocus
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={!query.trim()}>
                Search
              </button>
            </div>

            {/* Quick prompt pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-6" role="listbox" aria-label="Quick prompts">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePillClick(prompt)}
                  className="quick-prompt-pill"
                  role="option"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* Results state: bar at top */}
      {showResults && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto px-4">
            <div className="command-bar flex items-center gap-3 p-2 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-3)] flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={handleBlur}
                placeholder="Which schemes close this week?"
                className="command-bar-input flex-1"
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={!query.trim()}>
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSummary("");
                  setShowResults(false);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="p-2 rounded-[var(--radius-input)] hover:bg-white/10 transition-colors text-[var(--text-3)]"
                aria-label="Clear search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ARIA live summary */}
            <div aria-live="polite" className="sr-only">
              {summary}
            </div>

            {/* Visible summary */}
            <p className="text-[var(--text-2)] text-sm mb-4 px-4">{summary}</p>

            {/* Results grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto px-4 pb-12">
                {results.map(scheme => (
                  <SchemeGlassCard
                    key={scheme.id}
                    scheme={scheme}
                    user={user}
                    onApply={onApply}
                    onToggleDoc={onToggleDoc}
                    onExplain={onExplain}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-[var(--text-2)]">{summary}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {QUICK_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePillClick(prompt)}
                      className="quick-prompt-pill"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// --- Main Dashboard Component ---
function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [closedSchemes, setClosedSchemes] = useState<Scheme[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [closingCount, setClosingCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, schemesRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/schemes"),
        ]);

        const userData = await userRes.json();
        const schemesData = await schemesRes.json();

        if (!userData.user) {
          window.location.href = "/login";
          return;
        }

        setUser(userData.user);
        setAllSchemes(schemesData.schemes || []);

        // Filter eligible schemes
        const eligible = (schemesData.schemes || [])
          .filter((s: Scheme) => s.role === userData.user.role)
          .filter((s: Scheme) => evaluate(userData.user, s).status === "eligible")
          .filter((s: Scheme) => {
            if (s.last_date) {
              const lastDate = new Date(s.last_date + "T12:00:00Z");
              const today = new Date();
              today.setHours(12, 0, 0, 0);
              return lastDate >= today;
            }
            return true;
          });

        const closed = (schemesData.schemes || [])
          .filter((s: Scheme) => s.role === userData.user.role)
          .filter((s: Scheme) => evaluate(userData.user, s).status === "eligible")
          .filter((s: Scheme) => {
            if (s.last_date) {
              const lastDate = new Date(s.last_date + "T12:00:00Z");
              const today = new Date();
              today.setHours(12, 0, 0, 0);
              return lastDate < today;
            }
            return false;
          });

        const newC = eligible.filter((s: Scheme) => {
          if (!s.posted_date) return false;
          const posted = new Date(s.posted_date + "T12:00:00Z");
          const weekAgo = Date.now() - 7 * 86400000;
          return posted.getTime() >= weekAgo;
        }).length;

        const closingC = eligible.filter((s: Scheme) => {
          if (!s.last_date) return false;
          const days = Math.ceil((new Date(s.last_date + "T12:00:00Z").getTime() - Date.now()) / 86400000);
          return days >= 0 && days <= 7;
        }).length;

        setEligibleSchemes(eligible);
        setClosedSchemes(closed);
        setNewCount(newC);
        setClosingCount(closingC);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
          <div className="text-center">
            <div className="skeleton h-8 w-48 mx-auto mb-4 rounded" />
            <div className="skeleton h-4 w-64 mx-auto rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
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
            <NotificationBell user={user} />
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
        {/* Counts line */}
        <div className="mb-8">
          <p className="serif text-[28px] text-[var(--text-1)] mb-2">
            You qualify for <span className="text-[var(--new)]">{eligibleSchemes.length}</span> scheme{eligibleSchemes.length !== 1 ? "s" : ""}.
          </p>
          <p className="text-[var(--text-2)]">
            {closingCount > 0 && <span className="text-[var(--urgent)] font-medium">{closingCount}</span>}
            {closingCount > 0 && <span className="text-[var(--text-2)]"> close this week. </span>}
            {newCount > 0 && <span className="text-[var(--new)] font-medium">{newCount}</span>}
            {newCount > 0 && <span className="text-[var(--text-2)]"> new this week.</span>}
          </p>
        </div>

        {/* Command Bar */}
        <CommandBar
          user={user}
          schemes={allSchemes}
          onSearch={() => {}}
          onApply={scheme => window.location.href = `/schemes/${scheme.id}/apply`}
          onToggleDoc={() => {}}
          onExplain={() => {}}
        />

        {/* Closed schemes section */}
        {closedSchemes.length > 0 && (
          <details className="mt-12 glass-card overflow-hidden">
            <summary className="p-4 cursor-pointer list-none flex items-center justify-between">
              <span className="text-[var(--text-2)]">Closed schemes ({closedSchemes.length})</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-3)]">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {closedSchemes.map(scheme => (
                <article key={scheme.id} className="glass-card p-4 opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="serif text-[22px] text-[var(--text-1)] pr-4">{scheme.name}</h3>
                    <Badge label="Closed" variant="open" />
                  </div>
                  <p className="text-[var(--text-2)] text-sm mb-3">{scheme.benefit}</p>
                  <p className="text-xs text-[var(--text-3)]">Closed on {scheme.last_date}</p>
                </article>
              ))}
            </div>
          </details>
        )}

        {/* Empty state */}
        {eligibleSchemes.length === 0 && closedSchemes.length === 0 && (
          <div className="empty-state glass-card">
            <h2 className="empty-state-title">No schemes match yet</h2>
            <p className="text-[var(--text-2)] mb-4">
              Complete your profile in <Link href="/profile" className="text-[var(--new)] underline">Settings</Link> to see more schemes.
            </p>
            <Link href="/profile" className="btn-primary inline-block empty-state-action">
              Complete Profile
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}