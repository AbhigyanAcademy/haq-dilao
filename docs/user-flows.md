# User flows

## Pages
`/` landing, `/register`, `/login`, `/dashboard`, `/schemes/[id]`, `/schemes/[id]/apply` (application sheet), `/applications`, `/notifications`, `/profile`, `/admin`, `/mock-portal/scholarship`.

## Citizen flow
1. Landing -> Register step 1 (email, password, name, role, common fields).
2. Register step 2 (role-specific fields) -> dashboard.
3. Dashboard opens in the command-bar start state (greeting, counts, centered bar, quick-prompt pills). Submitting a query or tapping a pill glides the bar upward and materializes the matching glass cards. A "Show all my schemes" pill lists everything. Cards show only eligible schemes, with badges (New / Closing soon / Open all year), apply score, countdown. Collapsed "Closed" section. Bell icon with unread count.
4. Open scheme: summary, why you qualify, documents checklist (tick owned docs; apply score updates), dates, Apply button.
5. Apply: application sheet with copy buttons; "Open official portal" (and extension autofill if installed); then "I have applied" form -> enter application ID -> tracker entry.
6. Applications page: timeline per application; demo "simulate update" button.
7. Notifications page: list, mark as read.

## Admin flow
1. `/admin` -> enter admin password.
2. Add scheme (form, plus "Quick-fill demo scheme" button, plus a JSON rules textarea with an example).
3. On save: write scheme, evaluate ALL users, create `new_scheme` notifications for eligible users only (dedupe).
4. "Run reminder check" button: creates 7-day and 1-day deadline notifications for eligible users who have not applied.

## Demo users to seed (script `npm run seed`)
- `farmer@demo.com` — Jorhat, Assam, farmer, 1.2 ha, owner, OBC, income 150000.
- `student@demo.com` — Guwahati, Assam, female, UG, govt college, SC, income 200000.
- `business@demo.com` — Guwahati, new business, sector retail, woman-owned, turnover 500000.
All with password `Demo@1234`.
Also seed one clearly marked demo scheme per role whose `last_date` is computed as today + 3 days at seed time (`is_demo: true`, name prefixed `DEMO:`).
