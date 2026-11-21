// Haq Dilao — Register Step 1 Page

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["general", "obc", "sc", "st"] as const;
const GENDERS = ["male", "female", "other"] as const;
const STATES = ["Assam", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Tripura", "Sikkim", "Other"] as const;

function RegisterStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/register/step2";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "farmer" as "farmer" | "student" | "business",
    age: "",
    gender: "male" as "male" | "female" | "other",
    state: "Assam",
    district: "",
    category: "general" as "general" | "obc" | "sc" | "st",
    annual_income: "",
    disability: false,
    documents_have: ["Aadhaar", "Bank passbook"] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateField = (name: string, value: unknown): string | null => {
    // Handle documents_have (array) - always valid if present
    if (name === "documents_have") return null;

    const strValue = String(value);
    switch (name) {
      case "email":
        if (!strValue) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) return "Invalid email format";
        return null;
      case "password":
        if (!strValue) return "Password is required";
        if (strValue.length < 8) return "At least 8 characters";
        if (!/[A-Z]/.test(strValue)) return "One uppercase letter";
        if (!/[a-z]/.test(strValue)) return "One lowercase letter";
        if (!/[0-9]/.test(strValue)) return "One number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(strValue)) return "One special character";
        return null;
      case "confirmPassword":
        if (strValue !== formData.password) return "Passwords do not match";
        return null;
      case "name":
        if (!strValue.trim()) return "Name is required";
        return null;
      case "age":
        const age = Number(strValue);
        if (!strValue) return "Age is required";
        if (age < 18 || age > 100) return "Age must be 18-100";
        return null;
      case "district":
        if (!strValue.trim()) return "District is required";
        return null;
      case "annual_income":
        if (!strValue) return "Annual income is required";
        if (Number(strValue) < 0) return "Must be positive";
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "documents_have" && type === "checkbox") {
      setFormData(prev => {
        const current = (prev.documents_have as string[]) || [];
        const updated = checked ? [...current, value] : current.filter(d => d !== value);
        return { ...prev, documents_have: updated };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    // Clear field error on change
    const error = validateField(name, type === "checkbox" ? String(checked) : value);
    setErrors(prev => ({ ...prev, [name]: error || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    for (const key of Object.keys(formData)) {
      const value = formData[key as keyof typeof formData];
      const error = validateField(key, typeof value === "boolean" ? String(value) : value);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Registration failed");
        return;
      }

      router.push(redirect);
    } catch {
      setServerError("Network error. Please try again.");
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
        <div className="w-full max-w-xl">
          {/* Glass card */}
          <div className="glass-card p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <span className="serif text-[22px] text-[var(--text-1)]">Haq Dilao</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--gamosa)]">Know what you can claim</span>
              </Link>
              <h1 className="serif text-[28px] text-[var(--text-1)] mb-2">Create your account</h1>
              <p className="text-[var(--text-2)]">Step 1 of 2: Basic information</p>
            </div>

            {/* Progress indicator */}
            <div className="flex mb-8" role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={2}>
              <div className="flex-1 h-1.5 bg-[var(--new)] rounded-full" style={{ width: "50%" }} />
              <div className="flex-1 h-1.5 bg-white/10 rounded-full ml-2" />
            </div>

            {/* Error message */}
            {serverError && (
              <div className="mb-6 p-4 bg-[var(--urgent)]/20 border border-[var(--urgent)]/50 rounded-[var(--radius-input)] text-[var(--urgent)] text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <fieldset className="space-y-3">
                <legend className="field-label">I am a</legend>
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Select your role">
                  {(["farmer", "student", "business"] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      role="radio"
                      aria-checked={formData.role === role}
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                      className={`p-4 rounded-[var(--radius-panel)] border-2 text-center transition-all ${
                        formData.role === role
                          ? "border-[var(--new)] bg-[var(--new)]/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="font-medium text-[var(--text-1)] capitalize">{role}</div>
                      <div className="text-xs text-[var(--text-3)] mt-1">
                        {role === "farmer" && "PM-KISAN, KCC, Fasal Bima…"}
                        {role === "student" && "Scholarships, Education loans…"}
                        {role === "business" && "Mudra, PMEGP, Startup India…"}
                      </div>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="field-label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`field-input ${errors.email ? "border-[var(--urgent)]" : ""}`}
                    placeholder="you@example.com"
                    disabled={submitting}
                  />
                  {errors.email && <p className="text-[var(--urgent)] text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="field-label">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`field-input ${errors.password ? "border-[var(--urgent)]" : ""}`}
                    placeholder="Min 8 chars, upper, lower, number, symbol"
                    disabled={submitting}
                  />
                  {errors.password && <p className="text-[var(--urgent)] text-sm mt-1">{errors.password}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`field-input ${errors.confirmPassword ? "border-[var(--urgent)]" : ""}`}
                  placeholder="Re-enter password"
                  disabled={submitting}
                />
                {errors.confirmPassword && <p className="text-[var(--urgent)] text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="field-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`field-input ${errors.name ? "border-[var(--urgent)]" : ""}`}
                  placeholder="As per Aadhaar"
                  disabled={submitting}
                />
                {errors.name && <p className="text-[var(--urgent)] text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="field-label">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className={`field-input ${errors.age ? "border-[var(--urgent)]" : ""}`}
                    placeholder="25"
                    disabled={submitting}
                  />
                  {errors.age && <p className="text-[var(--urgent)] text-sm mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label htmlFor="gender" className="field-label">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="field-input"
                    disabled={submitting}
                  >
                    {GENDERS.map(g => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="field-label">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="field-input"
                    disabled={submitting}
                  >
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className="field-label">District</label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleChange}
                    className={`field-input ${errors.district ? "border-[var(--urgent)]" : ""}`}
                    placeholder="e.g., Jorhat, Kamrup Metropolitan"
                    disabled={submitting}
                  />
                  {errors.district && <p className="text-[var(--urgent)] text-sm mt-1">{errors.district}</p>}
                </div>
              </div>

              {/* Category & Annual Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="field-label">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="field-input"
                    disabled={submitting}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="annual_income" className="field-label">Annual Family Income (₹)</label>
                  <input
                    id="annual_income"
                    name="annual_income"
                    type="number"
                    min="0"
                    value={formData.annual_income}
                    onChange={handleChange}
                    className={`field-input ${errors.annual_income ? "border-[var(--urgent)]" : ""}`}
                    placeholder="150000"
                    disabled={submitting}
                  />
                  {errors.annual_income && <p className="text-[var(--urgent)] text-sm mt-1">{errors.annual_income}</p>}
                </div>
              </div>

              {/* Disability */}
              <div className="flex items-center gap-3">
                <input
                  id="disability"
                  name="disability"
                  type="checkbox"
                  checked={formData.disability}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
                />
                <label htmlFor="disability" className="text-[var(--text-2)] cursor-pointer">
                  Person with disability (for applicable schemes)
                </label>
              </div>

              {/* Documents */}
              <div>
                <label className="field-label">Documents you have</label>
                <div className="flex flex-wrap gap-2">
                  {["Aadhaar", "Bank passbook", "Caste certificate", "Income certificate", "Land record"].map(doc => (
                    <label key={doc} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-badge)] border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        name="documents_have"
                        value={doc}
                        checked={formData.documents_have?.includes(doc) || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
                      />
                      <span className="text-sm text-[var(--text-2)]">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating account…" : "Continue to Step 2"}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-[var(--text-2)] text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--new)] hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[var(--text-3)] text-xs mt-6 max-w-xl mx-auto">
            We never store Aadhaar numbers, OTPs, or passwords in plain text. Your data stays on this device.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterStep1() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <RegisterStep1Content />
    </Suspense>
  );
}