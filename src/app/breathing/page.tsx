"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const PATTERNS = [
  {
    id: "478",
    name: "4-7-8 Calm",
    desc: "A gentle rhythm to ease anxiety",
    inhale: 4,
    hold: 7,
    exhale: 8,
    color: "from-sage-200 to-sage-300",
    emoji: "🌊",
  },
  {
    id: "box",
    name: "Box Breathing",
    desc: "Used by astronauts and nurses",
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
    desc: "Just breathe along at your own pace",
    inhale: 3,
    hold: 0,
    exhale: 5,
    color: "from-cream-200 to-sage-100",
    emoji: "🌸",
  },
];

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "idle";

export default function BreathingPage() {
  const [selected, setSelected] = useState(PATTERNS[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef(0);

  const PHASE_LABELS: Record<Phase, string> = {
    inhale: "Breathe In… 🌬️",
    hold: "Hold gently…",
    exhale: "Breathe Out… 🍃",
    holdAfter: "Rest…",
    idle: "Press Start",
  };

  const PHASE_COLORS: Record<Phase, string> = {
    inhale: "bg-sage",
    hold: "bg-amber-warm",
    exhale: "bg-terracotta/70",
    holdAfter: "bg-stone-lighter",
    idle: "bg-cream-300",
  };

  const runCycle = async (pattern: typeof PATTERNS[0]) => {
    const phases: { phase: Phase; duration: number }[] = [
      { phase: "inhale", duration: pattern.inhale },
      ...(pattern.hold ? [{ phase: "hold" as Phase, duration: pattern.hold }] : []),
      { phase: "exhale", duration: pattern.exhale },
      ...((pattern as {holdAfter?: number}).holdAfter ? [{ phase: "holdAfter" as Phase, duration: (pattern as {holdAfter?: number}).holdAfter! }] : []),
    ];

    for (const { phase, duration } of phases) {
      setPhase(phase);
      for (let s = duration; s >= 0; s--) {
        setSecondsLeft(s);
        setProgress(((duration - s) / duration) * 100);
        await new Promise((r) => { timerRef.current = setTimeout(r, 1000); });
      }
    }
    cycleRef.current += 1;
    setCycles(cycleRef.current);
  };

  const start = async () => {
    setRunning(true);
    cycleRef.current = 0;
    setCycles(0);
    for (let i = 0; i < 5; i++) {
      if (!running && i > 0) break;
      await runCycle(selected);
    }
    setRunning(false);
    setPhase("idle");
    toast.success("Wonderful session! You did beautifully 🌿");

    // Save session
    try {
      await fetch("/api/breathing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: 5 * (selected.inhale + selected.hold + selected.exhale), pattern: selected.id }),
      });
    } catch {}
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    setPhase("idle");
    setProgress(0);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const circleSize = phase === "inhale" ? "scale-110" : phase === "exhale" ? "scale-90" : "scale-100";

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold text-stone-warm mb-2">Calm Breathing 🌬️</h1>
        <p className="font-body text-stone-light italic">
          A few breaths can change everything. Take your time.
        </p>
      </div>

      {/* Pattern selection */}
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
              <p className="font-ui font-semibold text-stone-warm text-sm">{p.name}</p>
              <p className="font-ui text-xs text-stone-light mt-0.5">{p.desc}</p>
              <p className="font-ui text-xs text-sage-500 mt-1">
                {p.inhale}s - {p.hold}s - {p.exhale}s
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-8 mb-8">
        <div className="relative flex items-center justify-center w-56 h-56">
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${selected.color} opacity-30 transition-transform duration-1000 ${running ? circleSize : "scale-100"}`} />
          {/* Middle ring */}
          <div className={`absolute inset-6 rounded-full bg-gradient-to-br ${selected.color} opacity-50 transition-transform duration-1000 ${running ? circleSize : "scale-100"}`} style={{ transitionDelay: "150ms" }} />
          {/* Inner circle */}
          <div className={`absolute inset-12 rounded-full bg-gradient-to-br ${selected.color} opacity-80 transition-transform duration-1000 ${running ? circleSize : "scale-100"} flex items-center justify-center`} style={{ transitionDelay: "300ms" }}>
          </div>
          {/* Center text */}
          <div className="relative z-10 text-center">
            <div className="font-display text-xl font-bold text-stone-warm">
              {running ? PHASE_LABELS[phase] : "Ready 🌿"}
            </div>
            {running && secondsLeft > 0 && (
              <div className="font-ui text-3xl font-bold text-terracotta mt-1">{secondsLeft}</div>
            )}
          </div>
        </div>

        {cycles > 0 && (
          <p className="font-ui text-sm text-sage-500">
            {cycles} cycle{cycles !== 1 ? "s" : ""} complete ✨
          </p>
        )}

        <div className="flex gap-4">
          {!running ? (
            <button onClick={start} className="btn-primary px-10 py-3 text-base">
              Begin 🌿
            </button>
          ) : (
            <button onClick={stop} className="btn-secondary px-10 py-3 text-base">
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-cream-100 rounded-3xl p-5 text-center">
        <p className="font-body text-stone-warm text-sm italic">
          &ldquo;Breathing is the bridge between your body and your thoughts. When you breathe slowly, your whole self slows down.&rdquo; 🌿
        </p>
      </div>
    </div>
  );
}
