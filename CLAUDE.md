# Haq Dilao — rules for Claude Code

Read this file at the start of every session and before every build step.

- Docs in `docs/` are the source of truth. Do not add features outside them.
- Follow `docs/build-steps.md` strictly, one step at a time, with acceptance checks and a git commit per step.
- Never invent scheme facts, URLs, selectors, model names, package names or versions. Use `null` or `"TODO_VERIFY"` and log it in `docs/data-verification-checklist.md`.
- Verify packages and CLI flags before use (`npm view`, `--help`, read installed docs).
- Stack is fixed (see `docs/tech-stack.md`). No Supabase, no ORM, no extra UI libraries.
- Windows + PowerShell environment. Cross-platform scripts only.
- Eligibility is decided by deterministic code, NEVER by the LLM.
- The LLM only: summarizes a scheme in simple language, and writes a short personalized insight from facts we pass in. It must not add facts.
- Never store Aadhaar numbers, OTPs or portal passwords. Never auto-submit government forms.
- All UI must follow `docs/design-system.md` (frosted glass + command bar). The ONLY allowed UI/animation library besides Tailwind is Framer Motion; verify the current package name and a React-compatible version with `npm view` (the package may be `motion` or `framer-motion`). No invented colors, fonts or components.
- The command bar (see `docs/command-bar.md`) only filters and explains already-eligible schemes through an intent allowlist; the LLM never returns scheme data.
- Secrets only in `web/.env.local`. Never print them.
- After each step: checkpoint message + update `docs/progress.md` + commit.
- If blocked or unsure: STOP and ask the user.
