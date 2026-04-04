"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const cache: Record<string, string> = {};

async function translateText(text: string, lang: string): Promise<string> {
  if (!text || lang === "en") return text;
  const cacheKey = `${lang}:${text}`;
  if (cache[cacheKey]) return cache[cacheKey];
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang }),
    });
    const data = await res.json();
    cache[cacheKey] = data.translated;
    return data.translated;
  } catch {
    return text;
  }
}

export function useTranslate(text: string | undefined | null): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<string>(text ?? "");

  useEffect(() => {
    if (!text) { setTranslated(""); return; }
    if (lang === "en") { setTranslated(text); return; }
    translateText(text, lang).then(setTranslated);
  }, [text, lang]);

  return translated;
}

type JournalEntry = {
  id: string;
  content: string;
  title?: string;
  aiSummary?: string;
};

export function useTranslateJournals(journals: JournalEntry[]): JournalEntry[] {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<JournalEntry[]>(journals);

  useEffect(() => {
    if (lang === "en") { setTranslated(journals); return; }
    Promise.all(
      journals.map(async (j) => {
        const [content, title, aiSummary] = await Promise.all([
          translateText(j.content, lang),
          j.title     ? translateText(j.title,     lang) : Promise.resolve(undefined),
          j.aiSummary ? translateText(j.aiSummary, lang) : Promise.resolve(undefined),
        ]);
        return { ...j, content, title, aiSummary };
      })
    ).then(setTranslated);
  }, [journals, lang]);

  return translated;
}