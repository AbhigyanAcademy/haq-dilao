# Data model

All data lives in `web/data/*.json`. Types in `web/lib/types.ts`. Field names are snake_case exactly as below.

## User
```json
{
  "id": "u_xxx",
  "email": "",
  "password_hash": "",
  "created_at": "ISO",
  "role": "student | farmer | business",
  "name": "",
  "age": 0,
  "gender": "male | female | other",
  "state": "",
  "district": "",
  "category": "general | obc | sc | st",
  "annual_income": 0,
  "disability": false,
  "documents_have": ["Aadhaar", "Bank passbook"],

  "education_level": "school | ug | pg",
  "course": "",
  "institution_type": "govt | private",
  "last_exam_percent": 0,
  "studying_outside_state": false,

  "land_hectares": 0,
  "land_ownership": "owner | lessee | none",
  "crops": [],
  "has_irrigation": false,
  "has_kcc": false,
  "bank_account_linked": true,

  "business_stage": "idea | new | existing",
  "sector": "",
  "annual_turnover": 0,
  "employees": 0,
  "udyam_registered": false,
  "loan_needed": false,
  "woman_owned": false,
  "sc_st_owned": false
}
```
Only the fields of the user's role (plus common fields) are filled. `annual_income` and `annual_turnover` are rupees (numbers). Never store Aadhaar numbers: `documents_have` is only a list of document NAMES the user says they own.

## Scheme
```json
{
  "id": "pm-kisan",
  "role": "farmer | student | business",
  "name": "",
  "benefit": "",
  "rules": [
    { "field": "land_hectares", "op": "lte", "value": 2, "label": "Land holding up to 2 hectares" }
  ],
  "documents": ["Aadhaar", "Land record", "Bank passbook"],
  "apply_url": null,
  "source_url": null,
  "form_fields": ["name", "district", "land_hectares"],
  "posted_date": "YYYY-MM-DD or null",
  "last_date": "YYYY-MM-DD or null (null = open all year)",
  "status_note": "",
  "summary_fallback": "Plain-language 3-4 sentence summary used when LLMs are unavailable",
  "verified": false,
  "last_verified": null,
  "verify_notes": "",
  "is_demo": false,
  "autofill": null
}
```
- `op` is one of: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in`, `not_in`, `between` (value is `[min,max]`).
- Max 4 rules per scheme. Keep rules simple. If unsure of a rule, omit it and explain in `verify_notes`.
- `autofill` (only for mock portal in the demo, real portals when user supplies selectors): `{ "portal_match": "localhost:3000/mock-portal", "fields": [ { "profile": "name", "selector": "#name", "type": "text" } ] }`.

## Application
```json
{
  "id": "a_xxx",
  "user_id": "",
  "scheme_id": "",
  "applied_at": "ISO",
  "application_ref": "user-entered ID",
  "status": "applied | under_review | more_info_needed | approved | rejected",
  "history": [ { "status": "applied", "at": "ISO", "note": "" } ]
}
```

## Notification
```json
{
  "id": "n_xxx",
  "user_id": "",
  "type": "new_scheme | deadline_7d | deadline_1d | status_change",
  "scheme_id": "",
  "message": "",
  "created_at": "ISO",
  "read": false,
  "dedupe_key": "userId:type:schemeId:extra"
}
```
Never create two notifications with the same `dedupe_key`.

## Eligibility engine (`lib/eligibility.ts`, pure functions)
- `evaluate(user, scheme)` returns `{ status, passed[], failed[], unknown[] }`.
  - A rule whose profile field is missing counts as failed with reason "unknown".
  - `status = "eligible"` if no rule failed.
  - `status = "near_miss"` if exactly one rule failed AND its op is numeric (`lt lte gt gte between`).
  - Otherwise `"not_eligible"`.
- `applyScore(user, scheme)` = `round(70 * (passedRules / totalRules) + 30 * (docsOwned / docsRequired))`. If a denominator is 0, treat that part as 1. Show the reason text, e.g. "90% ready: missing Land record".
- `whyYouQualify(user, scheme)` = list of rule labels that passed (deterministic text, no LLM).

## Date logic (`lib/dates.ts`)
Date-only comparisons in Asia/Kolkata. Labels:
- `New`: posted within the last 7 days
- `Closing soon`: last_date within the next 7 days
- `Closed`: last_date before today (hide from main list; show in a collapsed "Closed" section)
- `Open all year`: last_date is null
- Countdown text: "Closes in N days"
