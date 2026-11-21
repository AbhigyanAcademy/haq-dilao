# Haq Dilao — Know What You Can Claim

A web application that helps citizens in Assam/North East India discover and apply for government schemes they're actually eligible for. Register once, see only your eligible schemes, prepare applications, track them, and get notified of new schemes and deadlines.

## 🚀 Live Demo

**Production URL:** https://web-ecru-five-25.vercel.app

**GitHub Repository:** https://github.com/AbhigyanAcademy/haq-dilao

---

## 🎯 Demo Credentials

Use these pre-seeded accounts to test the application immediately:

| Role | Email | Password |
|------|-------|----------|
| **Farmer** | `farmer@demo.com` | `Demo@1234` |
| **Student** | `student@demo.com` | `Demo@1234` |
| **Business Owner** | `business@demo.com` | `Demo@1234` |
| **Admin** | `/admin` → `yourpassword` | |

---

## ✨ Features

### For Citizens
- **Two-step registration** — Common fields first, then role-specific details
- **Personalized dashboard** — Shows ONLY schemes you're eligible for (deterministic eligibility engine)
- **Smart scheme cards** — AI-generated summaries, why-you-qualify, document checklist, apply score
- **Apply sheet** — Pre-filled answers from your profile, copy buttons, direct link to official portal
- **Application tracker** — Status timeline with demo "simulate update" button
- **Notifications** — Bell icon with unread count, dropdown for new schemes, deadline reminders, status changes

### For Admins
- **Secure login** — Password-protected admin panel
- **Add schemes** — Form with validation, JSON rules editor, quick-fill demo button
- **Scheme management** — List all schemes with role badges, verification status
- **Automatic notifications** — New scheme alerts sent to eligible users instantly

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Tailwind CSS + Custom CSS Variables (frosted glass design) |
| **Auth** | JWT (jose) + bcryptjs, httpOnly cookies |
| **Database** | JSON files (local) + In-memory fallback (Vercel serverless) |
| **AI** | NVIDIA Nemotron → Groq Qwen → Static fallback |
| **Deployment** | Vercel (serverless) |

---

## 🎨 Design System

- **Colors**: Obsidian base, indigo/cyan/emerald mesh orbs, eligible green, warning amber, urgent red
- **Typography**: Instrument Serif (display), Figtree (UI), Noto Sans Bengali/Devanagari fallbacks
- **Components**: Glass cards, score rings, badges, command bar, notification bell, status timeline
- **Motion**: CSS animations (mesh, pulse), Framer Motion (command bar glide, card entrances)

---

## 📦 Project Structure

```
haq-dilao/
├── web/                    # Next.js application
│   ├── app/
│   │   ├── api/           # API routes (auth, schemes, admin, notifications)
│   │   ├── dashboard/     # Citizen dashboard with command bar
│   │   ├── schemes/       # Scheme detail & apply pages
│   │   ├── applications/  # Application tracker
│   │   ├── admin/         # Admin panel
│   │   ├── register/      # Two-step registration
│   │   └── login/         # Login page
│   ├── lib/
│   │   ├── auth.ts        # JWT, bcrypt, session management
│   │   ├── store.ts       # JSON file store (with Vercel in-memory fallback)
│   │   ├── eligibility.ts # Deterministic eligibility engine
│   │   ├── intents.ts     # Command bar intent parser
│   │   ├── llm.ts         # NVIDIA → Groq → static fallback
│   │   └── dates.ts       # Asia/Kolkata date logic
│   └── data/              # JSON files (schemes, users, etc.)
├── docs/                  # Project documentation
└── README.md
```

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/AbhigyanAcademy/haq-dilao.git
cd haq-dilao/web

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open http://localhost:3000

---

## 🔧 Environment Variables

Create `.env.local` in `web/` with:

```env
NVIDIA_API_KEY=your_nvidia_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3.5-super-vl-120b-a12b
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.8-flash
GROQ_API_KEY=your_groq_key
GROQ_MODEL=qwen/qwen3.8-27b
SESSION_SECRET=your_32_char_random_string
ADMIN_PASSWORD=your_admin_password
```

---

## 📋 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run seed         # Seed demo users & schemes
npm run warm-cache   # Pre-generate AI summaries
npm run test-engine  # Run eligibility tests
npm run test-intents # Run command bar intent tests
```

---

## 🧪 Testing

```bash
# Eligibility engine (31 tests)
npm run test-engine

# Command bar intents (25 tests)
npm run test-intents

# Full E2E API test
curl -X POST https://web-ecru-five-25.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@demo.com","password":"Demo@1234"}'
```

---

## 🌐 Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Set Root Directory to `web`
3. Add Environment Variables in Vercel Dashboard
4. Deploy

### Other Platforms
- **Docker**: `Dockerfile` included
- **Fly.io**: `fly.toml` included
- **Render**: `render.yaml` included

---

## 📄 License

MIT License — Feel free to use for hackathons, learning, or production.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AbhigyanAcademy/haq-dilao/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AbhigyanAcademy/haq-dilao/discussions)

---

## 🙏 Acknowledgments

- Built for **Hack2Skill "PromptWars x Code1 Innovators"** (PS07: SchemeFinder)
- Government scheme data from official sources (myscheme.gov.in, pmkisan.gov.in, scholarships.gov.in, etc.)
- UI inspired by frosted glass design trends

---

**Built with ❤️ for citizens of Assam & North East India**