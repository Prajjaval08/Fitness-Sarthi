import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  getAuthUser,
  readJson,
  unauthorized,
} from "@/lib/auth";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Weight history for the trend chart (oldest → newest).
 * `?days=30` controls the window (max 365).
 */
export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const { searchParams } = new URL(req.url);
  const days = Math.min(
    365,
    Math.max(1, Number(searchParams.get("days")) || 30),
  );

  const since = new Date();
  since.setDate(since.getDate() - days);

  const entries = await prisma.weightLog.findMany({
    where: { userId: me.id, loggedAt: { gte: since } },
    orderBy: { loggedAt: "asc" },
    select: { id: true, weightKg: true, loggedAt: true },
  });

  return NextResponse.json({ success: true, data: entries });
}

/**
 * Log today's weight. One entry per day — re-logging updates it.
 */
export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const weightKg =
    typeof body?.weightKg === "number" && Number.isFinite(body.weightKg)
      ? body.weightKg
      : NaN;

  if (!Number.isFinite(weightKg) || weightKg < 25 || weightKg > 350) {
    return badRequest("weightKg must be between 25 and 350");
  }

  const dayStart = startOfDay(new Date());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existing = await prisma.weightLog.findFirst({
    where: { userId: me.id, loggedAt: { gte: dayStart, lt: dayEnd } },
  });

  const entry = existing
    ? await prisma.weightLog.update({
        where: { id: existing.id },
        data: { weightKg },
      })
    : await prisma.weightLog.create({
        data: { userId: me.id, weightKg },
      });

  // Keep the profile's current weight in sync for the AI coach.
  await prisma.userProfile.upsert({
    where: { userId: me.id },
    update: { weightKg },
    create: { userId: me.id, weightKg },
  });

  return NextResponse.json(
    { success: true, message: "Weight logged", data: entry },
    { status: 201 },
  );
}
