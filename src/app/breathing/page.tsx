"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "idle";

type Pattern = {
  id: string;
  name: string;
  nameHi: string;
  desc: string;
  descHi: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter?: number;
  color: string;
  emoji: string;
};

const PATTERNS: Pattern[] = [
  {
    id: "478",
    name: "4-7-8 Calm",
    nameHi: "4-7-8 शांति",
    desc: "A gentle rhythm to ease anxiety",
    descHi: "चिंता को कम करने की सौम्य लय",
    inhale: 4,
    hold: 7,
    exhale: 8,
    color: "from-sage-200 to-sage-300",
    emoji: "🌊",
  },
  {
    id: "box",
    name: "Box Breathing",
    nameHi: "बॉक्स साँस",
    desc: "Used by astronauts and nurses",
    descHi: "अंतरिक्ष यात्रियों और नर्सों द्वारा उपयोग",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    color: "from-terracotta-100 to-amber-light/40",
    emoji: "🎁",
  },
  {
    id: "simple",
    name: "Simple & Gentle",
    nameHi: "सरल और सौम्य",
    desc: "Just breathe along at your own pace",
    descHi: "बस अपनी गति से साँस लें",
    inhale: 3,
    hold: 0,
    exhale: 5,
    color: "from-cream-200 to-sage-100",
    emoji: "🌸",
  },
];

