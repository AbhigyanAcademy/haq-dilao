# Build steps (strict order; verify each before moving on)

Time budget (6 hours): Steps 0-2 = 1h15, Step 3 = 30m, Step 4 = 45m, Step 5 = 60m, Step 6 = 30m, Step 7 = 45m, Step 8 = 45m, Step 9 = 75m (only if time remains), Step 10 = 30m.
If behind schedule, cut in this order: Step 9 extension, near-miss, language toggle. Never cut Step 8 (admin new-scheme demo).

## Step 0 — Environment check
- Run `node -v`, `npm -v`, `git --version`. Node must be a version supported by current Next.js (check its docs).
- Check: all three print versions. If not, STOP and tell me.

## Step 1 — Scaffold
- `cd haq-dilao`, `git init`, create `.gitignore` (node_modules, .next, `web/.env.local`).
- Run `npx create-next-app@latest --help`, then create the app in `web/` with TypeScript, Tailwind, ESLint, App Router, no `src` dir unless the default demands it (note whatever you choose in `docs/progress.md`).
- Create `web/.env.local` and `web/.env.example` per `tech-stack.md`; generate SESSION_SECRET with node.
- Set up theme tokens (colors, radius, shadow) and fonts (Young Serif, Figtree, plus Noto Sans Bengali/Devanagari fallbacks) exactly per `docs/design-system.md`. Verify the font names exist in `next/font/google` first; if one is missing, tell me.
- Check: `npm run dev` starts, the home page loads (fetch it with curl.exe or Invoke-WebRequest and show status 200), `npm run build` succeeds.

## Step 2 — Types, store, seed data
- Create `lib/types.ts`, `lib/store.ts` (read/write JSON in `web/data/`, atomic writes via temp file + rename), `lib/dates.ts`.
- Create `data/schemes.json` with ~6 DRAFT schemes per role:
  - Farmer: PM-KISAN, PM Fasal Bima Yojana, Kisan Credit Card, Soil Health Card, PM-KUSUM, plus one more
  - Student: Central Sector Scholarship, Post-Matric Scholarship (SC/ST/OBC), Pre-Matric Scholarship, PM Vidyasaarathi/PM-Vidyalaxmi education loan scheme, Nijut Moina (Assam), a minority merit-cum-means scholarship
  - Business: PM Mudra Yojana, Stand-Up India, PMEGP, CGTMSE, Startup India, PM Vishwakarma
  - Use general knowledge ONLY for draft rules. Every scheme: `verified: false`, `last_verified: null`, `apply_url` and `source_url` set to `null` unless you are certain, dates `null`, and `verify_notes` listing what needs checking. Write a good `summary_fallback` and `form_fields`.
  - Add demo schemes (see `user-flows.md`).
- Append every unverified item to `docs/data-verification-checklist.md`.
- Create `scripts/seed.ts` (`npm run seed`) for demo users and date-relative demo schemes.
- Check: `npm run seed` runs twice without duplicating records; JSON files are valid.

## Step 3 — Eligibility engine + test
- Implement `lib/eligibility.ts` exactly per `data-model.md`.
- Create `scripts/test-engine.ts` using `node:assert`, with at least 12 cases: each op, missing field, near_miss, between, closed scheme, apply score math, whyYouQualify.
- Check: `npx tsx scripts/test-engine.ts` passes. Show output. Also show that the three demo users get DIFFERENT eligible lists.

## Step 4 — Auth and registration
- Two-step register, login, logout, session via `jose` cookie, password hashing via `bcryptjs`, route protection for citizen pages, `/profile` edit.
- Validate inputs server-side. Never return `password_hash` to the client.
- Check: register a new farmer via the UI flow, log out, log in, wrong password rejected, `/dashboard` redirects to login when logged out.

