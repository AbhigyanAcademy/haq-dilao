# Scope

## MUST BUILD (real)
1. Two-step registration (account + common fields, then role fields), login, logout, profile edit.
2. Scheme dataset: about 6 schemes per role (draft, flagged unverified) + demo schemes.
3. Eligibility engine + dashboard showing only eligible schemes, sorted: Closing soon first, then New, then by apply score.
4a. Command bar on the dashboard (`docs/command-bar.md`): deterministic intents, optional LLM intent classification, quick-prompt pills, animated glide from center to top (docked at the bottom on mobile).
4b. Glass scheme cards with live eligibility badges and a Document readiness drawer.
4. Scheme detail page: AI summary, deterministic why-you-qualify, AI insight (optional, fallback text), apply score, document checklist (user ticks documents they own), posted date, last date, countdown, source link, last verified.
5. Application sheet (pre-filled answers mapped from `form_fields`) with a Copy button per field and "Open official portal" button.
6. "Mark as applied" with application ID -> My Applications tracker with status timeline.
7. Notifications bell + page: new scheme, deadline 7d/1d, status change.
8. Admin panel: login, add scheme (with a "Quick-fill demo scheme" button), run reminder check, list schemes.

## SIMULATED (must be labeled honestly in the UI where relevant)
- Status updates: a "Demo: simulate update" button on the tracker advances status and creates a notification.
- Autofill target: a local `/mock-portal/scholarship` page that is CLEARLY labeled "DEMO mock portal — not a government site".
- New scheme feed: admin form acts as the feed.

## STRETCH (only if time remains, in this order)
1. Chrome extension autofill (Step 9) — attempt if >75 minutes remain after Step 8.
2. Near-miss section ("you are Rs X over the limit").
3. Assamese/Hindi UI toggle for summaries.
4. Email notifications.

## NOT BUILDING
Real portal submission, real status sync, DigiLocker, document upload/verification, SMS/push, scraping, Aadhaar handling, payments, native apps.
