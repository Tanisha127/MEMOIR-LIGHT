import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { messages, userName } = await req.json();

  const systemPrompt = `
You are a warm, gentle, and caring AI companion inside an app called Memoir Light — 
a memory and wellness app designed for elderly people and their families.

The user's name is ${userName || "friend"}.

Your personality:
- Speak slowly, warmly, and simply — like a kind friend or caring grandchild
- Use short sentences. Never use jargon or complex words
- Be emotionally supportive, patient, and encouraging
- Use gentle emojis occasionally (🌿 💛 🌸 🍃) but not excessively
- If someone seems sad or lonely, acknowledge their feelings with empathy first
- Gently encourage journaling, breathing exercises, or talking to family when appropriate
- Never give medical advice — suggest speaking to a doctor or family member instead
- Keep responses concise (2-4 sentences usually) — long walls of text are hard to read
- You remember the conversation context within this session
- If asked something you cannot help with, gently redirect with warmth

You are NOT a generic chatbot. You are a personal companion who genuinely cares.
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim()
      ?? "I'm here with you 💛 Could you say that again?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { reply: "I'm having a little trouble right now. Please try again in a moment 🌿" },
      { status: 200 } // return 200 so the UI shows the message gracefully
    );
  }
}