🏋️ FITNESS SAARTHI — Full Stack Build 

---
🎯 PROJECT VISION
Build Fitness Saarthi — a production-grade, AI-powered fitness coaching web application tailored for the Indian market. The app should feel like a premium fitness companion — not a generic gym app. Think smooth glassmorphism + soft neumorphism hybrid UI with fluid micro-animations, deep green and obsidian dark palette, and a confident, motivational personality.
---
🧱 TECH STACK
Frontend
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS + custom CSS variables for neumorphism/glassmorphism
Animations: Framer Motion (page transitions, micro-interactions, chart reveals)
State Management: Zustand
Charts: Recharts or Victory Native
Forms: React Hook Form + Zod validation
Icons: Lucide React + custom SVGs
Backend
Runtime: Node.js with Express.js OR Next.js API Routes (choose Next.js API routes for monorepo simplicity)
Language: TypeScript
ORM: Prisma
Queues / Background Jobs: BullMQ + Redis (for email, reminders, AI calls)
File Uploads: AWS S3 or Cloudinary (profile photos, progress images)
Real-time: Socket.io (live workout sessions, trainer chat)
Caching: Redis
Database
Primary DB: PostgreSQL (via Supabase or Railway)
Cache: Redis (via Upstash or Railway)
Schema managed via: Prisma Migrations
Auth
Provider: NextAuth.js v5 (Auth.js)
Strategies:
Email/Password (with bcrypt hashing)
Google OAuth
OTP via Phone (Twilio or MSG91 for Indian numbers)
Session: JWT + HTTP-only cookies
Role-based Access: USER | TRAINER | ADMIN
AI Integration
Model: Anthropic Claude API (claude-sonnet-4-20250514)
Features: AI workout planner, diet suggestions, progress analysis, motivational messages in Hindi/English
DevOps
Containerization: Docker + Docker Compose (local dev)
CI/CD: GitHub Actions
Deployment: Vercel (frontend) + Railway or Render (backend/DB)
Monitoring: Sentry (errors) + PostHog (analytics)
Environment: `.env.local`, `.env.production` with full secret management
---
🎨 UI/UX DESIGN SYSTEM
Aesthetic Direction
Style: Soft Neumorphism + Glassmorphism hybrid on a deep dark background
Primary Palette:
Background: `#0D0D0D` (near-black)
Surface: `#1A1A1A`
Neumorphic Shadow Light: `#2a2a2a`
Neumorphic Shadow Dark: `#0a0a0a`
Accent: `#00E676` (electric green — energy, health)
Secondary Accent: `#FF6B35` (fire orange — intensity, warmth)
Text Primary: `#F5F5F5`
Text Muted: `#888888`
Typography:
Display Font: `Rajdhani` or `Bebas Neue` (bold, athletic)
Body Font: `DM Sans` (clean, readable)
Hindi Support: `Noto Sans Devanagari`
Border Radius: Generous (16px–24px for cards)
Shadows: Deep neumorphic inset + outset on interactive elements
Global CSS Variables
```css
:root {
  --bg: #0D0D0D;
  --surface: #1A1A1A;
  --shadow-light: #2a2a2a;
  --shadow-dark: #080808;
  --accent: #00E676;
  --accent-orange: #FF6B35;
  --text: #F5F5F5;
  --muted: #888888;
  --neu-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light);
  --neu-inset: inset 4px 4px 10px var(--shadow-dark), inset -4px -4px 10px var(--shadow-light);
  --glass: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.08);
}
```
Animations (Framer Motion)
Page entry: fade-up with stagger on cards
Button press: scale(0.96) spring
Stat counters: animated number roll-up on mount
Progress rings: SVG stroke-dashoffset animation
Sidebar: smooth collapse/expand with width transition
Toasts: slide-in from bottom-right
Skeleton loaders: shimmer effect on all data cards
---
📁 FOLDER STRUCTURE
```
fitness-saarthi/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-otp/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + Topbar layout
│   │   ├── dashboard/page.tsx
│   │   ├── workouts/
│   │   │   ├── page.tsx          # Workout library
│   │   │   ├── \[id]/page.tsx     # Individual workout
│   │   │   └── active/page.tsx   # Live workout session
│   │   ├── diet/page.tsx         # Meal planner
│   │   ├── progress/page.tsx     # Progress tracker
│   │   ├── ai-coach/page.tsx     # Claude AI chat
│   │   ├── trainer/page.tsx      # Find a trainer
│   │   ├── challenges/page.tsx   # Community challenges
│   │   └── profile/page.tsx
│   ├── api/
│   │   ├── auth/\[...nextauth]/route.ts
│   │   ├── workouts/route.ts
│   │   ├── diet/route.ts
│   │   ├── progress/route.ts
│   │   ├── ai/chat/route.ts
│   │   ├── users/route.ts
│   │   └── webhooks/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # Reusable design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx              # Neumorphic card wrapper
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── ProgressRing.tsx      # SVG animated ring
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── WorkoutCard.tsx
│   │   ├── ActivityChart.tsx
│   │   └── StreakCalendar.tsx
│   ├── workout/
│   │   ├── ExerciseCard.tsx
│   │   ├── WorkoutTimer.tsx
│   │   ├── RestTimer.tsx
│   │   └── SetLogger.tsx
│   ├── ai/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── SuggestionsBar.tsx
│   └── forms/
│       ├── OnboardingForm.tsx
│       ├── GoalSetterForm.tsx
│       └── MealLogForm.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── redis.ts
│   ├── claude.ts                 # Anthropic API wrapper
│   ├── socket.ts
│   └── validations/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── store/                        # Zustand stores
│   ├── useUserStore.ts
│   ├── useWorkoutStore.ts
│   └── useTimerStore.ts
├── hooks/
│   ├── useWorkoutSession.ts
│   ├── useRealtime.ts
│   └── useAICoach.ts
├── types/
│   └── index.ts
├── public/
├── docker-compose.yml
├── .env.example
└── README.md
```
---
🗃️ DATABASE SCHEMA (Prisma)
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE\_URL")
}

