import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const session2 = await prisma.breathingSession.create({
    data: { duration: body.duration, pattern: body.pattern, userId },
  });
  return NextResponse.json(session2);
}
