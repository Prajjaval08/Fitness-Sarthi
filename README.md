# 🏋️ Fitness Saarthi

Your AI-powered fitness companion — personalized workouts, nutrition tracking, streaks, challenges, and a bilingual (Hinglish) AI coach. Built for the Indian fitness journey.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Anthropic Claude · Zustand · Recharts

---

## 📑 Contents

- [✨ Features](#-features)
- [🧱 Tech stack](#-tech-stack)
- [🎨 Design system](#-design-system)
- [🗂️ Project structure](#️-project-structure)
- [🚀 Run locally](#-run-locally)
- [🔑 Environment variables](#-environment-variables)
- [🗄️ Database](#️-database)
- [🔌 API reference](#-api-reference)
- [🔐 Auth flow](#-auth-flow)
- [🎮 Gamification](#-gamification)
- [⚡ Performance notes](#-performance-notes)
- [☁️ Deploy (free tier)](#️-deploy-free-tier)
- [🧭 Roadmap](#-roadmap)

---

## ✨ Features

**Training**
- **Workout library** — 6 seeded programs × 14 exercises (with Hindi names), search + category/difficulty filters
- **Active workout sessions** — guided session flow with sets, reps, rest timers, then one-tap logging
- **AI workout generator** — one tap designs a personalized plan with Claude (goal, duration, equipment) and saves it to your library

**Nutrition & body**
- **Meal logging** — calories + protein/carbs/fat per meal, daily totals vs targets
- **Hydration tracking** — quick-add water intake with a daily target ring
- **Weight trends** — daily weigh-ins with a progress chart (syncs to your profile so the coach stays informed)

**Motivation**
- **Dashboard** — streak, XP & levels, today's nutrition, 7-day activity chart, AI-picked workout, active challenge
- **Challenges** — join community challenges, track progress, earn XP
- **Leaderboard** — community XP rankings with streaks and levels
- **Progress** — workout history, weekly volume & calorie trends, weight chart

**AI Coach**
- **Streaming Hinglish chat** with Claude, personalized from your profile (goal, weight, activity level)
- Works in **demo mode** without an API key (chat still saves); live streaming kicks in when `ANTHROPIC_API_KEY` is set

**Accounts**
- **Auth** — email/password register & login (bcrypt-hashed), JWT tokens, protected routes
- **Onboarding** — 5-step wizard (goal, body stats, activity level, training style) saved to your profile

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS + custom CSS variables (glassmorphism / neumorphism) |
| Animations | Framer Motion |
| State | Zustand (workout session) + React context (auth) |
| Charts | Recharts |
| Database | PostgreSQL (Neon in prod) via Prisma 6 |
| Auth | Custom JWT (Bearer) + bcryptjs, `httpOnly`-style client storage in `localStorage` |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`), SSE streaming |
| Deploy | Vercel (app) + Neon (DB), `vercel.json` build pipeline |

---

## 🎨 Design system

Deep obsidian + electric green, built for motivation:

- Background `#0D0D0D` · Surface `#1A1A1A` · Accent `#00E676` (energy) / `#FF6B35` (intensity)
- Glass + soft-neumorphic cards, generous 16–24px radii, deep shadows
- Display font for headings, clean sans for body, Devanagari support for Hindi
- Shared primitives in `components/ui.tsx`: `Card`, `Button`, `Badge`, `ProgressRing`, `SectionTitle`

---

## 🗂️ Project structure

```
app/
  page.tsx              # landing
  login/ register/      # auth forms
  onboarding/           # 5-step profile wizard
  dashboard/            # streak, XP, nutrition, activity, AI generator modal
  workouts/             # library (+ /active guided session)
  diet/                 # meals + hydration
  progress/            # history, charts, weight trend
  challenges/           # challenges + leaderboard
  ai-coach/             # streaming chat
  api/                  # 17 REST routes (see API reference)
components/             # ui.tsx primitives, app-shell, charts
lib/                    # prisma client, auth (JWT), api fetch wrapper, auth context
prisma/
  schema.prisma         # 15 models
  migrations/           # hand-written, deploy-safe SQL
  seed.ts               # idempotent: 14 exercises, 6 workouts, 3 challenges
store/                  # zustand workout session
```

---

## 🚀 Run locally

```bash
# 1. Start Postgres (Docker)
docker compose up -d

# 2. Configure
cp .env.example .env
# edit .env → DATABASE_URL, JWT_SECRET

# 3. Install, migrate, seed, run
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open http://localhost:3000 → Register → Onboarding → Dashboard.

---

## 🔑 Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Long random string for signing tokens (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ANTHROPIC_API_KEY` | – | Enables live AI coach + workout generator (demo mode without it) |
| `NEXT_PUBLIC_APP_URL` | – | Public app URL (metadata/links) |

---

## 🗄️ Database

Prisma manages the schema (`prisma/schema.prisma`, 15 models). Migrations are committed SQL in `prisma/migrations/` — `migrate deploy` is safe to run on every deploy. Seed (`prisma/seed.ts`) is idempotent: 14 exercises, 6 workouts with full exercise plans, 3 challenges.

```bash
npx prisma migrate dev --name <change>  # local schema change
npx prisma studio                        # visual DB browser
```

---

## 🔌 API reference

All routes return `{ success, data?, message? }`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | `{name, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | ✓ | Current user + profile + streak |
| GET / PUT | `/api/profile` | ✓ | Onboarding profile (upsert) |
| GET | `/api/workouts?search&category&difficulty` | – | Workout library (edge-cached) |
| GET | `/api/workouts/[id]` | – | Workout with ordered exercises |
| GET | `/api/exercises?search&muscleGroup&difficulty` | – | Exercise library (edge-cached) |
| GET / POST | `/api/workout-logs` | ✓ | History / log a workout (+50 XP, streak update) |
| GET / POST | `/api/meal-logs?date=` | ✓ | Day's meals + macro totals / log a meal (+10 XP) |
| DELETE | `/api/meal-logs/[id]` | ✓ | Delete a meal |
| GET / POST | `/api/water-logs?date=` | ✓ | Day's water entries + total vs target / log intake (+2 XP) |
| DELETE | `/api/water-logs/[id]` | ✓ | Delete a water entry |
| GET / POST | `/api/weight-logs?days=` | ✓ | Weight history (one entry per day) / log today's weight |
| GET | `/api/leaderboard?limit=` | ✓ | Top users by XP, with your rank |
| GET | `/api/dashboard` | ✓ | Streak, XP/level, today's nutrition, 7-day activity, suggested workout |
| GET / POST | `/api/challenges` | ✓ | List (+joined status) / join |
| POST | `/api/ai/chat` | ✓ | `{message, conversationId?}` → SSE stream (or demo JSON without key) |
| GET | `/api/ai/chat` | ✓ | Conversation list |
| POST | `/api/ai/workout-plan` | ✓ | `{goal?, durationMins?, equipment?}` → Claude-designed workout saved to your library |

---

## 🔐 Auth flow

1. `POST /api/auth/register` or `/api/auth/login` → `{ token, user }` (passwords hashed with bcrypt, 12 rounds)
2. Client stores the JWT in `localStorage` (`fitness-saarthi-token`) and sends `Authorization: Bearer <token>`
3. `lib/auth-context.tsx` restores the session on load via `GET /api/auth/me`; any 401 clears storage and redirects to `/login`

---

## 🎮 Gamification

- **XP** — +50 per logged workout, +10 per meal, +2 per water log
- **Levels** — every 300 XP: Starter → Hustler → Warrior → Champion → Legend → Icon
- **Streaks** — consecutive workout days (same-day logs don't double-count, a missed day resets)
- **Challenges & leaderboard** — join challenges for bonus XP, climb the community board

---

## ⚡ Performance notes

- **Database indexes** on every hot query path (`WorkoutLog`, `MealLog`, `WaterLog`, `WeightLog` by user+date; chat tables; challenge participation)
- **Edge caching** — the workout/exercise libraries are reference data: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- **Parallel queries** — the dashboard fires all independent queries in a single `Promise.all` batch (2 round-trips instead of 5+)
- **Singleton Prisma client** via `globalThis` (no connection churn)
- **Streaming AI responses** — the coach streams tokens via SSE so the first word appears fast

---

## ☁️ Deploy (free tier)

**Database — Neon (PostgreSQL):**
1. Create a project at [neon.tech](https://neon.tech) → copy the **pooled** connection string
2. It becomes your `DATABASE_URL`

**App — Vercel:**
1. Import the GitHub repo at [vercel.com](https://vercel.com)
2. Framework preset: Next.js (auto). `vercel.json` already sets the build command:
   `prisma generate && prisma migrate deploy && prisma db seed && next build`
3. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY` (optional), `NEXT_PUBLIC_APP_URL`
4. Deploy. Migrations + seed run automatically on every build (seed is idempotent).

**AI Coach — Anthropic:**
Add your key as `ANTHROPIC_API_KEY`. Without it, the coach answers in demo mode (chat still saves).

---

## 🧭 Roadmap

- Google OAuth & phone OTP login
- Trainer roles & custom client plans
- Progress photos (Cloudinary/S3)
- Social: friends, workout sharing, comments
- Wearable sync (Google Fit / Health Connect)

---

Built with 💪 by Prajjaval — *consistency hi sabse bada mantra hai.*
