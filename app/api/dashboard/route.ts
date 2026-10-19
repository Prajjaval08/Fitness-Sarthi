import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureStreak, getAuthUser, levelForXP, unauthorized } from "@/lib/auth";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Map a fitness goal to the workout category that serves it best.
const GOAL_CATEGORY: Record<string, string> = {
  WEIGHT_LOSS: "Cardio",
  MUSCLE_GAIN: "Strength",
  ENDURANCE: "Cardio",
  FLEXIBILITY: "Recovery",
  MAINTENANCE: "Strength",
};

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const streak = await ensureStreak(me.id);
  const todayStart = startOfDay(new Date());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  // Last 7 days of activity for the weekly chart.
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  // Batch 1: the user row is needed to pick a goal-matched workout.
  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: { name: true, profile: true },
  });

  const preferredCategory = user?.profile?.fitnessGoal
    ? GOAL_CATEGORY[user.profile.fitnessGoal]
    : undefined;

  // Batch 2: everything else is independent — one round-trip instead of
  // five sequential queries.
  const [
    todayMeals,
    todayLogs,
    weekLogs,
    activeChallenge,
    preferredWorkout,
    fallbackWorkout,
  ] = await Promise.all([
    prisma.mealLog.findMany({
      where: {
        userId: me.id,
        loggedAt: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    prisma.workoutLog.findMany({
      where: {
        userId: me.id,
        completedAt: { gte: todayStart, lt: tomorrowStart },
      },
      include: {
        workout: { select: { id: true, title: true, category: true } },
      },
    }),
    prisma.workoutLog.findMany({
      where: { userId: me.id, completedAt: { gte: weekStart } },
      select: { completedAt: true, caloriesBurned: true, durationMins: true },
    }),
    prisma.userChallenge.findFirst({
      where: { userId: me.id, completed: false },
      include: { challenge: true },
      orderBy: { joinedAt: "desc" },
    }),
    preferredCategory
      ? prisma.workout.findFirst({
          where: { category: preferredCategory },
          include: { _count: { select: { exercises: true } } },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve(null),
    prisma.workout.findFirst({
      include: { _count: { select: { exercises: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const suggestedWorkout = preferredWorkout ?? fallbackWorkout;

  const nutrition = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + (m.proteinG ?? 0),
      carbsG: acc.carbsG + (m.carbsG ?? 0),
      fatG: acc.fatG + (m.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  const caloriesBurned = todayLogs.reduce(
    (sum, l) => sum + (l.caloriesBurned ?? 0),
    0,
  );

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86_400_000;
    const logs = weekLogs.filter((l) => {
      const t = l.completedAt.getTime();
      return t >= dayStart && t < dayEnd;
    });
    return {
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      workouts: logs.length,
      caloriesBurned: Math.round(
        logs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0),
      ),
      minutes: logs.reduce((s, l) => s + l.durationMins, 0),
    };
  });

  const level = levelForXP(streak.totalXP);

  return NextResponse.json({
    success: true,
    data: {
      user: { name: user?.name, goal: user?.profile?.fitnessGoal ?? null },
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        totalXP: streak.totalXP,
        level: level.level,
        levelName: level.name,
        xpForNext: level.xpForNext,
        xpProgress: level.xpProgress,
      },
      today: {
        nutrition,
        caloriesBurned: Math.round(caloriesBurned),
        workoutsCompleted: todayLogs.length,
        workouts: todayLogs.map((l) => l.workout),
      },
      weeklyActivity,
      activeChallenge: activeChallenge
        ? {
            id: activeChallenge.challenge.id,
            title: activeChallenge.challenge.title,
            description: activeChallenge.challenge.description,
            goal: activeChallenge.challenge.goal,
            progress: activeChallenge.progress,
            endDate: activeChallenge.challenge.endDate,
          }
        : null,
      suggestedWorkout: suggestedWorkout
        ? {
            id: suggestedWorkout.id,
            title: suggestedWorkout.title,
            description: suggestedWorkout.description,
            category: suggestedWorkout.category,
            difficulty: suggestedWorkout.difficulty,
            durationMins: suggestedWorkout.durationMins,
            thumbnailUrl: suggestedWorkout.thumbnailUrl,
            exerciseCount: suggestedWorkout._count.exercises,
          }
        : null,
    },
  });
}
