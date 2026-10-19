import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  awardXP,
  badRequest,
  getAuthUser,
  readJson,
  unauthorized,
} from "@/lib/auth";

const VALID_MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

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
  const dateParam = searchParams.get("date") || undefined;
  const { start, end } = dayBounds(dateParam);

  const meals = await prisma.mealLog.findMany({
    where: {
      userId: me.id,
      loggedAt: { gte: start, lt: end },
    },
    orderBy: { loggedAt: "desc" },
  });

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + (m.proteinG ?? 0),
      carbsG: acc.carbsG + (m.carbsG ?? 0),
      fatG: acc.fatG + (m.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  return NextResponse.json({ success: true, data: meals, totals });
}

export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const mealType =
    typeof body?.mealType === "string" ? body.mealType.toUpperCase() : "";
  const foodName =
    typeof body?.foodName === "string" ? body.foodName.trim() : "";
  const calories =
    typeof body?.calories === "number" && Number.isFinite(body.calories)
      ? body.calories
      : NaN;

  if (!(VALID_MEAL_TYPES as readonly string[]).includes(mealType)) {
    return badRequest("mealType must be BREAKFAST, LUNCH, DINNER or SNACK");
  }
  if (!foodName) return badRequest("foodName is required");
  if (!Number.isFinite(calories) || calories < 0 || calories > 5000) {
    return badRequest("calories must be between 0 and 5000");
  }

  const num = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined;

  const meal = await prisma.mealLog.create({
    data: {
      userId: me.id,
      mealType,
      foodName: foodName.slice(0, 200),
      calories,
      proteinG: num(body?.proteinG),
      carbsG: num(body?.carbsG),
      fatG: num(body?.fatG),
      portionG: num(body?.portionG),
    },
  });

  // Small reward for tracking nutrition consistently.
  await awardXP(me.id, 10);

  return NextResponse.json(
    { success: true, message: "Meal logged", data: meal },
    { status: 201 },
  );
}