## Step 5 — Dashboard and scheme detail
- Dashboard: eligible only, badges, countdown, apply score, sort order per scope, collapsed Closed section, empty state.
- Scheme detail: summary (placeholder for now: `summary_fallback`), why-you-qualify, documents checklist (saves to profile `documents_have`, score updates), dates, source link and last-verified date, Apply button.
- Build with the components in `docs/design-system.md`: AppShell with gamosa edge and mobile bottom tab bar, ClaimSlip, ScoreRing, Badge, DocChecklist, Skeleton, EmptyState. Follow its screen layouts and copy rules.
- Check: the three demo users see different dashboards; ticking a document changes the score; closed/near-deadline badges render using the demo scheme.

## Step 6 — LLM layer
- `lib/llm.ts`: try NVIDIA, then Gemini (only if `GEMINI_API_KEY` and `GEMINI_MODEL` are set; skip silently otherwise), then static fallback. 8-second timeout per provider. Cache scheme summaries in `data/summary-cache.json`. Personalized insight cached by `userId+schemeId+profile hash`; fallback to deterministic text built from `whyYouQualify` and missing documents.
- System prompt rule for both providers: "Use ONLY the facts provided. Do not add amounts, dates, links or eligibility rules that are not in the input. Write simple English for a first-time reader. 3-4 sentences."
- Before writing provider code, confirm endpoint and request shape in official docs (web fetch if available). Ask me for `NVIDIA_MODEL` and `GEMINI_MODEL` if blank.
- Provide `npm run warm-cache` to pre-generate all summaries so the demo never waits.
- Check: with keys set, a summary is returned and cached; with `NVIDIA_API_KEY` cleared, Gemini is used; with both cleared, `summary_fallback` is shown and the page still works.

## Step 7 — Apply sheet, tracker, status
- Use `Toast`, `StatusTimeline` and `Field` from `docs/design-system.md`.
- `/schemes/[id]/apply`: application sheet from `form_fields` and profile, Copy per field, "Open official portal" (disabled with tooltip if `apply_url` is null), "I have applied" -> application ID form -> creates Application.
- `/applications`: cards with status timeline; "Demo: simulate update" button advances status and creates a `status_change` notification.
- Check: apply flow end to end for each demo user; refreshing keeps state; a scheme already applied is marked "Applied" on the dashboard.

## Step 8 — Notifications and admin
- Use `NotificationBell`, `EmptyState` and `Field` from `docs/design-system.md`; the admin panel may be plainer but must use the same tokens.
- `lib/notify.ts` with dedupe. Bell with unread count, `/notifications` page, mark read.
- `/admin`: password login, add-scheme form + "Quick-fill demo scheme" button + rules JSON textarea validation, scheme list, "Run reminder check".
- On add scheme: notify only eligible users (dedupe). Reminder check: 7-day and 1-day for eligible users with no application.
- Check: add a scheme live while logged in as the farmer in another browser; farmer's bell shows it after refresh; non-eligible demo users get nothing; running reminder check twice creates no duplicates.

## Step 9 — Mock portal + extension (only if >75 minutes remain)
- The mock portal should look deliberately plain (like a basic government form) with the DEMO banner, but still use the same fonts.
- Build `/mock-portal/scholarship` and `extension/` per `extension-and-autofill.md`. Add `autofill` map to the demo scholarship. The scheme's Apply screen posts `HAQ_DILAO_APPLY` via `window.postMessage` then opens the portal in a new tab.
- Check: load the extension unpacked, click Apply as `student@demo.com`, open mock portal, click the floating button, fields fill and highlight, nothing is submitted automatically. Write `extension/README.md` with install steps.

## Step 10 — Polish and demo readiness
- Run `npm run warm-cache`, `npm run seed`, `npm run build`, lint. Fix errors.
- Write `web/README.md` (setup, env, commands) and finalize `docs/data-verification-checklist.md`.
- Add a visible footer note: "Scheme data is curated; verify on the official portal before applying."
- Rehearse `docs/demo-script.md` against the running app and report any step that fails.
- Check: full demo script passes with the internet OFF (fallbacks working).
