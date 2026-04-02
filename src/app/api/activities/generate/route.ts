import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interests } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a gentle activity therapist for elderly people with memory care needs.
          Based on their interests, suggest 3 simple, achievable activities.
          Respond ONLY with a valid JSON array. No markdown, no code blocks.
          Format: [{"title":"...","description":"...","type":"music|memory|art|nature|general","aiGenerated":true}]
          Keep descriptions warm, encouraging, and very simple (1-2 sentences max).`,
        },
        {
          role: "user",
          content: `Suggest 3 gentle activities for someone who enjoys: ${interests}`,
        },
      ],
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content || "[]";
    const activities = JSON.parse(text.replace(/```json?|```/g, "").trim());
    return NextResponse.json({ activities });
  } catch {
    // Fallback activities
    return NextResponse.json({
      activities: [
        { title: "Hum a Favourite Song", description: "Close your eyes and hum any melody that brings you joy.", type: "music", aiGenerated: true },
        { title: "Write 3 Things You're Grateful For", description: "Gratitude is a gentle exercise for the heart and mind.", type: "memory", aiGenerated: true },
        { title: "Sit by a Window and Watch the World", description: "Just observe, breathe, and let your mind wander gently.", type: "nature", aiGenerated: true },
      ],
    });
  }
}
