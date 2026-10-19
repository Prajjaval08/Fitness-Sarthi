import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const meal = await prisma.mealLog.findFirst({
    where: { id: params.id, userId: me.id },
  });

  if (!meal) {
    return NextResponse.json(
      { success: false, message: "Meal not found" },
      { status: 404 },
    );
  }

  await prisma.mealLog.delete({ where: { id: meal.id } });

  return NextResponse.json({ success: true, message: "Meal deleted" });
}
