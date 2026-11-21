# Progress log

| Step | Status | Notes |
|---|---|---|
| 0 Environment | done | Node v24.20.0, npm 11.19.0, git 2.55.0 |
| 1 Scaffold | done | Next.js 16.4.6 (App Router, TypeScript, Tailwind), fonts (Instrument Serif 400, Figtree, Noto Sans Bengali, Noto Sans Devanagari), design system (frosted glass + mesh), landing page with role chips + sample glass cards. Build passes. |
| 2 Types/store/seed | done | types.ts, store.ts (atomic JSON), dates.ts (Asia/Kolkata), schemes.json (18 draft schemes: 6 per role + 3 demo), seed.ts (3 demo users + 3 date-relative demo schemes). Seed idempotent, JSON valid. |
| 3 Eligibility + test | done | eligibility.ts (evaluate, applyScore, whyYouQualify), test-engine.ts (31 cases: all ops, missing field, near_miss, applyScore, whyYouQualify, demo users differ). All pass. |
| 4 Auth | done | Two-step registration (step1: common fields, step2: role-specific), login, logout, JWT (jose) + bcryptjs, middleware protection, server-side validation, password_hash never returned. Build passes, pages load 200. |
| 5 Dashboard/detail | pending | |
| 5b Command bar | pending | |
| 6 LLM layer | pending | |
| 7 Apply/tracker | pending | |
| 8 Notifications/admin | pending | |
| 9 Mock portal/extension | pending | |
| 10 Polish/demo | pending | |

## Decisions and blockers
(append below)
