import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { badRequest, getAuthUser, readJson, unauthorized } from "@/lib/auth";

const SYSTEM_PROMPT = `You are Fitness Saarthi, a warm and practical bilingual (Hinglish: Hindi written in Roman script mixed with English) fitness coach for Indian users.

Rules:
- Keep answers concise and actionable. Use short paragraphs and simple formatting.
- Mix Hindi (Roman script) and English naturally, like a friendly Indian trainer.
- Tailor advice to the user's profile (goal, weight, activity level) when provided.
- Never give medical diagnoses. For pain, injury, or health conditions, advise seeing a doctor or physiotherapist.
- Celebrate consistency over intensity. Motivate without shaming.
- When suggesting Indian foods, use familiar examples (dal, paneer, roti, dahi, rajma, eggs, soya).`;

const DEMO_REPLY =
  "Namaste! Main tumhara Saarthi hoon. Live AI coaching ke liye ANTHROPIC_API_KEY configure karna hoga — tab tak, yaad rakho: consistency hi sabse bada mantra hai. Aaj ka workout miss mat karo!";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function buildSystemPrompt(userId: string): Promise<string> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return SYSTEM_PROMPT;

  const bits: string[] = [];
  if (profile.user.name) bits.push(`name: ${profile.user.name}`);
  if (profile.fitnessGoal) bits.push(`goal: ${profile.fitnessGoal}`);
  if (profile.age) bits.push(`age: ${profile.age}`);
  if (profile.weightKg) bits.push(`weight: ${profile.weightKg}kg`);
  if (profile.targetWeightKg)
    bits.push(`target weight: ${profile.targetWeightKg}kg`);
  if (profile.activityLevel) bits.push(`activity: ${profile.activityLevel}`);

  return `${SYSTEM_PROMPT}\n\nUser profile — ${bits.join(", ")}. Personalize your advice accordingly.`;
}

export async function POST(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const body = await readJson(req);
  const message =
    typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) return badRequest("message is required");

  const conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : undefined;

  // Demo mode when no API key is configured — still persists the chat.
  if (!process.env.ANTHROPIC_API_KEY) {
    const conversation = await getOrCreateConversation(
      me.id,
      conversationId,
      message,
    );
    await saveMessages(conversation.id, [
      { role: "user", content: message },
      { role: "assistant", content: DEMO_REPLY },
    ]);
    return NextResponse.json({
      success: true,
      demo: true,
      conversationId: conversation.id,
      message: DEMO_REPLY,
    });
  }

  const conversation = await getOrCreateConversation(
    me.id,
    conversationId,
    message,
  );

  const history = await prisma.aIMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  const messages: ChatMessage[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  await prisma.aIMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  const system = await buildSystemPrompt(me.id);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system,
    messages,
  });

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`,
              ),
            );
          }
        }
        if (fullText.trim()) {
          await prisma.aIMessage.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: fullText,
            },
          });
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`,
          ),
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Coach is having trouble right now. Please try again." })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function getOrCreateConversation(
  userId: string,
  conversationId: string | undefined,
  firstMessage: string,
) {
  if (conversationId) {
    const existing = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (existing) return existing;
  }

  const title =
    firstMessage.length > 45 ? `${firstMessage.slice(0, 45)}…` : firstMessage;

  return prisma.aIConversation.create({
    data: { userId, title },
  });
}

async function saveMessages(
  conversationId: string,
  messages: { role: string; content: string }[],
) {
  await prisma.aIMessage.createMany({
    data: messages.map((m) => ({
      conversationId,
      role: m.role,
      content: m.content,
    })),
  });
}

/** List the user's conversations (for the sidebar). */
export async function GET(req: Request) {
  const me = getAuthUser(req);
  if (!me) return unauthorized();

  const conversations = await prisma.aIConversation.findMany({
    where: { userId: me.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, data: conversations });
}
