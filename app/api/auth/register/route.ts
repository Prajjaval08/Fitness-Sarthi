import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  ensureStreak,
  hashPassword,
  isValidEmail,
  readJson,
  signToken,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await readJson(req);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) return badRequest("Name is required");
  if (!isValidEmail(email)) return badRequest("A valid email is required");
  if (password.length < 8)
    return badRequest("Password must be at least 8 characters");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
    select: { id: true, name: true, email: true },
  });

  await ensureStreak(user.id);

  const token = signToken({ id: user.id, email: user.email });

  return NextResponse.json(
    {
      success: true,
      message: "Account created successfully",
      data: { token, user },
    },
    { status: 201 },
  );
}
