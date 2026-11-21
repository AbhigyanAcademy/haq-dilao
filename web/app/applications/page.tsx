// Haq Dilao — My Applications Tracker
// Status timeline with demo simulate update button

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User, Application, Scheme } from "@/lib/types";

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

// --- Status Badge ---
function StatusBadge({ status }: { status: Application["status"] }) {
  const variants = {
    applied: "badge-eligible",
    under_review: "badge-new",
    more_info_needed: "badge-urgent",
    approved: "badge-eligible",
    rejected: "badge-urgent",
  };
  const labels = {
    applied: "Applied",
    under_review: "Under review",
    more_info_needed: "More info needed",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span className={`badge ${variants[status]}`}>
      {labels[status]}
    </span>
  );
}

// --- Status Timeline ---
function StatusTimeline({ application }: { application: Application }) {
  const statusOrder = ["applied", "under_review", "more_info_needed", "approved", "rejected"];
  const currentIndex = statusOrder.indexOf(application.status);

  return (
    <div className="status-timeline">
      {statusOrder.map((status, index) => {
        const historyEntry = application.history.find(h => h.status === status);
        const isCurrent = index === currentIndex;
        const isCompleted = index <= currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={status} className="status-timeline-item">
            <div
              className={`status-timeline-dot ${isCompleted ? "completed" : ""} ${isCurrent ? "active" : ""}`}
              style={{
                background: isCompleted ? "var(--eligible)" : isCurrent ? "var(--eligible)" : "var(--text-3)",
              }}
            />
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-1)] capitalize">{status.replace("_", " ")}</span>
                {isCurrent && (
                  <span className="badge badge-eligible text-xs">Current</span>
                )}
              </div>
              {historyEntry && (
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  {new Date(historyEntry.at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {historyEntry.note && ` — ${historyEntry.note}`}
                </p>
              )}
              {isFuture && (
                <p className="text-xs text-[var(--text-3)] mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Application Card ---
function ApplicationCard({
  application,
  scheme,
  onSimulateUpdate,
}: {
  application: Application;
  scheme: Scheme;
  onSimulateUpdate: (application: Application) => void;
}) {
  const statusOrder = ["applied", "under_review", "more_info_needed", "approved", "rejected"];
  const currentIndex = statusOrder.indexOf(application.status);
  const progress = ((currentIndex + 1) / statusOrder.length) * 100;

  return (
    <article className="glass-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="serif text-[22px] text-[var(--text-1)] mb-1">{scheme.name}</h3>
            <p className="text-[var(--text-2)] text-sm">{scheme.benefit}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[var(--eligible)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-4">
          <span>Applied: {new Date(application.applied_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <span>Ref: {application.application_ref}</span>
        </div>

        {/* Timeline */}
        <StatusTimeline application={application} />

        {/* Demo simulate update */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => onSimulateUpdate(application)}
            className="w-full py-2 px-4 rounded-[var(--radius-input)] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[var(--text-2)] text-sm font-medium"
          >
            Demo: simulate update
          </button>
          <p className="text-xs text-[var(--text-3)] text-center mt-2">
            Advances status to next stage and creates notification
          </p>
        </div>
      </div>
    </article>
  );
}

// --- Empty State ---
function EmptyState() {
  return (
    <div className="empty-state glass-card">
      <h2 className="empty-state-title">No applications yet</h2>
      <p className="text-[var(--text-2)] mb-4">
        Open a scheme and choose <span className="text-[var(--new)]">Apply</span> to start an application.
      </p>
      <Link href="/dashboard" className="btn-primary inline-block empty-state-action">
        Browse schemes
      </Link>
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<(Application & { scheme: Scheme })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, appsRes, schemesRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/user/applications"),
          fetch("/api/schemes"),
        ]);

        const userData = await userRes.json();
        const appsData = await appsRes.json();
        const schemesData = await schemesRes.json();

        if (!userData.user) {
          router.push("/login");
          return;
        }

        const schemes = schemesData.schemes || [];
        const schemeMap = new Map(schemes.map((s: Scheme) => [s.id, s]));

        const enriched = (appsData.applications || [])
          .filter((app: Application) => app.user_id === userData.user.id)
          .map((app: Application) => ({
            ...app,
            scheme: schemeMap.get(app.scheme_id) || { name: "Unknown scheme", benefit: "" } as Scheme,
          }))
          .sort((a: Application & { scheme: Scheme }, b: Application & { scheme: Scheme }) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

        setUser(userData.user);
        setApplications(enriched);
      } catch (err) {
        console.error("Failed to load applications:", err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSimulateUpdate = async (application: Application) => {
    const statusOrder = ["applied", "under_review", "more_info_needed", "approved", "rejected"];
    const currentIndex = statusOrder.indexOf(application.status);
    if (currentIndex >= statusOrder.length - 1) return; // Already at final status

    const nextStatus = statusOrder[currentIndex + 1];

    try {
      const response = await fetch("/api/applications/simulate-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          nextStatus,
        }),
      });

      if (!response.ok) {
        console.error("Failed to simulate update");
        return;
      }

      const updatedApplication = {
        ...application,
        status: nextStatus as Application["status"],
        history: [
          ...application.history,
          { status: nextStatus as Application["status"], at: new Date().toISOString(), note: "Demo status update" },
        ],
      };

      // Refresh UI
      setApplications(prev => prev.map(app =>
        app.id === application.id ? { ...app, ...updatedApplication } as Application & { scheme: Scheme } : app
      ));
    } catch (error) {
      console.error("Failed to simulate update:", error);
    }
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
            <div className="space-y-4">
              <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
              <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
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
            <h2 className="empty-state-title">Unable to load</h2>
            <p className="text-[var(--text-2)] mb-4">{error || "Please log in to view your applications."}</p>
            <Link href="/login" className="btn-primary inline-block empty-state-action">
              Log in
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
        <div className="mb-8">
          <h1 className="serif text-[40px] text-[var(--text-1)] mb-2">My applications</h1>
          <p className="text-[var(--text-2)]">{applications.length} application{applications.length !== 1 ? "s" : ""} submitted</p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                scheme={app.scheme}
                onSimulateUpdate={handleSimulateUpdate}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-[var(--text-3)] max-w-3xl mx-auto">
          Scheme data is curated; verify on the official portal before applying.
        </p>
      </main>
    </div>
  );
}