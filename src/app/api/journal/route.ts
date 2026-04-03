import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const journals = await prisma.journal.findMany({
    where: { userId, NOT: { tags: { has: "__timeline__" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(journals);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const journal = await prisma.journal.create({
    data: {
      title: body.title || null,
      content: body.content,
      mood: body.mood || null,
      aiSummary: body.aiSummary || null,
      photo: body.photo || null,
      voiceNote: body.voiceNote || null,
      tags: body.tags || [],
      userId,
    },
  });
  return NextResponse.json(journal);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const journal = await prisma.journal.update({
    where: { id: body.id },
    data: {
      title: body.title || null,
      content: body.content,
      mood: body.mood || null,
      tags: body.tags || [],
    },
  });
  return NextResponse.json(journal);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.journal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}