enum Role {
  USER
  TRAINER
  ADMIN
}

enum FitnessGoal {
  WEIGHT\_LOSS
  MUSCLE\_GAIN
  ENDURANCE
  FLEXIBILITY
  MAINTENANCE
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model User {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  phone           String?         @unique
  passwordHash    String?
  avatarUrl       String?
  role            Role            @default(USER)
  isVerified      Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  profile         UserProfile?
  workoutLogs     WorkoutLog\[]
  mealLogs        MealLog\[]
  progressPhotos  ProgressPhoto\[]
  aiConversations AIConversation\[]
  challenges      UserChallenge\[]
  trainerAssigned TrainerClient\[] @relation("ClientRelation")
  trainerOf       TrainerClient\[] @relation("TrainerRelation")
  notifications   Notification\[]
  streak          UserStreak?
}

model UserProfile {
  id              String      @id @default(cuid())
  userId          String      @unique
  user            User        @relation(fields: \[userId], references: \[id], onDelete: Cascade)
  age             Int?
  gender          String?
  heightCm        Float?
  weightKg        Float?
  targetWeightKg  Float?
  fitnessGoal     FitnessGoal?
  activityLevel   String?
  bio             String?
  city            String?
  updatedAt       DateTime    @updatedAt
}

model Exercise {
  id              String          @id @default(cuid())
  name            String
  nameHindi       String?
  description     String?
  muscleGroups    String\[]
  equipment       String\[]
  difficulty      DifficultyLevel
  videoUrl        String?
  thumbnailUrl    String?
  caloriesPerMin  Float?
  createdAt       DateTime        @default(now())

  workoutExercises WorkoutExercise\[]
}

model Workout {
  id              String          @id @default(cuid())
  title           String
  description     String?
  difficulty      DifficultyLevel
  durationMins    Int
  category        String
  thumbnailUrl    String?
  isAIGenerated   Boolean         @default(false)
  createdById     String?
  createdAt       DateTime        @default(now())

  exercises       WorkoutExercise\[]
  logs            WorkoutLog\[]
}

model WorkoutExercise {
  id          String   @id @default(cuid())
  workoutId   String
  exerciseId  String
  sets        Int
  reps        Int?
  durationSec Int?
  restSec     Int
  order       Int

  workout     Workout  @relation(fields: \[workoutId], references: \[id])
  exercise    Exercise @relation(fields: \[exerciseId], references: \[id])
}

model WorkoutLog {
  id              String   @id @default(cuid())
  userId          String
  workoutId       String
  completedAt     DateTime @default(now())
  durationMins    Int
  caloriesBurned  Float?
  notes           String?
  rating          Int?

  user            User     @relation(fields: \[userId], references: \[id])
  workout         Workout  @relation(fields: \[workoutId], references: \[id])
  setLogs         SetLog\[]
}

model SetLog {
  id            String     @id @default(cuid())
  workoutLogId  String
  exerciseId    String
  setNumber     Int
  reps          Int?
  weightKg      Float?
  durationSec   Int?

  workoutLog    WorkoutLog @relation(fields: \[workoutLogId], references: \[id])
}

model MealLog {
  id          String   @id @default(cuid())
  userId      String
  loggedAt    DateTime @default(now())
  mealType    String   // breakfast, lunch, dinner, snack
  foodName    String
  calories    Float
  proteinG    Float?
  carbsG      Float?
  fatG        Float?
  portionG    Float?

  user        User     @relation(fields: \[userId], references: \[id])
}

model ProgressPhoto {
  id          String   @id @default(cuid())
  userId      String
  photoUrl    String
  caption     String?
  takenAt     DateTime @default(now())
  weightKg    Float?

  user        User     @relation(fields: \[userId], references: \[id])
}

model AIConversation {
  id          String      @id @default(cuid())
  userId      String
  title       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User        @relation(fields: \[userId], references: \[id])
  messages    AIMessage\[]
}

model AIMessage {
  id              String         @id @default(cuid())
  conversationId  String
  role            String         // user | assistant
  content         String
  createdAt       DateTime       @default(now())

  conversation    AIConversation @relation(fields: \[conversationId], references: \[id])
}

model Challenge {
  id          String          @id @default(cuid())
  title       String
  description String
  startDate   DateTime
  endDate     DateTime
  goal        String
  rewardXP    Int

  participants UserChallenge\[]
}

model UserChallenge {
  id          String    @id @default(cuid())
  userId      String
  challengeId String
  joinedAt    DateTime  @default(now())
  progress    Float     @default(0)
  completed   Boolean   @default(false)

  user        User      @relation(fields: \[userId], references: \[id])
  challenge   Challenge @relation(fields: \[challengeId], references: \[id])
}

model TrainerClient {
  id          String   @id @default(cuid())
  trainerId   String
  clientId    String
  assignedAt  DateTime @default(now())
  isActive    Boolean  @default(true)

  trainer     User     @relation("TrainerRelation", fields: \[trainerId], references: \[id])
  client      User     @relation("ClientRelation", fields: \[clientId], references: \[id])
}

model UserStreak {
  id            String   @id @default(cuid())
  userId        String   @unique
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastWorkout   DateTime?
  totalXP       Int      @default(0)

  user          User     @relation(fields: \[userId], references: \[id])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: \[userId], references: \[id])
}
```
---
🔐 AUTH IMPLEMENTATION
```typescript
// lib/auth.ts — NextAuth.js v5 config

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: \[
    Google({
      clientId: process.env.GOOGLE\_CLIENT\_ID!,
      clientSecret: process.env.GOOGLE\_CLIENT\_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user?.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        return valid ? user : null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  }
})
```
---
🤖 AI COACH — CLAUDE INTEGRATION
```typescript
// lib/claude.ts

