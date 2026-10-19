import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  ensureStreak,
  isValidEmail,
  readJson,
  signToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidEmail(email) || !password) {
    return badRequest("Email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message: don't reveal whether the email exists.
  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  await ensureStreak(user.id);

  const token = signToken({ id: user.id, email: user.email });

  return NextResponse.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    },
  });
}
