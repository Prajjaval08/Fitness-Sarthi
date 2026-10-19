import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workout) {
    return NextResponse.json(
      { success: false, message: "Workout not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: workout });
}
