# Haq Dilao — design system (frosted glass + command bar)

> **For Claude Code:** all UI follows this file. Do not invent colors, fonts or components beyond it. Verify the named Google fonts exist in `next/font/google` before using them; if one is missing, tell the user and pick the closest alternative. Performance and readability rules below are mandatory, not optional polish.

## Direction
A spatial, dark, frosted-glass interface with a floating AI command bar over a slowly moving mesh background. Scheme cards "materialize" as translucent glass. The one local touch: a thin **gamosa thread** (red and white woven line) under the top bar, so it does not look like a generic AI template.

Spend the boldness in three places: the ambient mesh, the command bar that glides upward, and the glass scheme cards. Everything else stays quiet.

## Colors
| Token | Value | Use |
|---|---|---|
| `--obsidian` | `#06070A` | Page base |
| `--orb-indigo` | `#4F46E5` | Mesh orb (35% opacity) |
| `--orb-cyan` | `#22D3EE` | Mesh orb (25% opacity) |
| `--orb-emerald` | `#10B981` | Mesh orb (25% opacity) |
| `--text-1` | `rgba(255,255,255,0.92)` | Primary text |
| `--text-2` | `rgba(255,255,255,0.68)` | Secondary text |
| `--text-3` | `rgba(255,255,255,0.55)` | Hints (never go lighter than this for readable text) |
| `--eligible` | `#34D399` | Eligible badge, "document matched" |
| `--soon` | `#FBBF24` | Closing within 7 days |
| `--urgent` | `#F87171` | Closing within 3 days, missing document |
| `--new` | `#22D3EE` | New badge |
| `--gamosa` | `#B4232C` | Gamosa thread only |
Primary buttons: solid white (`#FFFFFF`) with obsidian text. Body text must meet WCAG AA contrast on top of the glass.

## Typography
- **Display (greeting and page titles only): Instrument Serif.** Large, regular weight.
- **Body and UI: Figtree.** Fallbacks: Noto Sans Bengali (covers Assamese), Noto Sans Devanagari.
- Scale 14 / 16 / 18 / 22 / 28 / 44. Body 16px minimum. Sentence case. No ALL-CAPS labels, no eyebrow labels.

## Ambient mesh background (`MeshBackground`)
- Fixed layer behind everything: obsidian base plus 3 large `div`s, each with a `radial-gradient(circle, color, transparent 60%)` background. Do NOT use `filter: blur()` on them and do NOT use a canvas.
- Animate only `transform: translate()` (and slight scale) with CSS keyframes, 30 to 45 seconds each, `ease-in-out`, alternate. No JS animation loop.
- Keep orbs at the opacities above so cards stay readable.

## Glass card recipe (`GlassCard`)
```
bg-white/[0.06] backdrop-blur-xl md:backdrop-blur-2xl
border border-white/10 border-t-white/20 border-l-white/20
rounded-3xl
shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_32px_rgba(0,0,0,0.35)]
```
- Inner content sits on a slightly darker wash (`bg-black/10`) where text-heavy, to protect contrast.
- Fallback: `@supports not (backdrop-filter: blur(1px))` and `@media (prefers-reduced-transparency: reduce)` use solid `#12141B` with a `border-white/10` border.
- Radius hierarchy: cards 24px, inner panels 16px, inputs and buttons 14px, badges and pills full.

## Command bar (`CommandBar`) — behavior in `docs/command-bar.md`
- Glass pill, 56px high, search icon, text input, submit button. Placeholder is a real example: "Which schemes close this week?"
- **Start state:** vertically centered like Spotlight, under the serif greeting ("Good morning, Ravi." style, using the user's first name) and a line with counts ("4 schemes match you. 2 close this week."). Quick-prompt pills below it.
- **After first query or pill tap:** the bar glides to the top using Framer Motion `layout` (shared layout transition), and the result cards materialize below.
- **On screens under 768px:** the bar docks to the bottom (thumb zone) after the first query, results scroll above it. Respect the on-screen keyboard (use `dvh`, not `vh`).

## Scheme cards in results (`SchemeGlassCard`)
Contents: scheme name (Instrument Serif 22px), one-line benefit, live badges, score ring, "Why you qualify" first rule label, and a "Documents" toggle.
- **Live eligibility badge:** "Eligible" with a softly pulsing dot (pulse only while the card is on screen; stop pulsing when reduced motion). Date badges: New, Closing soon, Closing in N days, Open all year, Applied.
- **Magnetic hover (desktop only, `(hover: hover) and (pointer: fine)`):** card shifts up to 6px toward the cursor and a soft radial highlight follows the pointer (CSS variables `--mx`, `--my`). No tilt beyond 3 degrees. Nothing like this on touch devices.
- **Document readiness drawer (`DocReadinessDrawer`):** tapping the Documents toggle (on touch) or hovering/focusing it (desktop) expands a frosted sub-panel inside the card. Each required document is a row: name, match indicator (green check "You have this" or red dot "Missing"), tappable to mark as owned. Header shows "3 of 4 ready" and updates the apply score instantly. The drawer must work with keyboard (button with `aria-expanded`).
- Primary button: "View and apply".

## Other screens
Registration, scheme detail, apply sheet, applications, notifications, profile and admin use the same tokens: a glass panel on the mesh. Inputs use `bg-white/[0.08]`, visible labels above the field (no placeholder-only fields), 14px radius, cyan focus ring. Long forms keep one column.
- **Apply sheet:** label/value rows with Copy buttons (toast "Copied").
- **Applications:** glass card per application with a vertical status timeline.
- **Landing:** serif headline "Know what you can claim.", three role chips (Student, Farmer, Business owner), one primary button "Check my schemes", mesh visible behind.

## Motion rules
- Three moments only: (1) the bar gliding up, (2) result cards materializing (opacity 0 to 1, `y` 12 to 0, slight blur-in, 60ms stagger, 350ms each), (3) the drawer expanding. Plus small action feedback (checkbox, toast, score ring fill once).
- Use Framer Motion only for those; use CSS for the mesh and pulse.
- `prefers-reduced-motion: reduce`: turn off mesh animation, pulse, magnetic hover and stagger; use instant transitions.
- Cards animate on first appearance only, never on every re-render.

## Performance (mandatory; many users are on low-end Android phones)
- Maximum 6 glass cards with `backdrop-filter` visible at once on mobile; render the rest as solid `#12141B` cards or paginate.
- Use `backdrop-blur-xl` on mobile, `2xl` only on desktop.
- Animate only `transform` and `opacity`. Never animate `backdrop-filter`, `box-shadow` or `filter`.
- Pause the mesh animation when the tab is hidden (CSS `animation-play-state` via a `visibilitychange` class).
- No images, no stock photos, no extra icon libraries (simple inline SVG or `lucide-react` only if the user approves).

## Accessibility floor
Visible focus ring (2px `--new` cyan with offset) on every interactive element, labelled inputs, `aria-live="polite"` on the command bar result summary, `lang` attribute set, 44px touch targets, no information by color alone (badges also have text).

## Copy rules
Plain verbs, sentence case: "Check my schemes", "View and apply", "Copy", "Open official portal", "Mark as applied". Empty states give a next action. Errors say what happened and how to fix it, without apologizing. Never show rupee totals unless the scheme benefit amounts are marked verified.

## Do not
No other UI kits, no light mode, no neon glow effects, no emoji as icons, no gradients except the mesh orbs, no text over the mesh without a glass panel behind it.
