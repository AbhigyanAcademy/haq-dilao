# Tech stack (free, lightweight, fixed)

| Need | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Create with `npx create-next-app@latest`; run `--help` first to confirm flags |
| Styling | Tailwind CSS | Comes with create-next-app. No component library |
| Storage | JSON files in `web/data/` via `lib/store.ts` | No Supabase, no ORM |
| Auth | Email + password. `bcryptjs` for hashing, `jose` for signed JWT in an httpOnly cookie | Verify both packages with `npm view` |
| Admin auth | Single password from `ADMIN_PASSWORD` env, separate cookie | Demo-grade |
| LLM primary | NVIDIA API (OpenAI-compatible chat completions), plain `fetch` | Base URL env: `NVIDIA_BASE_URL` (expected `https://integrate.api.nvidia.com/v1`; confirm in official docs). Model id env: `NVIDIA_MODEL` — DO NOT guess; ask the user to paste the exact id from build.nvidia.com |
| LLM fallback (optional) | Google AI Studio (Gemini) REST via `fetch`; skipped if the keys are blank | Keys: `GEMINI_API_KEY`, `GEMINI_MODEL` (user supplies). Confirm endpoint against official docs |
| Final fallback | `summary_fallback` text stored in each scheme | Demo works with no internet |
| Notifications | In-app bell + list (stored in JSON) | Email is a stretch goal only |
| Tests | One script: `npx tsx scripts/test-engine.ts` with `node:assert` | No test framework |
| Extension | Chrome Manifest V3, plain JS, no build step | Load unpacked |
| Design | Fixed in `docs/design-system.md` | Tailwind + CSS variables, Instrument Serif + Figtree via `next/font/google` |
| Animation | Framer Motion only (layout transition for the command bar, card entrances, drawer) | Verify package name and React compatibility with `npm view`; mesh and pulse effects use plain CSS |
| Hosting | Run locally for the demo (`npm run dev` or `npm run build && npm start`) | Vercel optional, see architecture notes |

## Env file `web/.env.local` (create with blanks, user fills)
```
NVIDIA_API_KEY=
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
SESSION_SECRET=      # generate a random 32+ char string with node
ADMIN_PASSWORD=
```
Also create `web/.env.example` with the same keys and no values.

## Forbidden
Supabase, Prisma/ORMs, Redux/Zustand, UI kits (MUI, shadcn, etc.), any animation library other than Framer Motion, Docker, any paid service, any scraping of government sites.
