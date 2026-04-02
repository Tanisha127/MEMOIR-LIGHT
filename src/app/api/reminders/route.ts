import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { time: "asc" },
  });
  return NextResponse.json(reminders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const reminder = await prisma.reminder.create({
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type || "TASK",
      time: body.time,
      userId,
    },
  });
  return NextResponse.json(reminder);
}
