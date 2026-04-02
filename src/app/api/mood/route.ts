import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const logs = await prisma.moodLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const log = await prisma.moodLog.create({
    data: { mood: body.mood, note: body.note || null, emoji: body.emoji || null, userId },
  });
  return NextResponse.json(log);
}