import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC\_API\_KEY! })

export async function getAICoachResponse(
  messages: { role: "user" | "assistant"; content: string }\[],
  userProfile: {
    name: string
    goal: string
    age?: number
    weightKg?: number
    activityLevel?: string
  }
) {
  const systemPrompt = `
You are Fitness Saarthi — a warm, motivating, expert fitness coach for Indian users.
You can speak in Hinglish (mix of Hindi and English) when appropriate.
User profile: ${JSON.stringify(userProfile)}

Your capabilities:
- Design personalized workout plans (consider Indian home equipment, limited gym access)
- Create diet plans with Indian foods (dal, roti, paneer, etc.)
- Track and analyze progress
- Provide motivational support
- Answer fitness \& nutrition science questions
- Suggest modifications for injuries or limitations

Always be encouraging, specific, and practical. Use the user's name. 
Format structured plans with clear sections. Keep responses concise unless detail is needed.
`

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max\_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  return stream
}

export async function generateWorkoutPlan(userProfile: any) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max\_tokens: 2000,
    messages: \[{
      role: "user",
      content: `Generate a complete 4-week workout plan for this user: ${JSON.stringify(userProfile)}. 
      Return as JSON with structure: { weeks: \[{ weekNumber, days: \[{ day, workoutTitle, exercises: \[{ name, sets, reps, rest }] }] }] }`
    }]
  })

  const text = (response.content\[0] as any).text
  return JSON.parse(text.replace(/```json|```/g, "").trim())
}
```
---
🖥️ KEY SCREENS TO BUILD
1. Landing Page (`/`)
Hero: Full-screen with animated gradient mesh background + floating neumorphic cards
CTA: "Apni Fitness Journey Shuru Karo" (Start Your Fitness Journey)
Features section with animated icons
Testimonials carousel
Pricing section
2. Auth Pages (`/login`, `/register`)
Neumorphic card centered layout
Google sign-in button
Phone OTP option
Smooth form transitions with Framer Motion
Validation feedback inline
3. Onboarding Flow (`/onboarding`)
Multi-step wizard (5 steps):
Goal selection (visual cards: weight loss, muscle gain, etc.)
Body metrics (height, weight, age)
Activity level
Equipment available
AI generates initial plan → animated reveal
4. Dashboard (`/dashboard`)
Top Stats Row:
Today's calories (ring chart)
Workout streak (fire icon + count)
Weekly progress (mini bar chart)
XP / Level badge
Main Content:
Today's workout card (highlighted, one-click start)
Nutrition summary (macros: protein/carbs/fat bars)
Recent activity feed
AI Coach quick chat bubble
Upcoming challenges
5. Active Workout (`/workouts/active`)
Full-screen immersive mode
Exercise name + animated demo GIF
Set/Rep logger with haptic-style button feedback
Rest timer with circular countdown
Music controls (Spotify connect or built-in)
Progress bar through workout
Completion celebration (confetti + XP gained)
6. AI Coach (`/ai-coach`)
Chat interface with streaming responses
Suggested prompts (chips): "Mujhe aaj ka workout do", "Diet plan banana hai", "Progress dekho"
Bilingual support toggle (Hindi/English)
Conversation history sidebar
Export plan as PDF button
7. Progress Tracker (`/progress`)
Weight chart (line graph with Recharts)
Body measurements tracker
Progress photo gallery (before/after slider)
Workout frequency heatmap (like GitHub contribution graph)
PR (Personal Records) board
8. Diet Planner (`/diet`)
Daily macro dashboard (protein/carbs/fat rings)
Meal logging with Indian food database search
AI meal suggestions based on goals
Water intake tracker
Weekly calorie chart
---
⚡ REAL-TIME FEATURES (Socket.io)
```typescript
// Implement these real-time events:

