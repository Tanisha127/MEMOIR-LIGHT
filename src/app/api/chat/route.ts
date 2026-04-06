import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("lonely") || msg.includes("alone") || msg.includes("miss"))
    return "You are never truly alone 💛 I'm right here with you. Would you like to share a memory or talk about someone you're missing?";

  if (msg.includes("sad") || msg.includes("cry") || msg.includes("upset") || msg.includes("unhappy"))
    return "I'm so sorry you're feeling this way 🌸 It's okay to feel sad sometimes. I'm here to listen — would you like to talk about it?";

  if (msg.includes("happy") || msg.includes("great") || msg.includes("good") || msg.includes("wonderful"))
    return "That warms my heart to hear! 🌿 Tell me more — what made today special for you?";

  if (msg.includes("remember") || msg.includes("memory") || msg.includes("memories"))
    return "Memories are such precious treasures 🍃 Would you like to write one down in your journal today?";

  if (msg.includes("family") || msg.includes("children") || msg.includes("grandchildren") || msg.includes("son") || msg.includes("daughter"))
    return "Family is everything 💛 It sounds like they mean a lot to you. Have you been able to speak with them recently?";

  if (msg.includes("pain") || msg.includes("hurt") || msg.includes("sick") || msg.includes("ill") || msg.includes("health"))
    return "I'm sorry to hear you're not feeling well 🌸 Please do speak with your doctor or a family member — they care about you deeply.";

  if (msg.includes("sleep") || msg.includes("tired") || msg.includes("rest"))
    return "Rest is so important 🍃 Try to take it easy today. A short breathing exercise might help you relax — breathe in slowly for 4 counts, then out for 4.";

  if (msg.includes("bored") || msg.includes("nothing to do"))
    return "Let's find something joyful to do 🌿 Would you like to write about a favourite memory, or shall we just have a gentle chat?";

  if (msg.includes("thank") || msg.includes("thanks"))
    return "You're so welcome 💛 It truly makes me happy to be here with you.";

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey"))
    return "Hello there 🌸 It's so lovely to see you. How are you feeling today?";

  if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("see you"))
    return "Take good care of yourself 🌿 I'll be right here whenever you want to chat. Goodbye for now 💛";

  if (msg.includes("weather") || msg.includes("outside") || msg.includes("sunny") || msg.includes("rain"))
    return "Whatever the weather outside, I hope your heart feels warm today 🌸 Is there something on your mind?";

  if (msg.includes("eat") || msg.includes("food") || msg.includes("lunch") || msg.includes("dinner") || msg.includes("breakfast"))
    return "Good nutrition is so important 🍃 I hope you've had something nourishing today. Do remember to eat well and drink enough water 💛";

  // Default
  return "Thank you for sharing that with me 💛 I'm here and I'm listening. Would you like to tell me more, or shall we talk about something that brings you joy?";
}

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

  const lastMessage = messages[messages.length - 1]?.content;
  if (!lastMessage) {
    return NextResponse.json({ reply: "I didn't catch that 💛 Could you say it again?" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const allExceptLast = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const firstUserIdx = allExceptLast.findIndex((m: { role: string }) => m.role === "user");
    const history = firstUserIdx === -1 ? [] : allExceptLast.slice(firstUserIdx);

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.8,
      },
    });

    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text()?.trim()
      ?? getFallbackReply(lastMessage);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    // Smart fallback based on user's message
    return NextResponse.json({ reply: getFallbackReply(lastMessage) }, { status: 200 });
  }
}