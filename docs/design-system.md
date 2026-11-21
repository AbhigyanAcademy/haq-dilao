# Haq Dilao — design system

> **For Claude Code:** all UI follows this file. Do not invent colors, fonts or components beyond it. Verify the named Google fonts exist in `next/font/google` before using them; if one is missing, tell the user and pick the closest alternative.

## Direction
A premium civic product for first-time smartphone users in Assam and the North East: calm, trustworthy, dignified. Not a government-portal look and not a generic startup look. The identity comes from the **gamosa** (the Assamese woven red-and-white cloth) and **tea-garden green**.

Spend the boldness in two places only: the **gamosa edge** and the **claim slip** (the scheme card). Everything else stays quiet and disciplined.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `--ink` (Tea Ink) | `#12312B` | Primary text, primary buttons, dark surfaces |
| `--paper` | `#F6F7F4` | Page background (cool off-white, not cream) |
| `--sage` | `#DDE7E0` | Borders, dividers, secondary surfaces |
| `--gamosa` | `#B4232C` | Brand motif and urgency ("Closing soon") only. Never the main button color |
| `--brass` | `#B88A2E` | "New" badge and high apply score. Use sparingly |
| `--slate` | `#5B6B66` | Muted text |
Success green for "Eligible/Approved": `#1F7A4D`. Surfaces are white `#FFFFFF` on `--paper`. No gradients as decoration. No dark mode.
Text contrast must meet WCAG AA.

## Typography
- **Display (headlines, big numbers): Young Serif.** Large, tight, used only for page titles and the hero. No single-word accent in headlines.
- **Body and UI: Figtree.** Fallbacks for scripts: Noto Sans Bengali (covers Assamese) and Noto Sans Devanagari.
- Scale: 14 / 16 / 18 / 22 / 28 / 40 / 56. Body 16px minimum on mobile. Line length under 70 characters. Sentence case everywhere. No ALL-CAPS labels, no eyebrow labels above headings, no "→" on every button.

## Shape and depth
- Radius hierarchy: claim slip 20px, panels 16px, inputs and buttons 12px, badges and chips fully round.
- Shadow: one soft green-tinted shadow, `0 1px 2px rgba(18,49,43,.06), 0 8px 24px rgba(18,49,43,.06)`. Hairline `1px solid var(--sage)` borders.
- Spacing on an 8px grid. Generous whitespace. Touch targets at least 44px.

## Signature element 1: gamosa edge
A 10px strip across the top of the app shell (and under the landing hero). Tune it visually:
```css
.gamosa-edge {
  height: 10px;
  background:
    linear-gradient(135deg, transparent 45%, var(--paper) 45% 55%, transparent 55%) 0 0 / 12px 10px,
    linear-gradient(45deg,  transparent 45%, var(--paper) 45% 55%, transparent 55%) 0 0 / 12px 10px,
    var(--gamosa);
}
```

## Signature element 2: claim slip (scheme card)
A ticket-shaped card, the one memorable component. Structure:
```
+--------------------------------------+
|  PM-KISAN                [New]       |   scheme name (Young Serif), badge
|  Income support for small farmers    |   one-line benefit (slate)
|                                      |
|  (score ring 85)   Closes in 5 days  |   ring left, deadline right
| - - - - - - - - - - - - - - - - - - -|   dashed perforation line
|  Why you qualify: Land up to 2 ha    |   first matching rule label
|  [View and apply]                    |   primary button (ink)
+--------------------------------------+
```
- Left and right notches at the perforation line (two 20px circles in `--paper` positioned on the card edges) and a dashed `--sage` divider.
- Badges: `New` (brass), `Closing soon` (gamosa), `Open all year` (sage), `Applied` (green).
- Hover/press: lift 2px with the shadow. No other card animations.

## Components to build (and only these)
`AppShell` (gamosa edge, top bar with logo, bell, avatar; **bottom tab bar on mobile**: Schemes, Applications, Alerts, Profile), `ClaimSlip`, `ScoreRing` (SVG ring, animates once from 0 on mount), `Badge`, `DocChecklist` (large tappable rows), `StatusTimeline` (vertical, dot per status), `NotificationBell`, `Toast`, `EmptyState`, `Skeleton`, `Field` (labelled input with inline error), `Stepper` (2-step registration with progress).

## Screens
**Landing:** open with an interactive moment, not a stock hero. Headline "Know what you can claim." Under it three large role chips (Student, Farmer, Business owner). Choosing a chip swaps a stack of 3 sample claim slips beside it (static sample data, clearly samples). One primary button: "Check my schemes". Gamosa edge under the hero.

**Dashboard:** left-aligned. A one-line summary at the top: "You qualify for 7 schemes. 2 close this week." (counts only; never show rupee totals unless the scheme benefit amounts are marked verified). Then claim slips in a responsive grid (1 column mobile, 2 tablet, 3 desktop), Closing soon first. Collapsed "Closed schemes" section at the bottom.

**Scheme detail:** two-part layout on desktop (left: summary, why you qualify, AI insight; right: sticky panel with score ring, document checklist, dates, Apply). On mobile a sticky bottom Apply bar.

**Apply:** application sheet as a clean list of label/value rows, each with a Copy button that confirms with a toast "Copied". Primary action: "Open official portal". Secondary: "I have applied".

**Applications:** one card per application with `StatusTimeline`.

## Motion (use very little)
- One orchestrated moment: the first dashboard load right after registration deals the claim slips in once (staggered, 400ms total). Never again in the session.
- Score ring fills once on mount.
- Responses to actions are welcome: checklist tick, copy confirmation, "Mark as applied" checkmark.
- Respect `prefers-reduced-motion`: disable all of the above.

## Copy rules
Plain verbs, sentence case, specific buttons: "Check my schemes", "View and apply", "Copy", "Open official portal", "Mark as applied". Same word for the same action everywhere. Empty states give a next action (for example: "No applications yet. Open a scheme and choose Apply."). Errors say what went wrong and how to fix it, without apologizing.

## Quality floor
Mobile-first and responsive to 360px wide, visible keyboard focus rings (2px `--ink` with offset), labelled form fields, alt text, AA contrast, `lang` attribute set, no layout shift on font load.

## Do not
No gradient washes, no glassmorphism, no emoji as icons, no stock photos, no identical rounded-card grids for non-scheme content, no extra icon libraries (use simple inline SVGs, or `lucide-react` only if the user approves it).
