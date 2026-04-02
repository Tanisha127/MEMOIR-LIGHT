import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a warm, gentle companion helping an elderly person with memory care. 
          When they share a memory or journal entry, you respond with a kind, simple 1-2 sentence reflection.
          Use friendly, warm language. Mention specific details from what they wrote. 
          End with a gentle, positive note. Keep it under 50 words. Like a kind friend would say.`,
        },
        {
          role: "user",
          content: `Please write a warm reflection on this journal entry: "${content}"`,
        },
      ],
      max_tokens: 100,
    });

    const summary = completion.choices[0]?.message?.content || "What a beautiful memory you've shared 🌿";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("OpenAI error:", err);
    // Graceful fallback
    return NextResponse.json({
      summary: "What a lovely memory you've shared today. Every moment you write down is a treasure 💛",
    });
  }
}
