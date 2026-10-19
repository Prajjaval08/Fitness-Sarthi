import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const muscleGroup = searchParams.get("muscleGroup")?.trim() || undefined;
  const difficulty = searchParams.get("difficulty")?.trim() || undefined;

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nameHindi: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(muscleGroup && { muscleGroups: { has: muscleGroup } }),
      ...(difficulty &&
        ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty) && {
          difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        }),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    { success: true, data: exercises },
    {
      // Reference data — safe to edge-cache.
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
