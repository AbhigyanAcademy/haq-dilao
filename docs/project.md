# Haq Dilao — Project Brief

## One-liner
Register once; see only the government schemes you are eligible for; get an AI summary and apply-readiness score; prepare and launch your application in one click; track it; get notified of new schemes, deadlines and status changes.

## Problem
Millions of citizens miss benefits they qualify for because they do not know a scheme exists, cannot tell if they are eligible, and get stuck in paperwork. Searching hundreds of schemes is the barrier.

## Users (3 roles only)
1. Student
2. Farmer
3. Business owner

## Hackathon context
- Hack2Skill "PromptWars x Code1 Innovators", problem statement PS07: SchemeFinder — Government Schemes.
- Solo build, 6 hours, working prototype + pitch. Goal: win. Pitch with storytelling and social impact.
- Region focus: Assam / North East India, plus central schemes.

## Core promise (what the demo must show)
1. Register -> dashboard shows ONLY eligible schemes for that user.
2. Each scheme shows: AI plain-language summary, why-you-qualify, apply score, document checklist, posted date, last date, countdown.
3. One-click apply: app prepares the application sheet and opens the official portal; browser extension autofills the form (demo uses a mock portal; real portals via mapped selectors when available). User does OTP/captcha/submit.
4. Application tracker with status timeline.
5. Admin adds a brand-new scheme live -> eligible users instantly get a notification.
6. Deadline reminders (7 days and 1 day) for eligible, not-yet-applied users.

## Honesty line (say this in the pitch)
We remove the hard part: finding the right schemes and preparing the application. The citizen finishes with their own OTP. Real status sync and full-portal integration are the roadmap (DigiLocker / API Setu / state partnerships).

## Success criteria
- A judge can register as each role in under 90 seconds and see different scheme lists.
- Zero crashes in the demo path. The demo works with NO internet (static fallbacks).
- Every scheme shown has a visible source link and last-verified date.

## Look and feel
See `design-system.md` (dark frosted glass, ambient mesh, floating AI command bar, gamosa thread) and `command-bar.md`.

## Out of scope
See `features-scope.md`.
