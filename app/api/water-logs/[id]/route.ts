import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const entry = await prisma.waterLog.findFirst({
    where: { id: params.id, userId: me.id },
  });

  if (!entry) {
    return NextResponse.json(
      { success: false, message: "Entry not found" },
      { status: 404 },
    );
  }

  await prisma.waterLog.delete({ where: { id: entry.id } });

  return NextResponse.json({ success: true, message: "Entry deleted" });
}
