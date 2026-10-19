import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { badRequest, getAuthUser, readJson, unauthorized } from "@/lib/auth";

const VALID_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
type Difficulty = (typeof VALID_DIFFICULTIES)[number];

interface PlannedExercise {
  name: string;
  sets: number;
  reps?: number | null;
  durationSec?: number | null;
  restSec: number;
}

interface WorkoutPlan {
  title: string;
  description: string;
  difficulty: Difficulty;
  durationMins: number;
  category: string;
  exercises: PlannedExercise[];
}

function extractJson(text: string): string {
  // Claude sometimes wraps JSON in ```json fences — strip them.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

function isValidPlan(p: unknown): p is WorkoutPlan {
  if (typeof p !== "object" || p === null) return false;
  const plan = p as Record<string, unknown>;
  return (
    typeof plan.title === "string" &&
    typeof plan.description === "string" &&
    typeof plan.category === "string" &&
    typeof plan.durationMins === "number" &&
    (VALID_DIFFICULTIES as readonly string[]).includes(
      plan.difficulty as string,
    ) &&
    Array.isArray(plan.exercises) &&
    plan.exercises.length >= 3 &&
    plan.exercises.every((e) => {
      const ex = e as Record<string, unknown>;
      return (
        typeof ex.name === "string" &&
        typeof ex.sets === "number" &&
        typeof ex.restSec === "number"
      );
    })
  );
}

/**
 * Generates a personalized workout with Claude and saves it to the
 * user's library as an AI-generated workout.
 */
export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        message:
          "AI workout generation needs an ANTHROPIC_API_KEY. Ask your coach in the AI Coach tab instead!",
      },
      { status: 400 },
    );
  }

  const body = await readJson(req);
  const profile = await prisma.userProfile.findUnique({
    where: { userId: me.id },
  });

  const goal =
    typeof body?.goal === "string" && body.goal.trim()
      ? body.goal.trim().slice(0, 120)
      : (profile?.fitnessGoal ?? "general fitness").toString();
  const durationMins =
    typeof body?.durationMins === "number" &&
    Number.isFinite(body.durationMins)
      ? Math.min(120, Math.max(10, Math.round(body.durationMins)))
      : 40;
  const equipment =
    typeof body?.equipment === "string" && body.equipment.trim()
      ? body.equipment.trim().slice(0, 120)
      : "bodyweight and dumbbells";

  const available = await prisma.exercise.findMany({
    select: { id: true, name: true },
  });
  const exerciseNames = available.map((e) => e.name).join(", ");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let plan: WorkoutPlan;
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are a certified strength & conditioning coach designing workouts for Indian users at home or in the gym. Respond with ONLY valid JSON — no markdown, no commentary. Use this exact shape:
{"title": string, "description": string (one motivating line), "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED", "durationMins": number, "category": string (e.g. "Strength", "Cardio", "Core", "Recovery"), "exercises": [{"name": string (MUST be one of the available exercises below), "sets": number, "reps": number | null (use null for timed moves), "durationSec": number | null (use null for rep-based moves), "restSec": number}]}
Available exercises: ${exerciseNames}`,
      messages: [
        {
          role: "user",
          content: `Design a ${durationMins}-minute workout. Goal: ${goal}. Equipment available: ${equipment}. Fitness level: ${profile?.activityLevel ?? "moderate"}. Include 5-8 exercises with sensible sets/reps/rest.`,
        },
      ],
    });

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    const parsed: unknown = JSON.parse(extractJson(text));
    if (!isValidPlan(parsed)) throw new Error("Invalid plan shape");
    plan = parsed;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The AI coach couldn't design a plan right now. Try again!",
      },
      { status: 502 },
    );
  }

  // Match planned exercises to the library (case-insensitive).
  const byName = new Map(available.map((e) => [e.name.toLowerCase(), e.id]));
  const matched = plan.exercises
    .map((ex, i) => {
      const id = byName.get(ex.name.toLowerCase());
      return id
        ? {
            exerciseId: id,
            sets: Math.min(10, Math.max(1, Math.round(ex.sets))),
            reps:
              typeof ex.reps === "number"
                ? Math.min(100, Math.max(1, Math.round(ex.reps)))
                : null,
            durationSec:
              typeof ex.durationSec === "number"
                ? Math.min(600, Math.max(10, Math.round(ex.durationSec)))
                : null,
            restSec: Math.min(300, Math.max(10, Math.round(ex.restSec))),
            order: i + 1,
          }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (matched.length < 3) {
    return NextResponse.json(
      {
        success: false,
        message: "The AI plan didn't match our exercise library. Try again!",
      },
      { status: 502 },
    );
  }

  const workout = await prisma.workout.create({
    data: {
      title: plan.title.slice(0, 120),
      description: plan.description.slice(0, 500),
      difficulty: plan.difficulty,
      durationMins: Math.min(180, Math.max(5, Math.round(plan.durationMins))),
      category: plan.category.slice(0, 60),
      isAIGenerated: true,
      exercises: { create: matched },
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: `"${workout.title}" is ready. Let's go!`,
      data: workout,
    },
    { status: 201 },
  );
}
