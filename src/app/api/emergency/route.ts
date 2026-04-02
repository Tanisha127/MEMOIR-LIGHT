import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const contacts = await prisma.emergencyContact.findMany({ where: { userId } });
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const contact = await prisma.emergencyContact.create({
    data: { name: body.name, phone: body.phone, relation: body.relation || "Contact", userId },
  });
  return NextResponse.json(contact);
}