export default function BreathingPage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [selected, setSelected]     = useState(PATTERNS[0]);
  const [running, setRunning]       = useState(false);
  const [phase, setPhase]           = useState<Phase>("idle");
  const [cycles, setCycles]         = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef  = useRef<NodeJS.Timeout | null>(null);
  const cycleRef  = useRef(0);
  const runningRef = useRef(false);

  // ── Labels ─────────────────────────────────────────────
  const labels = {
    title:      isHi ? "शांत साँस 🌬️"                                    : "Calm Breathing 🌬️",
    subtitle:   isHi ? "कुछ गहरी साँसें सब कुछ बदल सकती हैं।"           : "A few breaths can change everything. Take your time.",
    ready:      isHi ? "तैयार हैं 🌿"                                     : "Ready 🌿",
    begin:      isHi ? "शुरू करें 🌿"                                     : "Begin 🌿",
    stop:       isHi ? "रोकें"                                            : "Stop",
    cycles:     isHi ? "चक्र पूरे हुए ✨"                                 : "cycles complete ✨",
    cycle:      isHi ? "चक्र पूरा हुआ ✨"                                 : "cycle complete ✨",
    done:       isHi ? "बहुत अच्छा! आपने बहुत अच्छा किया 🌿"             : "Wonderful session! You did beautifully 🌿",
    quote:      isHi
      ? "\"साँस आपके शरीर और विचारों के बीच का पुल है। जब आप धीरे साँस लेते हैं, तो आपका पूरा अस्तित्व शांत हो जाता है।\" 🌿"
      : "\"Breathing is the bridge between your body and your thoughts. When you breathe slowly, your whole self slows down.\" 🌿",
  };

  const PHASE_LABELS: Record<Phase, string> = {
    inhale:    isHi ? "साँस लें… 🌬️"   : "Breathe In… 🌬️",
    hold:      isHi ? "रोकें…"          : "Hold gently…",
    exhale:    isHi ? "साँस छोड़ें… 🍃" : "Breathe Out… 🍃",
    holdAfter: isHi ? "विश्राम करें…"   : "Rest…",
    idle:      isHi ? "शुरू करें"       : "Press Start",
  };

  // ── Cycle runner ───────────────────────────────────────
  const runCycle = async (pattern: Pattern) => {
    const phases: { phase: Phase; duration: number }[] = [
      { phase: "inhale",    duration: pattern.inhale },
      ...(pattern.hold > 0 ? [{ phase: "hold" as Phase, duration: pattern.hold }] : []),
      { phase: "exhale",    duration: pattern.exhale },
      ...(pattern.holdAfter ? [{ phase: "holdAfter" as Phase, duration: pattern.holdAfter }] : []),
    ];

    for (const { phase, duration } of phases) {
      if (!runningRef.current) return;
      setPhase(phase);
      for (let s = duration; s >= 0; s--) {
        if (!runningRef.current) return;
        setSecondsLeft(s);
        await new Promise((r) => { timerRef.current = setTimeout(r, 1000); });
      }
    }
    cycleRef.current += 1;
    setCycles(cycleRef.current);
  };

  const start = async () => {
    runningRef.current = true;
    setRunning(true);
    cycleRef.current = 0;
    setCycles(0);

    for (let i = 0; i < 5; i++) {
      if (!runningRef.current) break;
      await runCycle(selected);
    }

    if (runningRef.current) {
      runningRef.current = false;
      setRunning(false);
      setPhase("idle");
      toast.success(labels.done);
      try {
        await fetch("/api/breathing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration: 5 * (selected.inhale + (selected.hold || 0) + selected.exhale),
            pattern:  selected.id,
          }),
        });
      } catch {}
    }
  };

  const stop = () => {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    setPhase("idle");
    setSecondsLeft(0);
  };

  useEffect(() => () => {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const circleSize = phase === "inhale" ? "scale-110" : phase === "exhale" ? "scale-90" : "scale-100";

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold text-stone-warm mb-2">{labels.title}</h1>
        <p className="font-body text-stone-light italic">{labels.subtitle}</p>
      </div>

      {/* Pattern selection — only when not running */}
      {!running && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`card-warm p-4 text-center transition-all duration-200 ${
                selected.id === p.id ? "ring-2 ring-terracotta ring-offset-2 shadow-warm" : ""
              }`}
            >
              <div className="text-2xl mb-2">{p.emoji}</div>
              <p className="font-ui font-semibold text-stone-warm text-sm">
                {isHi ? p.nameHi : p.name}
              </p>
              <p className="font-ui text-xs text-stone-light mt-0.5">
                {isHi ? p.descHi : p.desc}
              </p>
              <p className="font-ui text-xs text-sage-500 mt-1">
                {p.inhale}s – {p.hold}s – {p.exhale}s
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-8 mb-8">
        <div className="relative flex items-center justify-center w-56 h-56">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${selected.color} opacity-30 transition-transform duration-1000 ${running ? circleSize : "scale-100"}`}
          />
          {/* Middle ring */}
          <div
            className={`absolute inset-6 rounded-full bg-gradient-to-br ${selected.color} opacity-50 transition-transform duration-1000 ${running ? circleSize : "scale-100"}`}
            style={{ transitionDelay: "150ms" }}
          />
          {/* Inner circle */}
          <div
            className={`absolute inset-12 rounded-full bg-gradient-to-br ${selected.color} opacity-80 transition-transform duration-1000 ${running ? circleSize : "scale-100"}`}
            style={{ transitionDelay: "300ms" }}
          />
          {/* Center text */}
          <div className="relative z-10 text-center px-2">
            <div className="font-display text-lg font-bold text-stone-warm leading-tight">
              {running ? PHASE_LABELS[phase] : labels.ready}
            </div>
            {running && secondsLeft > 0 && (
              <div className="font-ui text-3xl font-bold text-terracotta mt-1">{secondsLeft}</div>
            )}
          </div>
        </div>

        {/* Cycle count */}
        {cycles > 0 && (
          <p className="font-ui text-sm text-sage-500">
            {cycles} {cycles === 1 ? labels.cycle : labels.cycles}
          </p>
        )}

        {/* Start / Stop button */}
        <div className="flex gap-4">
          {!running ? (
            <button onClick={start} className="btn-primary px-10 py-3 text-base">
              {labels.begin}
            </button>
          ) : (
            <button onClick={stop} className="btn-secondary px-10 py-3 text-base">
              {labels.stop}
            </button>
          )}
        </div>
      </div>

      {/* Quote */}
      <div className="bg-cream-100 rounded-3xl p-5 text-center">
        <p className="font-body text-stone-warm text-sm italic">{labels.quote}</p>
      </div>

    </div>
  );
}