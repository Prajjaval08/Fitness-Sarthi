import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { badRequest, getAuthUser, readJson, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const challenges = await prisma.challenge.findMany({
    include: {
      _count: { select: { participants: true } },
      participants: {
        where: { userId: me.id },
        select: { id: true, progress: true, completed: true, joinedAt: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: challenges.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      goal: c.goal,
      rewardXP: c.rewardXP,
      startDate: c.startDate,
      endDate: c.endDate,
      participantCount: c._count.participants,
      joined: c.participants.length > 0,
      progress: c.participants[0]?.progress ?? 0,
      completed: c.participants[0]?.completed ?? false,
    })),
  });
}

export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const challengeId =
    typeof body?.challengeId === "string" ? body.challengeId : "";
  if (!challengeId) return badRequest("challengeId is required");

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) {
    return NextResponse.json(
      { success: false, message: "Challenge not found" },
      { status: 404 },
    );
  }

  const existing = await prisma.userChallenge.findFirst({
    where: { userId: me.id, challengeId },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "Already joined this challenge" },
      { status: 409 },
    );
  }

  const joined = await prisma.userChallenge.create({
    data: { userId: me.id, challengeId },
    include: { challenge: true },
  });

  return NextResponse.json(
    {
      success: true,
      message: `Joined "${challenge.title}". Good luck!`,
      data: joined,
    },
    { status: 201 },
  );
}
