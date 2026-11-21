# Architecture

## System diagram
```mermaid
flowchart LR
  U[User browser] --> W[Next.js web app]
  A[Admin /admin] --> W
  W --> API[Route handlers /api/*]
  API --> ENG[Eligibility engine - pure TypeScript]
  API --> DB[(JSON files in web/data)]
  API --> L1[NVIDIA API - primary LLM]
  L1 -. on failure .-> L2[Google AI Studio - fallback LLM]
  L2 -. on failure .-> FB[Static summary_fallback in scheme record]
  W --> X[Chrome extension]
  X --> P[Official portal OR local mock portal]
```

## Apply flow
```mermaid
sequenceDiagram
  participant U as User
  participant W as Haq Dilao web
  participant X as Extension
  participant P as Portal
  U->>W: Click Apply on a scheme
  W->>W: Build application sheet from profile + form_fields
  W->>X: postMessage profile + autofill map
  X->>X: Save to chrome.storage.local
  W->>P: Open portal in new tab
  U->>P: Log in (OTP / captcha by user)
  U->>X: Click floating Autofill button
  X->>P: Fill mapped fields, highlight unfilled
  U->>P: Review and press final submit
  U->>W: Mark as applied + enter application ID
  W->>W: Create tracker entry
```

## Components
| Component | Responsibility |
|---|---|
| `web/` Next.js (App Router, TypeScript, Tailwind) | UI, auth, API routes, all logic |
| `web/lib/eligibility.ts` | Pure functions: rule evaluation, status, apply score. No I/O, no LLM |
| `web/lib/store.ts` | Only file that reads/writes JSON files (atomic writes). Swappable later |
| `web/lib/llm.ts` | NVIDIA -> Gemini -> static fallback, with caching |
| `web/lib/dates.ts` | Date logic in Asia/Kolkata, date-only comparisons |
| `web/lib/notify.ts` | Create notifications with dedupe keys; reminder check |
| `web/data/*.json` | users, schemes, applications, notifications, summary-cache |
| `extension/` | MV3 content scripts: receive profile, autofill portal form |

## Design decisions
- JSON file store, not a database: zero setup, works offline, demo runs locally. (Vercel's filesystem is read-only, so the deployed version would need Upstash Redis or Turso; this is a post-hackathon step, not part of the build.)
- Eligibility deterministic so the app never tells someone they qualify by accident.
- No cron: reminders run on dashboard load and via an admin "Run reminder check" button.
- Every external call (LLM) has a fallback so the demo cannot break.
