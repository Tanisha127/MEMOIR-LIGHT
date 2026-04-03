import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const entries = await prisma.journal.findMany({
    where: { userId, tags: { has: "__timeline__" } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(entries.map((e) => ({
    id: e.id,
    year: e.tags.find((t) => t.startsWith("year:"))?.replace("year:", "") || "",
    emoji: e.tags.find((t) => t.startsWith("emoji:"))?.replace("emoji:", "") || "🌟",
    title: e.title || "",
    description: e.content,
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();

  const entry = await prisma.journal.create({
    data: {
      title: body.title,
      content: body.description,
      tags: ["__timeline__", `year:${body.year}`, `emoji:${body.emoji}`],
      userId,
    },
  });

  return NextResponse.json({
    id: entry.id,
    year: body.year,
    emoji: body.emoji,
    title: body.title,
    description: body.description,
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.journal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}