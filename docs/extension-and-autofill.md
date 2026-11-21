# Extension and autofill

## What is possible
A website cannot fill another site's form. A browser extension can (same as a password manager). The user still logs in, solves captcha/OTP and presses submit. We never automate those.

## Files (`extension/`)
- `manifest.json` — Manifest V3. `host_permissions` and content script `matches` for: `http://localhost:3000/*` (our app and mock portal). Real portal domains are added ONLY when the user supplies them. `permissions`: `storage`.
- `content-app.js` — runs on our app origin. Listens for `window.postMessage` of type `HAQ_DILAO_APPLY` (checks `event.origin === window.location.origin` and `event.source === window`), then saves `{ profile, autofill, scheme_id }` into `chrome.storage.local`.
- `content-portal.js` — runs on portal pages. Injects a floating "Haq Dilao Autofill" button. On click, reads storage and fills each mapped field using the native-setter trick, dispatching `input` and `change` events (needed for Angular/React forms). Highlights filled fields green and unfilled ones orange. Never clicks submit.
- `README.md` — how to load unpacked in Chrome (`chrome://extensions`, Developer mode, Load unpacked).

## Fill helper
```js
function setValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
```
For `<select>`, set the matching option by value or visible text. For checkboxes/radios, set `.checked` and dispatch `change`.

## Mock portal (`/mock-portal/scholarship`)
A plain form with known field ids matching the `autofill` map of the demo scholarship: name, email, age, gender, state, district, category, annual_income, course, institution_type, last_exam_percent. Banner: "DEMO mock portal — not a government site". It has a Submit button that only shows a success message (no data leaves the browser).

## Real portals
Selectors for real portals are NOT known. Do not invent them. For each real portal the user wants, the user opens the form, inspects fields, and sends selectors; only then add an `autofill` map. Until then those schemes use the application sheet + copy buttons fallback.

## Safety
Autofill runs only when the user clicks the button. No silent execution. No passwords or Aadhaar stored.
