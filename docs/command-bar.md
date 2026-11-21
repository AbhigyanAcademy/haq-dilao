# Command bar behavior

The command bar is a way to filter, ask about and navigate the user's ALREADY-ELIGIBLE schemes. It never decides eligibility and never invents scheme data. All result cards come from deterministic code over `schemes.json` and the user's profile.

## Intent allowlist
| Intent | Example queries | Result |
|---|---|---|
| `list_all` | "show my schemes", "everything" | All eligible, open schemes |
| `closing_soon` | "closing this week", "deadlines" | Eligible schemes with `last_date` within 7 days, soonest first |
| `new_schemes` | "what's new" | Eligible schemes posted in the last 7 days |
| `best_matches` | "what can I apply for today", "best for me" | Top 3 by apply score among open, not-yet-applied schemes |
| `missing_documents` | "documents I'm missing" | Eligible schemes that have missing documents, with the missing document names |
| `explain_scheme` | "explain PM-KISAN" | Opens that scheme's card with the AI summary (summary is generated from scheme record only) |
| `my_applications` | "my applications", "status" | Summary of applications and statuses, link to `/applications` |
| `search_text` | any other word that matches a scheme name or benefit text | Eligible schemes whose name or benefit contains the term |
| `unknown` | anything else | Friendly message and the quick-prompt pills again |

## Parsing (two layers, in this order)
1. **Deterministic keyword matching** in `lib/intents.ts` (case-insensitive; keep keyword lists in one object so Hindi/Assamese words can be added later). Must work with NO internet.
2. **Optional LLM classification** only if layer 1 returns `unknown` and the NVIDIA key is set: send the user's text plus the allowlist and ask for JSON `{ "intent": "<one of the allowlist>", "term": "<optional string>" }`. Validate the JSON by hand: intent must be in the allowlist, term must be a short string. Anything else becomes `unknown`. The LLM never returns scheme data, rules, dates or advice.

## Responses
Summary line text is templated by code, for example "2 schemes close this week." or "You have 3 documents to collect." Never LLM-written. Announce the summary line in an `aria-live="polite"` region.

## Quick-prompt pills (start state)
"What can I apply for today?", "Closing this week", "Documents I'm missing", "Show all my schemes".

## Rules
- Only schemes returned by the eligibility engine for this user can ever appear.
- Closed schemes appear only in the collapsed Closed section, never in command results.
- Max 500 characters per query; trim and ignore empty queries.
- Log nothing sensitive; do not store queries.
