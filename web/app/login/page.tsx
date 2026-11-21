// Haq Dilao — Login Page

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Mesh background */}
      <div className="mesh-background" aria-hidden="true">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="glass-card p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
              </Link>
              <h1 className="serif text-[28px] text-[var(--text-1)] mb-2">Welcome back</h1>
              <p className="text-[var(--text-2)]">Log in to see your schemes</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-[var(--urgent)]/20 border border-[var(--urgent)]/50 rounded-[var(--radius-input)] text-[var(--urgent)] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="you@example.com"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-[var(--text-2)]">
                Don't have an account?{" "}
                <Link href="/register" className="text-[var(--new)] hover:underline font-medium">
                  Register
                </Link>
              </p>
              <p className="text-[var(--text-3)]">
                <Link href="/admin" className="text-[var(--text-3)] hover:text-[var(--new)] transition-colors">
                  Admin login
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 glass-card border-white/10">
            <p className="text-xs text-[var(--text-3)] text-center mb-3">Demo accounts (password: <code className="text-[var(--text-1)] bg-white/10 px-1.5 py-0.5 rounded">Demo@1234</code>)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                onClick={() => { setEmail("farmer@demo.com"); setPassword("Demo@1234"); }}
                className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] p-2 rounded-[var(--radius-input)] hover:bg-white/5 transition-colors"
              >
                Farmer
              </button>
              <button
                onClick={() => { setEmail("student@demo.com"); setPassword("Demo@1234"); }}
                className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] p-2 rounded-[var(--radius-input)] hover:bg-white/5 transition-colors"
              >
                Student
              </button>
              <button
                onClick={() => { setEmail("business@demo.com"); setPassword("Demo@1234"); }}
                className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] p-2 rounded-[var(--radius-input)] hover:bg-white/5 transition-colors"
              >
                Business
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}