# 🏋️ Fitness Saarthi

Your AI-powered fitness companion — personalized workouts, nutrition tracking, streaks, challenges, and a bilingual (Hinglish) AI coach. Built for the Indian fitness journey.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Anthropic Claude · Zustand · Recharts

## ✨ What works

- **Auth** — email/password register & login (bcrypt-hashed), JWT tokens, protected routes
- **Onboarding** — 5-step wizard (goal, body stats, activity level, training style) saved to your profile
- **Workout library** — 6 seeded programs × 14 exercises (with Hindi names), search + category/difficulty filters
- **Active workout sessions** — guided session flow, then one-tap logging
- **Dashboard** — streak, XP & levels, today's nutrition vs targets, 7-day activity chart, AI-picked workout, active challenge
- **Nutrition** — log meals (calories + protein/carbs/fat), daily totals
- **Progress** — workout history, weekly volume & calorie trends
- **Challenges** — join community challenges, track progress, earn XP
- **AI Coach** — streaming Hinglish chat with Claude, personalized from your profile; works in demo mode without an API key
- **AI workout generator** — one tap designs a personalized plan with Claude and saves it to your library
- **Hydration tracking** — log water intake, daily target ring
- **Weight trends** — daily weigh-ins with a progress chart (syncs to your profile for the coach)
- **Leaderboard** — community XP rankings with streaks and levels

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

## 🗄️ Database

Prisma manages the schema (`prisma/schema.prisma`). The initial migration lives in `prisma/migrations/`. Seed data (`prisma/seed.ts`, idempotent) creates 14 exercises, 6 workouts with full exercise plans, and 3 challenges.

```bash
npx prisma migrate dev --name <change>  # local schema change
npx prisma studio                        # visual DB browser
```

## 🔌 API reference

All routes return `{ success, data?, message? }`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | `{name, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | ✓ | Current user + profile + streak |
| GET/PUT | `/api/profile` | ✓ | Onboarding profile (upsert) |
| GET | `/api/workouts?search&category&difficulty` | – | Workout library |
| GET | `/api/workouts/[id]` | – | Workout with ordered exercises |
| GET | `/api/exercises?search&muscleGroup&difficulty` | – | Exercise library |
| GET/POST | `/api/workout-logs` | ✓ | History / log a workout (+50 XP, streak update) |
| GET/POST | `/api/meal-logs?date=` | ✓ | Day's meals + macro totals / log a meal (+10 XP) |
| DELETE | `/api/meal-logs/[id]` | ✓ | Delete a meal |
| GET/POST | `/api/water-logs?date=` | ✓ | Day's water entries + total vs target / log intake (+2 XP) |
| DELETE | `/api/water-logs/[id]` | ✓ | Delete a water entry |
| GET/POST | `/api/weight-logs?days=` | ✓ | Weight history (one entry per day) / log today's weight |
| GET | `/api/leaderboard?limit=` | ✓ | Top users by XP, with your rank |
| GET | `/api/dashboard` | ✓ | Streak, XP/level, today's nutrition, 7-day activity, suggested workout |
| GET/POST | `/api/challenges` | ✓ | List (+joined status) / join |
| POST | `/api/ai/chat` | ✓ | `{message, conversationId?}` → SSE stream (or demo JSON without key) |
| GET | `/api/ai/chat` | ✓ | Conversation list |
| POST | `/api/ai/workout-plan` | ✓ | `{goal?, durationMins?, equipment?}` → Claude-designed workout saved to your library |

## ⚡ Performance notes

- **Database indexes** on every hot query path (`WorkoutLog`, `MealLog`, `WaterLog`, `WeightLog` by user+date; chat tables; challenge participation)
- **Edge caching** — the workout/exercise libraries are reference data and served with `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- **Parallel queries** — the dashboard fires all independent queries in a single `Promise.all` batch (2 round-trips instead of 5+)
- **Singleton Prisma client** via `globalThis` (no connection churn in dev)
- **Streaming AI responses** — the coach streams tokens via SSE so the first word appears fast

## ☁️ Deploy (free tier)

**Database — Neon (PostgreSQL):**
1. Create a project at neon.tech → copy the pooled connection string
2. It becomes your `DATABASE_URL`

**App — Vercel:**
1. Import the GitHub repo at vercel.com
2. Framework preset: Next.js (auto). `vercel.json` already sets the build command:
   `prisma generate && prisma migrate deploy && prisma db seed && next build`
3. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY` (optional), `NEXT_PUBLIC_APP_URL`
4. Deploy. Migrations + seed run automatically on every build (seed is idempotent).

**AI Coach — Anthropic:**
Add your key as `ANTHROPIC_API_KEY`. Without it, the coach answers in demo mode (chat still saves).

## 🧭 Roadmap

- Google OAuth & phone OTP login
- AI-generated workout plans saved to your library
- Progress photos (Cloudinary/S3)
- Social: friends, leaderboards, trainer roles

---

Built with 💪 by Prajjaval — *consistency hi sabse bada mantra hai.*
