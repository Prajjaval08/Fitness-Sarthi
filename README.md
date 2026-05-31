# Fitness Saarthi

Premium AI-powered fitness companion for Indian users. This repository includes a polished Next.js product experience, responsive dashboard modules, interactive workout flow, Claude-ready API scaffolding, Prisma schema, and local Docker services.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:3000`. The UI works with built-in demo data. To enable live persistence and AI responses, start `docker compose up -d`, run `npx prisma generate`, and add the required credentials to `.env`.

## Routes

- `/` landing page
- `/login`, `/register`, `/onboarding`
- `/dashboard`, `/workouts`, `/workouts/active`
- `/diet`, `/progress`, `/ai-coach`, `/challenges`
