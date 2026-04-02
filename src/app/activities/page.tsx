"use client";
import { useState, useEffect } from "react";
import { Sparkles, Check, Music, Brain, Palette, TreePine } from "lucide-react";
import toast from "react-hot-toast";

type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  aiGenerated: boolean;
};

const TYPE_CONFIG: Record<string, { icon: React.ElementType; emoji: string; color: string; bg: string }> = {
  music: { icon: Music, emoji: "🎵", color: "text-terracotta-400", bg: "from-terracotta-50 to-amber-light/20" },
  memory: { icon: Brain, emoji: "🧠", color: "text-sage-500", bg: "from-sage-50 to-sage-100" },
  art: { icon: Palette, emoji: "🎨", color: "text-amber-deep", bg: "from-amber-light/30 to-cream-200" },
  nature: { icon: TreePine, emoji: "🌿", color: "text-sage-400", bg: "from-sage-50 to-cream-100" },
  general: { icon: Sparkles, emoji: "✨", color: "text-stone-warm", bg: "from-cream-100 to-cream-200" },
};

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "d1", title: "Name 5 Things You Can See", description: "Look around slowly and name 5 things nearby. This helps ground your thoughts.", type: "memory", completed: false, aiGenerated: false },
  { id: "d2", title: "Hum a Favourite Tune", description: "Just hum any melody you love for 2 minutes. Music heals.", type: "music", completed: false, aiGenerated: false },
  { id: "d3", title: "Draw Something From Your Window", description: "Simple lines are beautiful too. No skill needed — just expression.", type: "art", completed: false, aiGenerated: false },
  { id: "d4", title: "Sit Outside for 10 Minutes", description: "Feel the air, listen to birds. Nature is the best therapist.", type: "nature", completed: false, aiGenerated: false },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  const [interests, setInterests] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const generateActivities = async () => {
    if (!interests.trim()) return toast.error("Tell me a little about what you enjoy first");
    setAiLoading(true);
    try {
      const res = await fetch("/api/activities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      const data = await res.json();
      if (data.activities) {
        setActivities((prev) => [
          ...prev,
          ...data.activities.map((a: Omit<Activity, "id" | "completed">) => ({
            ...a,
            id: Math.random().toString(36).slice(2),
            completed: false,
          })),
        ]);
        toast.success("New activities generated just for you ✨");
      }
    } catch {
      toast.error("Could not generate activities right now");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
    const act = activities.find((a) => a.id === id);
    if (act && !act.completed) toast.success(`Great job completing "${act.title}" 🎉`);
  };

  const incomplete = activities.filter((a) => !a.completed);
  const complete = activities.filter((a) => a.completed);

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">Activities ✨</h1>
        <p className="font-body text-stone-light italic mt-1">
          Gentle exercises to keep your mind and heart warm
        </p>
      </div>

      {/* AI generator */}
      <div className="card-warm p-6 mb-8 bg-gradient-to-br from-sage-50 to-cream-100 border-0">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-sage-500" size={20} />
          <h2 className="font-ui font-semibold text-stone-warm">Personalised for You</h2>
        </div>
        <p className="font-body text-stone-light text-sm mb-4 italic">
          Tell me what you enjoy and I'll suggest activities just for you
        </p>
        <div className="flex gap-3">
          <input
            className="input-warm flex-1"
            placeholder="e.g. gardening, old films, crosswords, walking…"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <button
            onClick={generateActivities}
            disabled={aiLoading}
            className="btn-sage flex items-center gap-2 whitespace-nowrap"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Thinking…</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coloring canvas shortcut */}
      <div
        onClick={() => setShowCanvas(!showCanvas)}
        className="card-warm p-5 mb-8 cursor-pointer bg-gradient-to-r from-amber-light/20 to-terracotta-50 border-0 flex items-center gap-4 hover:shadow-warm-lg transition-all"
      >
        <div className="text-4xl">🎨</div>
        <div>
          <h3 className="font-ui font-semibold text-stone-warm">Colour Therapy Canvas</h3>
          <p className="font-ui text-sm text-stone-light">Tap to open — draw freely, no rules</p>
        </div>
        <div className="ml-auto text-stone-light">→</div>
      </div>

      {showCanvas && <ColorCanvas onClose={() => setShowCanvas(false)} />}

      {/* Activity list */}
      <div className="space-y-3">
        <h2 className="font-ui font-semibold text-stone-warm mb-3">Today's Activities</h2>
        {incomplete.map((a) => {
          const config = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;
          return (
            <div key={a.id} className={`card-warm p-5 flex items-start gap-4 bg-gradient-to-br ${config.bg} border-0`}>
              <div className="text-3xl mt-0.5">{config.emoji}</div>
              <div className="flex-1">
                <p className="font-ui font-semibold text-stone-warm">{a.title}</p>
                <p className="font-ui text-sm text-stone-light mt-0.5">{a.description}</p>
                {a.aiGenerated && (
                  <span className="inline-block mt-2 font-ui text-xs text-sage-500 bg-sage/10 px-2 py-0.5 rounded-full">
                    ✨ AI Suggested
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleComplete(a.id)}
                className="w-10 h-10 rounded-xl border-2 border-sage/30 flex items-center justify-center hover:bg-sage hover:border-sage hover:text-white transition-all flex-shrink-0"
              >
                <Check size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {complete.length > 0 && (
        <div className="mt-6 opacity-60">
          <h2 className="font-ui font-semibold text-stone-light mb-3">Completed 🎉</h2>
          <div className="space-y-2">
            {complete.map((a) => (
              <div key={a.id} className="card-warm p-4 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <p className="font-ui text-stone-warm line-through flex-1">{a.title}</p>
                <button onClick={() => toggleComplete(a.id)} className="font-ui text-xs text-stone-light hover:text-terracotta">
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Coloring canvas component
function ColorCanvas({ onClose }: { onClose: () => void }) {
  const canvasRef = useState<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#7CAF9E");
  const [size, setSize] = useState(12);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const lastPos = useState<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (lastPos[0]) {
      ctx.beginPath();
      ctx.moveTo(lastPos[0].x, lastPos[0].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos[1](pos);
  };

  const clearCanvas = () => {
    const canvas = document.getElementById("therapy-canvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const COLORS = ["#D4704E", "#7CAF9E", "#E8B86D", "#8296B4", "#A8C8BF", "#F9DDD6", "#4A3728", "#FFFFFF"];
  const SIZES = [4, 8, 12, 20, 32];

  return (
    <div className="card-warm p-5 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-stone-warm">🎨 Free Drawing Canvas</h3>
        <button onClick={onClose} className="text-stone-light hover:text-stone-warm text-sm font-ui">
          Close ✕
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("brush"); }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c && tool === "brush" ? "scale-125 border-stone-warm" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 items-center">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-full bg-stone-warm transition-all ${size === s ? "opacity-100 ring-2 ring-terracotta ring-offset-1" : "opacity-40"}`}
              style={{ width: s + 4, height: s + 4 }}
            />
          ))}
        </div>
        <button
          onClick={() => setTool(tool === "eraser" ? "brush" : "eraser")}
          className={`font-ui text-sm px-3 py-1.5 rounded-xl transition-all ${tool === "eraser" ? "bg-terracotta/20 text-terracotta" : "bg-cream-200 text-stone-warm"}`}
        >
          {tool === "eraser" ? "🧹 Eraser" : "✏️ Brush"}
        </button>
        <button onClick={clearCanvas} className="font-ui text-sm px-3 py-1.5 rounded-xl bg-cream-200 text-stone-warm">
          Clear
        </button>
      </div>

      <canvas
        id="therapy-canvas"
        width={600}
        height={300}
        className="w-full rounded-2xl bg-white border border-stone-lighter touch-none"
        onMouseDown={(e) => { setDrawing(true); lastPos[1](getPos(e, e.currentTarget)); }}
        onMouseUp={() => { setDrawing(false); lastPos[1](null); }}
        onMouseLeave={() => { setDrawing(false); lastPos[1](null); }}
        onMouseMove={draw}
        onTouchStart={(e) => { setDrawing(true); lastPos[1](getPos(e, e.currentTarget)); }}
        onTouchEnd={() => { setDrawing(false); lastPos[1](null); }}
        onTouchMove={draw}
      />
      <p className="font-ui text-xs text-stone-light text-center mt-2 italic">
        Express yourself freely — no rules, only joy 🎨
      </p>
    </div>
  );
}
