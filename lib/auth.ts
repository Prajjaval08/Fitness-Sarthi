import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { prisma } from "./prisma";

export interface AuthUser {
  id: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.sub === "string" &&
      typeof decoded.email === "string"
    ) {
      return { id: decoded.sub, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reads the authenticated user from `Authorization: Bearer <token>`.
 * Returns null when the header is missing or the token is invalid.
 */
export function getAuthUser(req: Request): AuthUser | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return verifyToken(token);
}

export function unauthorized(message = "Authentication required") {
  return NextResponse.json(
    { success: false, message },
    { status: 401 },
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { success: false, message },
    { status: 400 },
  );
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    if (typeof body === "object" && body !== null) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export { readJson };

/**
 * Ensures a UserStreak row exists for the user (created lazily so
 * older accounts work too).
 */
export async function ensureStreak(userId: string) {
  return prisma.userStreak.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Updates the workout streak after a completed workout.
 * Same day  -> streak unchanged. Next day -> +1. Gap -> reset to 1.
 * Awards 50 XP per logged workout.
 */
export async function recordWorkoutStreak(userId: string, completedAt: Date) {
  const streak = await ensureStreak(userId);

  const today = startOfDay(completedAt).getTime();
  const last = streak.lastWorkout
    ? startOfDay(streak.lastWorkout).getTime()
    : null;

  let current = 1;
  if (last !== null) {
    const gap = Math.round((today - last) / DAY_MS);
    if (gap === 0) current = streak.currentStreak;
    else if (gap === 1) current = streak.currentStreak + 1;
  }

  return prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: current,
      longestStreak: Math.max(streak.longestStreak, current),
      lastWorkout: completedAt,
      totalXP: streak.totalXP + 50,
    },
  });
}

export async function awardXP(userId: string, xp: number) {
  const streak = await ensureStreak(userId);
  return prisma.userStreak.update({
    where: { userId },
    data: { totalXP: streak.totalXP + xp },
  });
}

const LEVEL_NAMES = [
  "STARTER",
  "HUSTLER",
  "WARRIOR",
  "CHAMPION",
  "LEGEND",
  "ICON",
];

export function levelForXP(totalXP: number): { level: number; name: string; xpForNext: number; xpProgress: number } {
  const level = Math.floor(totalXP / 300) + 1;
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const base = (level - 1) * 300;
  return {
    level,
    name,
    xpForNext: level * 300,
    xpProgress: totalXP - base,
  };
}
