"use client";
import { useState } from "react";
import { Sparkles, Check, Music, Brain, Palette, TreePine } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  aiGenerated: boolean;
};

const TYPE_CONFIG: Record<string, { icon: React.ElementType; emoji: string; color: string; bg: string }> = {
  music:   { icon: Music,     emoji: "🎵", color: "text-terracotta-400", bg: "from-terracotta-50 to-amber-light/20" },
  memory:  { icon: Brain,     emoji: "🧠", color: "text-sage-500",       bg: "from-sage-50 to-sage-100" },
  art:     { icon: Palette,   emoji: "🎨", color: "text-amber-deep",     bg: "from-amber-light/30 to-cream-200" },
  nature:  { icon: TreePine,  emoji: "🌿", color: "text-sage-400",       bg: "from-sage-50 to-cream-100" },
  general: { icon: Sparkles,  emoji: "✨", color: "text-stone-warm",     bg: "from-cream-100 to-cream-200" },
};

const T = {
  en: {
    title:            "Activities ✨",
    subtitle:         "Gentle exercises to keep your mind and heart warm",
    personalised:     "Personalised for You",
    personalisedDesc: "Tell me what you enjoy and I'll suggest activities just for you",
    placeholder:      "e.g. gardening, old films, crosswords, walking…",
    generate:         "Generate",
    thinking:         "Thinking…",
    tellFirst:        "Tell me a little about what you enjoy first",
    generated:        "New activities generated just for you ✨",
    couldNotGen:      "Could not generate activities right now",
    canvasTitle:      "Colour Therapy Canvas",
    canvasDesc:       "Tap to open — draw freely, no rules",
    todayActivities:  "Today's Activities",
    completed:        "Completed 🎉",
    aiSuggested:      "✨ AI Suggested",
    undo:             "Undo",
    great:            "Great job completing",
    canvasHeading:    "🎨 Free Drawing Canvas",
    close:            "Close ✕",
    eraser:           "🧹 Eraser",
    brush:            "✏️ Brush",
    clear:            "Clear",
    canvasCaption:    "Express yourself freely — no rules, only joy 🎨",
    defaults: [
      { title: "Name 5 Things You Can See",       description: "Look around slowly and name 5 things nearby. This helps ground your thoughts.",     type: "memory" },
      { title: "Hum a Favourite Tune",             description: "Just hum any melody you love for 2 minutes. Music heals.",                          type: "music"  },
      { title: "Draw Something From Your Window",  description: "Simple lines are beautiful too. No skill needed — just expression.",                 type: "art"    },
      { title: "Sit Outside for 10 Minutes",       description: "Feel the air, listen to birds. Nature is the best therapist.",                       type: "nature" },
    ],
  },
  hi: {
    title:            "गतिविधियाँ ✨",
    subtitle:         "आपके मन और दिल को गर्म रखने के लिए सौम्य अभ्यास",
    personalised:     "आपके लिए विशेष",
    personalisedDesc: "मुझे बताएं आपको क्या पसंद है और मैं आपके लिए गतिविधियाँ सुझाऊंगा",
    placeholder:      "जैसे: बागवानी, पुरानी फ़िल्में, पहेलियाँ, सैर…",
    generate:         "सुझाव लें",
    thinking:         "सोच रहा हूँ…",
    tellFirst:        "पहले बताएं आपको क्या पसंद है",
    generated:        "आपके लिए नई गतिविधियाँ तैयार हैं ✨",
    couldNotGen:      "अभी गतिविधियाँ नहीं बना सका",
    canvasTitle:      "रंग चिकित्सा कैनवास",
    canvasDesc:       "खोलने के लिए टैप करें — स्वतंत्र रूप से बनाएं",
    todayActivities:  "आज की गतिविधियाँ",
    completed:        "पूर्ण हो गया 🎉",
    aiSuggested:      "✨ AI सुझाव",
    undo:             "पूर्ववत करें",
    great:            "बहुत बढ़िया! आपने पूरा किया",
    canvasHeading:    "🎨 स्वतंत्र चित्रकारी",
    close:            "बंद करें ✕",
    eraser:           "🧹 मिटाएं",
    brush:            "✏️ ब्रश",
    clear:            "साफ़ करें",
    canvasCaption:    "स्वतंत्र रूप से अभिव्यक्त करें — कोई नियम नहीं, केवल आनंद 🎨",
    defaults: [
      { title: "5 चीज़ें देखें जो आपके आसपास हैं", description: "धीरे-धीरे चारों ओर देखें और 5 चीज़ें बताएं। यह आपके विचारों को स्थिर करता है।", type: "memory" },
      { title: "कोई पसंदीदा धुन गुनगुनाएं",         description: "2 मिनट के लिए कोई भी प्रिय धुन गुनगुनाएं। संगीत ठीक करता है।",                  type: "music"  },
      { title: "खिड़की से कुछ बनाएं",               description: "सरल रेखाएं भी सुंदर होती हैं। कोई कौशल नहीं चाहिए — बस अभिव्यक्ति।",             type: "art"    },
      { title: "10 मिनट बाहर बैठें",                description: "हवा महसूस करें, पक्षियों को सुनें। प्रकृति सबसे अच्छी चिकित्सक है।",              type: "nature" },
    ],
  },
} as const;

