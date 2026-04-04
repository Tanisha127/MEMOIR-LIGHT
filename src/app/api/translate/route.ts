import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  const { text, targetLang } = await request.json();

  if (!text || targetLang === "en") {
    return NextResponse.json({ translated: text });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Translate the following text to Hindi (Devanagari script).
Rules:
- Keep emojis exactly as they are
- Keep people's names as they are  
- Only return the translated text, nothing else, no explanation
- If the text is already in Hindi, return it as-is

Text to translate:
${text}`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();
    return NextResponse.json({ translated });
  } catch (err) {
    console.error("Gemini translation error:", err);
    return NextResponse.json({ translated: text });
  }
}