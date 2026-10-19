import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/auth";

const VALID_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;
  const difficulty = searchParams.get("difficulty")?.trim() || undefined;

  if (
    difficulty !== undefined &&
    !(VALID_DIFFICULTIES as readonly string[]).includes(difficulty)
  ) {
    return badRequest("Invalid difficulty");
  }

  const workouts = await prisma.workout.findMany({
    where: {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && category !== "All" && { category }),
      ...(difficulty && {
        difficulty: difficulty as (typeof VALID_DIFFICULTIES)[number],
      }),
    },
    include: {
      _count: { select: { exercises: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    {
      success: true,
      data: workouts.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        difficulty: w.difficulty,
        durationMins: w.durationMins,
        category: w.category,
        thumbnailUrl: w.thumbnailUrl,
        isAIGenerated: w.isAIGenerated,
        exerciseCount: w._count.exercises,
      })),
    },
    {
      // The library only changes on seed/deploy — edge-cache it hard.
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