export default function ActivitiesPage() {
  const { lang } = useLanguage();
  const t = T[lang];

  const [activities, setActivities] = useState<Activity[]>(
    t.defaults.map((d, i) => ({ ...d, id: `d${i}`, completed: false, aiGenerated: false }))
  );
  const [interests, setInterests] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  // Re-seed defaults when language changes but keep completed state
  const defaultsWithState = T[lang].defaults.map((d, i) => {
    const existing = activities.find((a) => a.id === `d${i}`);
    return { ...d, id: `d${i}`, completed: existing?.completed ?? false, aiGenerated: false };
  });

  const generateActivities = async () => {
    if (!interests.trim()) return toast.error(t.tellFirst);
    setAiLoading(true);
    try {
      const res = await fetch("/api/activities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, lang }),
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
        toast.success(t.generated);
      }
    } catch {
      toast.error(t.couldNotGen);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleComplete = (id: string) => {
    const act = activities.find((a) => a.id === id);
    if (act && !act.completed) toast.success(`${t.great} "${act.title}" 🎉`);
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const allActivities = [
    ...defaultsWithState.filter((d) => !activities.find((a) => a.id === d.id && a.aiGenerated)),
    ...activities.filter((a) => a.aiGenerated),
  ];

  const incomplete = allActivities.filter((a) => !a.completed);
  const complete   = allActivities.filter((a) => a.completed);

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">{t.title}</h1>
        <p className="font-body text-stone-light italic mt-1">{t.subtitle}</p>
      </div>

      {/* AI generator */}
      <div className="card-warm p-6 mb-8 bg-gradient-to-br from-sage-50 to-cream-100 border-0">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-sage-500" size={20} />
          <h2 className="font-ui font-semibold text-stone-warm">{t.personalised}</h2>
        </div>
        <p className="font-body text-stone-light text-sm mb-4 italic">{t.personalisedDesc}</p>
        <div className="flex gap-3">
          <input
            className="input-warm flex-1"
            placeholder={t.placeholder}
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
                <span>{t.thinking}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>{t.generate}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas shortcut */}
      <div
        onClick={() => setShowCanvas(!showCanvas)}
        className="card-warm p-5 mb-8 cursor-pointer bg-gradient-to-r from-amber-light/20 to-terracotta-50 border-0 flex items-center gap-4 hover:shadow-warm-lg transition-all"
      >
        <div className="text-4xl">🎨</div>
        <div>
          <h3 className="font-ui font-semibold text-stone-warm">{t.canvasTitle}</h3>
          <p className="font-ui text-sm text-stone-light">{t.canvasDesc}</p>
        </div>
        <div className="ml-auto text-stone-light">→</div>
      </div>

      {showCanvas && <ColorCanvas onClose={() => setShowCanvas(false)} t={t} />}

      {/* Activity list */}
      <div className="space-y-3">
        <h2 className="font-ui font-semibold text-stone-warm mb-3">{t.todayActivities}</h2>
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
                    {t.aiSuggested}
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
          <h2 className="font-ui font-semibold text-stone-light mb-3">{t.completed}</h2>
          <div className="space-y-2">
            {complete.map((a) => (
              <div key={a.id} className="card-warm p-4 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <p className="font-ui text-stone-warm line-through flex-1">{a.title}</p>
                <button
                  onClick={() => toggleComplete(a.id)}
                  className="font-ui text-xs text-stone-light hover:text-terracotta"
                >
                  {t.undo}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Canvas component ──────────────────────────────────────────────
type CanvasT = { canvasHeading: string; close: string; eraser: string; brush: string; clear: string; canvasCaption: string };

function ColorCanvas({ onClose, t }: { onClose: () => void; t: CanvasT }) {
  const [color, setColor]     = useState("#7CAF9E");
  const [size, setSize]       = useState(12);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool]       = useState<"brush" | "eraser">("brush");
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = e.currentTarget;
    const ctx    = canvas.getContext("2d");
    if (!ctx || !lastPos) return;
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth   = tool === "eraser" ? size * 3 : size;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const clearCanvas = () => {
    const canvas = document.getElementById("therapy-canvas") as HTMLCanvasElement;
    const ctx    = canvas?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const COLORS = ["#D4704E","#7CAF9E","#E8B86D","#8296B4","#A8C8BF","#F9DDD6","#4A3728","#FFFFFF"];
  const SIZES  = [4, 8, 12, 20, 32];

  return (
    <div className="card-warm p-5 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-stone-warm">{t.canvasHeading}</h3>
        <button onClick={onClose} className="text-stone-light hover:text-stone-warm text-sm font-ui">
          {t.close}
        </button>
      </div>

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
          {tool === "eraser" ? t.eraser : t.brush}
        </button>
        <button onClick={clearCanvas} className="font-ui text-sm px-3 py-1.5 rounded-xl bg-cream-200 text-stone-warm">
          {t.clear}
        </button>
      </div>

      <canvas
        id="therapy-canvas"
        width={600}
        height={300}
        className="w-full rounded-2xl bg-white border border-stone-lighter touch-none"
        onMouseDown={(e) => { setDrawing(true); setLastPos(getPos(e, e.currentTarget)); }}
        onMouseUp={() => { setDrawing(false); setLastPos(null); }}
        onMouseLeave={() => { setDrawing(false); setLastPos(null); }}
        onMouseMove={draw}
        onTouchStart={(e) => { setDrawing(true); setLastPos(getPos(e, e.currentTarget)); }}
        onTouchEnd={() => { setDrawing(false); setLastPos(null); }}
        onTouchMove={draw}
      />
      <p className="font-ui text-xs text-stone-light text-center mt-2 italic">{t.canvasCaption}</p>
    </div>
  );
}