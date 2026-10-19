import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthUser, levelForXP, unauthorized } from "@/lib/auth";

/**
 * Community leaderboard — top users by total XP.
 * Cheap query: single ordered scan over the small UserStreak table.
 */
export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    50,
    Math.max(5, Number(searchParams.get("limit")) || 20),
  );

  const rows = await prisma.userStreak.findMany({
    orderBy: { totalXP: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const board = rows.map((r, i) => {
    const level = levelForXP(r.totalXP);
    return {
      rank: i + 1,
      userId: r.user.id,
      name: r.user.name,
      avatarUrl: r.user.avatarUrl,
      totalXP: r.totalXP,
      currentStreak: r.currentStreak,
      level: level.level,
      levelName: level.name,
      isYou: r.user.id === me.id,
    };
  });

  const myRank = board.findIndex((b) => b.isYou);

  return NextResponse.json({
    success: true,
    data: board,
    yourRank: myRank === -1 ? null : myRank + 1,
  });
}
