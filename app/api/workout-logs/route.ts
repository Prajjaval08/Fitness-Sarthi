import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  getAuthUser,
  readJson,
  recordWorkoutStreak,
  unauthorized,
} from "@/lib/auth";

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));

  const [logs, total] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId: me.id },
      include: {
        workout: {
          select: { id: true, title: true, category: true, thumbnailUrl: true },
        },
      },
      orderBy: { completedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workoutLog.count({ where: { userId: me.id } }),
  ]);

  return NextResponse.json({
    success: true,
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const workoutId = typeof body?.workoutId === "string" ? body.workoutId : "";
  const durationMins =
    typeof body?.durationMins === "number" && Number.isFinite(body.durationMins)
      ? Math.round(body.durationMins)
      : 0;

  if (!workoutId) return badRequest("workoutId is required");
  if (durationMins <= 0 || durationMins > 600)
    return badRequest("durationMins must be between 1 and 600");

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
  });
  if (!workout) {
    return NextResponse.json(
      { success: false, message: "Workout not found" },
      { status: 404 },
    );
  }

  const caloriesBurned =
    typeof body?.caloriesBurned === "number" && Number.isFinite(body.caloriesBurned)
      ? body.caloriesBurned
      : undefined;
  const notes =
    typeof body?.notes === "string" && body.notes.trim()
      ? body.notes.trim().slice(0, 500)
      : undefined;
  const rating =
    typeof body?.rating === "number" &&
    Number.isInteger(body.rating) &&
    body.rating >= 1 &&
    body.rating <= 5
      ? body.rating
      : undefined;

  const completedAt = new Date();

  const log = await prisma.workoutLog.create({
    data: {
      userId: me.id,
      workoutId,
      durationMins,
      caloriesBurned,
      notes,
      rating,
      completedAt,
    },
    include: {
      workout: {
        select: { id: true, title: true, category: true },
      },
    },
  });

  const streak = await recordWorkoutStreak(me.id, completedAt);

  return NextResponse.json(
    {
      success: true,
      message: "Workout logged. Keep the streak alive!",
      data: {
        log,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          totalXP: streak.totalXP,
        },
      },
    },
    { status: 201 },
  );
}
