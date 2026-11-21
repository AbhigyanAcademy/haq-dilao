// Haq Dilao — Register Step 2 Page (Role-specific fields)

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const CROPS = ["Rice", "Wheat", "Maize", "Tea", "Jute", "Sugarcane", "Cotton", "Pulses", "Oilseeds", "Vegetables", "Fruits", "Other"];
const COURSES = ["B.A.", "B.Sc.", "B.Com.", "B.Tech.", "B.Ed.", "M.A.", "M.Sc.", "M.Com.", "M.Tech.", "MBBS", "BDS", "Ph.D.", "Diploma", "ITI", "Other"];
const SECTORS = ["Agriculture", "Manufacturing", "Retail", "Services", "Food Processing", "Textiles", "Handicrafts", "Tourism", "IT/Software", "Construction", "Transport", "Other"];
const BUSINESS_STAGES = ["idea", "new", "existing"] as const;
const EDUCATION_LEVELS = ["school", "ug", "pg"] as const;
const INSTITUTION_TYPES = ["govt", "private"] as const;
const LAND_OWNERSHIP = ["owner", "lessee", "none"] as const;

type Role = "farmer" | "student" | "business";

function RegisterStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [role, setRole] = useState<Role>("farmer");
  interface FormData {
    [key: string]: string | number | boolean | string[];
  }

  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch user role from session on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user?.role) {
          setRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const validateField = (name: string, value: unknown): string | null => {
    if (value === undefined || value === null || value === "") {
      return `${name.replace(/_/g, " ")} is required`;
    }
    if (typeof value === "number" && value < 0) return "Must be positive";
    if (name === "last_exam_percent" && typeof value === "number" && (value < 0 || value > 100)) return "Percentage must be 0-100";
    return null;
  };

  const handleChange = (name: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    // Validate required fields for role
    const requiredFields: Record<Role, string[]> = {
      farmer: ["land_hectares", "land_ownership", "crops"],
      student: ["education_level", "course", "institution_type", "last_exam_percent"],
      business: ["business_stage", "sector", "annual_turnover", "employees"],
    };

    const newErrors: Record<string, string> = {};
    for (const field of requiredFields[role]) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/step2", {
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

  const renderFarmerFields = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="land_hectares" className="field-label">Land Holding (hectares)</label>
          <input
            id="land_hectares"
            name="land_hectares"
            type="number"
            step="0.1"
            min="0"
            value={String(formData.land_hectares ?? "")}
            onChange={e => handleChange("land_hectares", Number(e.target.value) || 0)}
            className={`field-input ${errors.land_hectares ? "border-[var(--urgent)]" : ""}`}
            placeholder="1.5"
            disabled={submitting}
          />
          {errors.land_hectares && <p className="text-[var(--urgent)] text-sm mt-1">{errors.land_hectares}</p>}
        </div>
        <div>
          <label htmlFor="land_ownership" className="field-label">Land Ownership</label>
          <select
            id="land_ownership"
            name="land_ownership"
            value={String(formData.land_ownership ?? "")}
            onChange={e => handleChange("land_ownership", e.target.value)}
            className={`field-input ${errors.land_ownership ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {LAND_OWNERSHIP.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
          {errors.land_ownership && <p className="text-[var(--urgent)] text-sm mt-1">{errors.land_ownership}</p>}
        </div>
      </div>

      <div>
        <label className="field-label">Crops Grown (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {CROPS.map(crop => (
            <label key={crop} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-badge)] border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                name="crops"
                value={crop}
                checked={(formData.crops as string[])?.includes(crop) || false}
                onChange={e => {
                  const crops = ((formData.crops as string[]) || []);
                  if (e.target.checked) {
                    handleChange("crops", [...crops, crop]);
                  } else {
                    handleChange("crops", crops.filter(c => c !== crop));
                  }
                }}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
                disabled={submitting}
              />
              <span className="text-sm text-[var(--text-2)]">{crop}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="has_irrigation"
            checked={Boolean(formData.has_irrigation)}
            onChange={e => handleChange("has_irrigation", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">Has irrigation</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="has_kcc"
            checked={Boolean(formData.has_kcc)}
            onChange={e => handleChange("has_kcc", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">Has Kisan Credit Card</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="bank_account_linked"
            checked={formData.bank_account_linked !== false}
            onChange={e => handleChange("bank_account_linked", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">Bank account linked</span>
        </label>
      </div>
    </div>
  );

  const renderStudentFields = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="education_level" className="field-label">Education Level</label>
          <select
            id="education_level"
            name="education_level"
            value={String(formData.education_level ?? "")}
            onChange={e => handleChange("education_level", e.target.value)}
            className={`field-input ${errors.education_level ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {EDUCATION_LEVELS.map(e => (
              <option key={e} value={e}>{e === "school" ? "School (Class 11-12)" : e.toUpperCase()}</option>
            ))}
          </select>
          {errors.education_level && <p className="text-[var(--urgent)] text-sm mt-1">{errors.education_level}</p>}
        </div>
        <div>
          <label htmlFor="institution_type" className="field-label">Institution Type</label>
          <select
            id="institution_type"
            name="institution_type"
            value={String(formData.institution_type ?? "")}
            onChange={e => handleChange("institution_type", e.target.value)}
            className={`field-input ${errors.institution_type ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {INSTITUTION_TYPES.map(i => (
              <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
            ))}
          </select>
          {errors.institution_type && <p className="text-[var(--urgent)] text-sm mt-1">{errors.institution_type}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course" className="field-label">Course / Program</label>
          <select
            id="course"
            name="course"
            value={String(formData.course ?? "")}
            onChange={e => handleChange("course", e.target.value)}
            className={`field-input ${errors.course ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {COURSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.course && <p className="text-[var(--urgent)] text-sm mt-1">{errors.course}</p>}
        </div>
        <div>
          <label htmlFor="last_exam_percent" className="field-label">Last Exam Percentage (%)</label>
          <input
            id="last_exam_percent"
            name="last_exam_percent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={String(formData.last_exam_percent ?? "")}
            onChange={e => handleChange("last_exam_percent", Number(e.target.value) || 0)}
            className={`field-input ${errors.last_exam_percent ? "border-[var(--urgent)]" : ""}`}
            placeholder="84"
            disabled={submitting}
          />
          {errors.last_exam_percent && <p className="text-[var(--urgent)] text-sm mt-1">{errors.last_exam_percent}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="studying_outside_state"
          checked={Boolean(formData.studying_outside_state)}
          onChange={e => handleChange("studying_outside_state", Boolean(e.target.checked))}
          className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
          disabled={submitting}
        />
        <span className="text-sm text-[var(--text-2)]">Studying outside home state</span>
      </label>
    </div>
  );

  const renderBusinessFields = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="business_stage" className="field-label">Business Stage</label>
          <select
            id="business_stage"
            name="business_stage"
            value={String(formData.business_stage ?? "")}
            onChange={e => handleChange("business_stage", e.target.value)}
            className={`field-input ${errors.business_stage ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {BUSINESS_STAGES.map(b => (
              <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
            ))}
          </select>
          {errors.business_stage && <p className="text-[var(--urgent)] text-sm mt-1">{errors.business_stage}</p>}
        </div>
        <div>
          <label htmlFor="sector" className="field-label">Sector</label>
          <select
            id="sector"
            name="sector"
            value={String(formData.sector ?? "")}
            onChange={e => handleChange("sector", e.target.value)}
            className={`field-input ${errors.sector ? "border-[var(--urgent)]" : ""}`}
            disabled={submitting}
          >
            <option value="">Select</option>
            {SECTORS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sector && <p className="text-[var(--urgent)] text-sm mt-1">{errors.sector}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="annual_turnover" className="field-label">Annual Turnover (₹)</label>
          <input
            id="annual_turnover"
            name="annual_turnover"
            type="number"
            min="0"
            value={String(formData.annual_turnover ?? "")}
            onChange={e => handleChange("annual_turnover", Number(e.target.value) || 0)}
            className={`field-input ${errors.annual_turnover ? "border-[var(--urgent)]" : ""}`}
            placeholder="500000"
            disabled={submitting}
          />
          {errors.annual_turnover && <p className="text-[var(--urgent)] text-sm mt-1">{errors.annual_turnover}</p>}
        </div>
        <div>
          <label htmlFor="employees" className="field-label">Number of Employees</label>
          <input
            id="employees"
            name="employees"
            type="number"
            min="0"
            value={String(formData.employees ?? "")}
            onChange={e => handleChange("employees", Number(e.target.value) || 0)}
            className={`field-input ${errors.employees ? "border-[var(--urgent)]" : ""}`}
            placeholder="2"
            disabled={submitting}
          />
          {errors.employees && <p className="text-[var(--urgent)] text-sm mt-1">{errors.employees}</p>}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer w-full">
            <input
              type="checkbox"
              name="udyam_registered"
              checked={Boolean(formData.udyam_registered)}
              onChange={e => handleChange("udyam_registered", Boolean(e.target.checked))}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
              disabled={submitting}
            />
            <span className="text-sm text-[var(--text-2)]">Udyam Registered</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="loan_needed"
            checked={Boolean(formData.loan_needed)}
            onChange={e => handleChange("loan_needed", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">Need loan</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="woman_owned"
            checked={Boolean(formData.woman_owned)}
            onChange={e => handleChange("woman_owned", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">Woman owned</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="sc_st_owned"
            checked={Boolean(formData.sc_st_owned)}
            onChange={e => handleChange("sc_st_owned", Boolean(e.target.checked))}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--new)] focus:ring-[var(--new)]"
            disabled={submitting}
          />
          <span className="text-sm text-[var(--text-2)]">SC/ST owned</span>
        </label>
      </div>
    </div>
  );

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
              <h1 className="serif text-[28px] text-[var(--text-1)] mb-2">Complete your profile</h1>
              <p className="text-[var(--text-2)]">Step 2 of 2: {role.charAt(0).toUpperCase() + role.slice(1)} details</p>
            </div>

            {/* Progress indicator */}
            <div className="flex mb-8" role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={2}>
              <div className="flex-1 h-1.5 bg-[var(--new)] rounded-full" style={{ width: "50%" }} />
              <div className="flex-1 h-1.5 bg-[var(--new)] rounded-full ml-2" style={{ width: "50%" }} />
            </div>

            {/* Error message */}
            {serverError && (
              <div className="mb-6 p-4 bg-[var(--urgent)]/20 border border-[var(--urgent)]/50 rounded-[var(--radius-input)] text-[var(--urgent)] text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {role === "farmer" && renderFarmerFields()}
              {role === "student" && renderStudentFields()}
              {role === "business" && renderBusinessFields()}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Completing registration…" : "Complete Registration"}
              </button>
            </form>

            <p className="text-center text-[var(--text-3)] text-xs mt-6">
              <Link href="/login" className="text-[var(--new)] hover:underline font-medium">
                Already have an account? Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterStep2() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <RegisterStep2Content />
    </Suspense>
  );
}