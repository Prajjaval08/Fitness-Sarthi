import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { badRequest, getAuthUser, readJson, unauthorized } from "@/lib/auth";

const VALID_GOALS = [
  "WEIGHT_LOSS",
  "MUSCLE_GAIN",
  "ENDURANCE",
  "FLEXIBILITY",
  "MAINTENANCE",
] as const;

type FitnessGoal = (typeof VALID_GOALS)[number];

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: me.id },
  });

  return NextResponse.json({ success: true, data: profile });
}

export async function PUT(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  if (!body) return badRequest("Invalid request body");

  const num = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) ? v : undefined;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;

  let fitnessGoal: FitnessGoal | undefined;
  if (body.fitnessGoal !== undefined) {
    if (
      typeof body.fitnessGoal !== "string" ||
      !(VALID_GOALS as readonly string[]).includes(body.fitnessGoal)
    ) {
      return badRequest("Invalid fitness goal");
    }
    fitnessGoal = body.fitnessGoal as FitnessGoal;
  }

  const age = num(body.age);
  if (body.age !== undefined && (age === undefined || age < 10 || age > 120)) {
    return badRequest("Age must be between 10 and 120");
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: me.id },
    update: {
      ...(age !== undefined && { age }),
      ...(str(body.gender) && { gender: str(body.gender) }),
      ...(num(body.heightCm) !== undefined && { heightCm: num(body.heightCm) }),
      ...(num(body.weightKg) !== undefined && { weightKg: num(body.weightKg) }),
      ...(num(body.targetWeightKg) !== undefined && {
        targetWeightKg: num(body.targetWeightKg),
      }),
      ...(fitnessGoal && { fitnessGoal }),
      ...(str(body.activityLevel) && { activityLevel: str(body.activityLevel) }),
      ...(str(body.city) && { city: str(body.city) }),
      ...(typeof body.bio === "string" && { bio: body.bio.trim() }),
    },
    create: {
      userId: me.id,
      age,
      gender: str(body.gender),
      heightCm: num(body.heightCm),
      weightKg: num(body.weightKg),
      targetWeightKg: num(body.targetWeightKg),
      fitnessGoal,
      activityLevel: str(body.activityLevel),
      city: str(body.city),
      bio: typeof body.bio === "string" ? body.bio.trim() : undefined,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Profile saved",
    data: profile,
  });
}
