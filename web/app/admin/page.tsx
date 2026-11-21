// Haq Dilao — Admin Panel (minimal)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEMO_SCHEME = {
  id: "admin-demo-farmer",
  role: "farmer" as const,
  name: "DEMO: PM-KISAN (Admin added)",
  benefit: "₹6,000/year income support",
  rules: [
    { field: "land_hectares", op: "lte" as const, value: 2, label: "Land holding up to 2 hectares" },
    { field: "land_ownership", op: "eq" as const, value: "owner", label: "Land owner" }
  ],
  documents: ["Aadhaar", "Land record", "Bank passbook"],
  apply_url: "/mock-portal/scholarship",
  source_url: "",
  form_fields: ["name", "district", "land_hectares"],
  posted_date: new Date().toISOString().slice(0, 10),
  last_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  status_note: "Added via admin panel",
  summary_fallback: "Admin-added demo scheme for PM-KISAN income support.",
  verified: false,
  last_verified: null,
  verify_notes: "Admin demo",
  is_demo: true,
  autofill: null,
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    role: "farmer",
    name: "",
    benefit: "",
    rules_json: "",
    documents: "Aadhaar, Land record, Bank passbook",
    apply_url: "",
    source_url: "",
    form_fields: "name, district, land_hectares",
    posted_date: "",
    last_date: "",
    status_note: "",
    summary_fallback: "",
    verified: false,
    is_demo: false,
  });

  // Initialize formData with current dates in useEffect
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    setFormData(prev => ({
      ...prev,
      posted_date: today,
      last_date: threeDaysLater,
    }));
  }, []);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Check if already authenticated via session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setAuthenticated(true);
      } catch {}
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid admin password");
        return;
      }
      setAuthenticated(true);
      setPassword("");
      loadSchemes();
    } catch {
      setError("Login failed");
    }
  };

  const loadSchemes = async () => {
    try {
      const res = await fetch("/api/admin/schemes");
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch {}
  };

  const handleQuickFill = () => {
    setFormData({
      ...DEMO_SCHEME,
      rules_json: JSON.stringify(DEMO_SCHEME.rules, null, 2),
      documents: DEMO_SCHEME.documents.join(", "),
      form_fields: DEMO_SCHEME.form_fields.join(", "),
    });
    setShowForm(true);
  };

  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      let rules;
      try {
        rules = JSON.parse(formData.rules_json);
      } catch {
        setFormError("Invalid JSON in rules");
        return;
      }

      const scheme = {
        id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        role: formData.role,
        name: formData.name,
        benefit: formData.benefit,
        rules,
        documents: formData.documents.split(",").map(s => s.trim()),
        apply_url: formData.apply_url || null,
        source_url: formData.source_url || null,
        form_fields: formData.form_fields.split(",").map(s => s.trim()),
        posted_date: formData.posted_date,
        last_date: formData.last_date,
        status_note: formData.status_note,
        summary_fallback: formData.summary_fallback,
        verified: formData.verified,
        last_verified: null,
        verify_notes: "",
        is_demo: formData.is_demo,
        autofill: null,
      };

      const res = await fetch("/api/admin/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheme),
      });

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error || "Failed to add scheme");
        return;
      }

      setFormSuccess("Scheme added! Notifications sent to eligible users.");
      setFormData({
        role: "farmer",
        name: "",
        benefit: "",
        rules_json: "",
        documents: "Aadhaar, Land record, Bank passbook",
        apply_url: "",
        source_url: "",
        form_fields: "name, district, land_hectares",
        posted_date: new Date().toISOString().slice(0, 10),
        last_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        status_note: "",
        summary_fallback: "",
        verified: false,
        is_demo: false,
      });
      setShowForm(false);
      loadSchemes();
    } catch {
      setFormError("Failed to add scheme");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen relative">
        <div className="mesh-background" aria-hidden="true">
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
        </div>
        <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="glass-card p-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-8">
                <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Admin</span>
              </Link>
              <h1 className="serif text-[28px] text-[var(--text-1)] mb-2 text-center">Admin Panel</h1>
              <p className="text-[var(--text-2)] text-center mb-8">Enter admin password</p>
              {error && <div className="mb-4 p-3 bg-[var(--urgent)]/20 border border-[var(--urgent)]/50 rounded-[var(--radius-input)] text-[var(--urgent)] text-sm">{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="password" className="field-label">Admin Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="field-input"
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <Link href="/dashboard" className="text-center text-[var(--text-3)] text-sm block mt-6">
                ← Back to dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="mesh-background" aria-hidden="true">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[var(--obsidian)]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Admin Panel</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Back to dashboard
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
          <h1 className="serif text-[40px] text-[var(--text-1)] mb-2">Admin Panel</h1>
          <p className="text-[var(--text-2)]">Manage schemes and view all registered schemes</p>
        </div>

        {/* Add Scheme Button */}
        <div className="mb-6 flex gap-3">
          <button onClick={handleQuickFill} className="btn-primary py-3">
            + Add New Scheme
          </button>
          <button onClick={loadSchemes} className="px-6 py-3 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border border-white/10 rounded-[var(--radius-input)]">
            Refresh List
          </button>
        </div>

        {/* Add Scheme Form (modal-style) */}
        {showForm && (
          <div className="glass-card mb-8 p-6" style={{ animation: "slideIn 200ms ease" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="serif text-[22px] text-[var(--text-1)]">Add New Scheme</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {formError && <div className="mb-4 p-3 bg-[var(--urgent)]/20 border border-[var(--urgent)]/50 rounded-[var(--radius-input)] text-[var(--urgent)] text-sm">{formError}</div>}
            {formSuccess && <div className="mb-4 p-3 bg-[var(--eligible)]/20 border border-[var(--eligible)]/50 rounded-[var(--radius-input)] text-[var(--eligible)] text-sm">{formSuccess}</div>}
            <form onSubmit={handleAddScheme} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="field-label">Role</label>
                  <select id="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="field-input">
                    <option value="farmer">Farmer</option>
                    <option value="student">Student</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="field-label">Scheme Name</label>
                  <input id="name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="field-input" placeholder="PM-KISAN" required />
                </div>
              </div>
              <div>
                <label htmlFor="benefit" className="field-label">Benefit</label>
                <input id="benefit" type="text" value={formData.benefit} onChange={e => setFormData({...formData, benefit: e.target.value})} className="field-input" placeholder="₹6,000/year income support" required />
              </div>
              <div>
                <label htmlFor="rules_json" className="field-label">Rules (JSON)</label>
                <textarea id="rules_json" value={formData.rules_json} onChange={e => setFormData({...formData, rules_json: e.target.value})} className="field-input font-mono text-sm" rows={6} placeholder='[{"field": "land_hectares", "op": "lte", "value": 2, "label": "Land holding up to 2 hectares"}]' required />
              </div>
              <div>
                <label htmlFor="documents" className="field-label">Documents (comma-separated)</label>
                <input id="documents" type="text" value={formData.documents} onChange={e => setFormData({...formData, documents: e.target.value})} className="field-input" placeholder="Aadhaar, Land record, Bank passbook" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apply_url" className="field-label">Apply URL</label>
                  <input id="apply_url" type="url" value={formData.apply_url} onChange={e => setFormData({...formData, apply_url: e.target.value})} className="field-input" placeholder="/mock-portal/scholarship" />
                </div>
                <div>
                  <label htmlFor="source_url" className="field-label">Source URL</label>
                  <input id="source_url" type="url" value={formData.source_url} onChange={e => setFormData({...formData, source_url: e.target.value})} className="field-input" placeholder="https://pmkisan.gov.in" />
                </div>
              </div>
              <div>
                <label htmlFor="form_fields" className="field-label">Form Fields (comma-separated)</label>
                <input id="form_fields" type="text" value={formData.form_fields} onChange={e => setFormData({...formData, form_fields: e.target.value})} className="field-input" placeholder="name, district, land_hectares" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="posted_date" className="field-label">Posted Date</label>
                  <input id="posted_date" type="date" value={formData.posted_date} onChange={e => setFormData({...formData, posted_date: e.target.value})} className="field-input" required />
                </div>
                <div>
                  <label htmlFor="last_date" className="field-label">Last Date</label>
                  <input id="last_date" type="date" value={formData.last_date} onChange={e => setFormData({...formData, last_date: e.target.value})} className="field-input" required />
                </div>
              </div>
              <div>
                <label htmlFor="status_note" className="field-label">Status Note</label>
                <input id="status_note" type="text" value={formData.status_note} onChange={e => setFormData({...formData, status_note: e.target.value})} className="field-input" placeholder="Active" />
              </div>
              <div>
                <label htmlFor="summary_fallback" className="field-label">Summary Fallback</label>
                <textarea id="summary_fallback" value={formData.summary_fallback} onChange={e => setFormData({...formData, summary_fallback: e.target.value})} className="field-input" rows={3} placeholder="Plain-language summary for offline mode" required />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.verified} onChange={e => setFormData({...formData, verified: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]" />
                  <span className="text-sm text-[var(--text-2)]">Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_demo} onChange={e => setFormData({...formData, is_demo: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]" />
                  <span className="text-sm text-[var(--text-2)]">Demo Scheme</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary py-3 flex-1">Add Scheme</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border border-white/10 rounded-[var(--radius-input)]">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Schemes List */}
        <h2 className="serif text-[22px] text-[var(--text-1)] mb-4">All Schemes ({schemes.length})</h2>
        {schemes.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[var(--text-2)]">No schemes yet. Click "Add New Scheme" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schemes.map(scheme => (
              <div key={scheme.id} className="glass-card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="serif text-[18px] text-[var(--text-1)]">{scheme.name}</h3>
                    {scheme.is_demo && <span className="badge badge-new text-xs">Demo</span>}
                    {scheme.verified && <span className="badge badge-eligible text-xs">Verified</span>}
                    <span className={`badge ${scheme.role === "farmer" ? "badge-closing" : scheme.role === "student" ? "badge-new" : "badge-open"} text-xs capitalize`}>{scheme.role}</span>
                  </div>
                  <p className="text-[var(--text-2)] text-sm">{scheme.benefit}</p>
                  <p className="text-xs text-[var(--text-3)]">Posted: {scheme.posted_date} • Last: {scheme.last_date || "Open all year"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}