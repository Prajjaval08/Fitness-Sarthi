import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      profile: true,
      streak: true,
    },
  });

  if (!user) return unauthorized("Account not found");

  return NextResponse.json({ success: true, data: user });
}