// 1. Live workout session sharing (trainer can monitor client)
socket.on("workout:start", (sessionData) => { ... })
socket.on("workout:set-completed", (setData) => { ... })
socket.on("workout:end", (summary) => { ... })

// 2. Trainer chat
socket.on("message:send", (message) => { ... })
socket.on("message:received", (message) => { ... })

// 3. Challenge leaderboard updates
socket.on("challenge:update", (leaderboard) => { ... })

// 4. Notifications
socket.on("notification:new", (notification) => { ... })
```
---
🛡️ MIDDLEWARE & SECURITY
```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard") ||
                      req.nextUrl.pathname.startsWith("/workouts")

  if (isDashboard \&\& !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (isAuthPage \&\& isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: \["/((?!api|\_next/static|\_next/image|favicon.ico).\*)"]
}
```
Security checklist:
Rate limiting on auth endpoints (10 req/min via Redis)
CSRF protection via NextAuth
Input sanitization via Zod on all API routes
SQL injection impossible via Prisma
Helmet.js headers
Image upload validation (type + size limits)
Environment secrets via Vercel env vars (never in code)
---
🐳 DOCKER COMPOSE (Local Dev)
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES\_USER: saarthi
      POSTGRES\_PASSWORD: saarthi123
      POSTGRES\_DB: fitness\_saarthi
    ports:
      - "5432:5432"
    volumes:
      - postgres\_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis\_data:/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE\_URL: postgresql://saarthi:saarthi123@db:5432/fitness\_saarthi
      REDIS\_URL: redis://redis:6379
    depends\_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node\_modules

volumes:
  postgres\_data:
  redis\_data:
```
---
🌍 ENVIRONMENT VARIABLES
```env
# .env.example

# Database
DATABASE\_URL=postgresql://user:password@localhost:5432/fitness\_saarthi

# Redis
REDIS\_URL=redis://localhost:6379

# Auth
NEXTAUTH\_URL=http://localhost:3000
NEXTAUTH\_SECRET=your-super-secret-key-min-32-chars

# OAuth
GOOGLE\_CLIENT\_ID=
GOOGLE\_CLIENT\_SECRET=

# AI
ANTHROPIC\_API\_KEY=

# SMS OTP (Indian numbers)
MSG91\_API\_KEY=
MSG91\_TEMPLATE\_ID=

# Storage
CLOUDINARY\_CLOUD\_NAME=
CLOUDINARY\_API\_KEY=
CLOUDINARY\_API\_SECRET=

# Email
RESEND\_API\_KEY=

# App
NEXT\_PUBLIC\_APP\_URL=http://localhost:3000
NEXT\_PUBLIC\_SOCKET\_URL=http://localhost:3001
```
---
🚀 PERFORMANCE REQUIREMENTS
Lighthouse score: 90+ on all metrics
API response time: < 200ms for CRUD, < 2s for AI
Concurrent users: Handle 1000+ via:
Redis caching for frequent reads (user profiles, workout library)
Database connection pooling (PgBouncer or Prisma Accelerate)
CDN for static assets (Vercel Edge Network)
Lazy loading for heavy components
Optimistic UI updates for all mutations
Streaming for AI responses (never block)
Images: Next.js Image component with WebP conversion
Bundle: Code splitting per route, dynamic imports for charts
---
📱 MOBILE RESPONSIVENESS
All screens must be fully responsive:
Sidebar collapses to bottom tab bar on mobile
Workout cards stack vertically
Charts resize with container queries
Touch-friendly tap targets (min 44px)
PWA support: `next-pwa` with offline workout logs
---
🎮 GAMIFICATION SYSTEM
```typescript
// XP System
const XP\_REWARDS = {
  WORKOUT\_COMPLETE: 50,
  STREAK\_7\_DAYS: 100,
  STREAK\_30\_DAYS: 500,
  MEAL\_LOGGED: 10,
  CHALLENGE\_COMPLETE: 200,
  PERSONAL\_RECORD: 75,
}

// Levels
const LEVELS = \[
  { level: 1, name: "Beginner", minXP: 0 },
  { level: 2, name: "Hustler", minXP: 200 },
  { level: 3, name: "Warrior", minXP: 600 },
  { level: 4, name: "Champion", minXP: 1500 },
  { level: 5, name: "Legend", minXP: 3000 },
]

// Badges
const BADGES = \[
  "First Workout", "7-Day Streak", "30-Day Streak",
  "100 Workouts", "Weight Goal Achieved", "AI Plan Master"
]
```
---
📋 IMPLEMENTATION ORDER
Build in this sequence for fastest working product:
Setup: Next.js + TypeScript + Tailwind + Prisma + Docker
DB: Run migrations, seed exercise library (50+ exercises)
Auth: NextAuth with email/password + Google OAuth
Design System: Button, Card, Input, Modal, ProgressRing components
Dashboard Layout: Sidebar + Topbar + responsive shell
Workout Module: Library → Detail → Active Session → Log
Diet Module: Meal logger + macro tracking
AI Coach: Streaming chat with Claude API
Progress Tracker: Charts + photos + streaks
Gamification: XP + levels + badges + challenges
Real-time: Socket.io for trainer features
Notifications: In-app + email via Resend
PWA: Offline support + install prompt
Polish: Animations, loading states, error boundaries
Deploy: Vercel + Railway + monitoring
---
✅ ACCEPTANCE CRITERIA
[ ] User can register, verify phone OTP, and login with Google
[ ] Onboarding generates an AI-powered first workout plan
[ ] User can browse, filter, and start any workout
[ ] Active workout session tracks sets, reps, rest timer
[ ] Workout completion awards XP and updates streak
[ ] User can log meals and track daily macros
[ ] AI Coach responds in streaming with bilingual support
[ ] Progress page shows weight trend + photo gallery
[ ] Dashboard loads in < 2s with skeleton states
[ ] All pages are mobile responsive
[ ] 1000 concurrent users handled without degradation
[ ] All API routes are authenticated and rate-limited
---
Built for Cursor / Codex — Start with `npx create-next-app@latest fitness-saarthi --typescript --tailwind --app` then implement section by section.
