import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  awardXP,
  badRequest,
  getAuthUser,
  readJson,
  unauthorized,
} from "@/lib/auth";

function dayBounds(dateStr?: string): { start: Date; end: Date } {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const { searchParams } = new URL(req.url);
  const { start, end } = dayBounds(searchParams.get("date") || undefined);

  const entries = await prisma.waterLog.findMany({
    where: { userId: me.id, loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: "desc" },
  });

  const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);

  return NextResponse.json({
    success: true,
    data: entries,
    totalMl,
    // 35ml per kg body weight is a common guideline; default 70kg → ~2.5L
    targetMl: 2500,
  });
}

export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const amountMl =
    typeof body?.amountMl === "number" && Number.isFinite(body.amountMl)
      ? Math.round(body.amountMl)
      : NaN;

  if (!Number.isFinite(amountMl) || amountMl < 50 || amountMl > 2000) {
    return badRequest("amountMl must be between 50 and 2000");
  }

  const entry = await prisma.waterLog.create({
    data: { userId: me.id, amountMl },
  });

  await awardXP(me.id, 2);

  return NextResponse.json(
    { success: true, message: "Hydration logged", data: entry },
    { status: 201 },
  );
}
