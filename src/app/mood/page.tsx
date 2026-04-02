"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type MoodLog = {
  id: string;
  mood: string;
  note?: string;
  emoji?: string;
  createdAt: string;
};

const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊", color: "#E8B86D", flower: "🌻", bg: "from-amber-light/40 to-amber-warm/20" },
  { value: "calm", label: "Calm", emoji: "😌", color: "#7CAF9E", flower: "🌿", bg: "from-sage-100 to-sage-200" },
  { value: "grateful", label: "Grateful", emoji: "🙏", color: "#D4704E", flower: "🌸", bg: "from-terracotta-50 to-terracotta-100" },
  { value: "sad", label: "Sad", emoji: "😔", color: "#8296B4", flower: "🌧️", bg: "from-stone-lighter to-cream-200" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "#C4923A", flower: "🌾", bg: "from-amber-light/20 to-cream-200" },
  { value: "loved", label: "Loved", emoji: "🥰", color: "#D4704E", flower: "🌹", bg: "from-terracotta-50 to-amber-light/30" },
  { value: "tired", label: "Tired", emoji: "😴", color: "#A8C8BF", flower: "🌙", bg: "from-sage-50 to-cream-100" },
  { value: "content", label: "Content", emoji: "😊", color: "#7CAF9E", flower: "🍃", bg: "from-sage-100 to-cream-200" },
];

const AFFIRMATIONS: Record<string, string> = {
  happy: "That joy you feel is real and beautiful. Keep shining! ☀️",
  calm: "Your peace is precious. You are doing wonderfully. 🌿",
  grateful: "Gratitude is a superpower. You are rich in love. 💛",
  sad: "It's okay to feel sad sometimes. You are still loved. 🫂",
  anxious: "Breathe gently. This feeling will pass. You are safe. 🌬️",
  loved: "You are surrounded by love, even when it's quiet. 🌹",
  tired: "Rest is also a form of care. Be gentle with yourself. 🌙",
  content: "Contentment is a beautiful place to be. Cherish it. 🍃",
};

export default function MoodGardenPage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAffirmation, setShowAffirmation] = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/mood");
      setLogs(await res.json());
    } catch {}
  };

  const saveMood = async () => {
    if (!selected) return toast.error("Please pick a mood first");
    setLoading(true);
    const mood = MOODS.find((m) => m.value === selected);
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selected, note, emoji: mood?.emoji }),
      });
      setShowAffirmation(true);
      setTimeout(() => setShowAffirmation(false), 4000);
      fetchLogs();
      setNote("");
    } catch {
      toast.error("Could not save your mood");
    } finally {
      setLoading(false);
    }
  };

  // Build a simple "garden" of flowers from recent logs
  const gardenFlowers = logs.slice(0, 12);
  const selectedMood = MOODS.find((m) => m.value === selected);

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">Mood Garden 🌸</h1>
        <p className="font-body text-stone-light italic mt-1">
          How are you feeling right now? Every feeling is welcome here.
        </p>
      </div>

      {/* Affirmation overlay */}
      {showAffirmation && selectedMood && (
        <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-6`}>
          <div className={`card-warm p-10 max-w-sm text-center bg-gradient-to-br ${selectedMood.bg} animate-slide-up`}>
            <div className="text-6xl mb-4">{selectedMood.flower}</div>
            <p className="font-display text-xl font-bold text-stone-warm mb-3">
              {AFFIRMATIONS[selected]}
            </p>
            <p className="font-ui text-sm text-stone-light">
              A new flower has bloomed in your garden 🌱
            </p>
          </div>
        </div>
      )}

      {/* Mood picker */}
      <div className="card-warm p-6 mb-8">
        <h2 className="font-ui font-semibold text-stone-warm mb-4">How are you feeling today?</h2>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelected(m.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 ${
                selected === m.value
                  ? "bg-gradient-to-br " + m.bg + " shadow-warm scale-105"
                  : "bg-cream-100 hover:bg-cream-200"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="font-ui text-xs text-stone-warm font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <textarea
          className="input-warm mb-4"
          placeholder="Any thoughts you'd like to share? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        <button onClick={saveMood} disabled={loading} className="btn-primary w-full">
          {loading ? "Planting in your garden…" : "Plant this feeling 🌱"}
        </button>
      </div>

      {/* Garden visualization */}
      <div className="card-warm p-6 mb-6">
        <h2 className="font-ui font-semibold text-stone-warm mb-4">Your Mood Garden</h2>
        {gardenFlowers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🌱</div>
            <p className="font-body text-stone-light italic text-sm">Your garden is waiting to bloom</p>
          </div>
        ) : (
          <div className="relative bg-gradient-to-b from-cream-100 to-sage-50 rounded-2xl p-6 min-h-[140px] overflow-hidden">
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-sage-100 rounded-b-2xl" />
            {/* Flowers */}
            <div className="flex flex-wrap gap-4 items-end justify-center relative z-10">
              {gardenFlowers.map((log, i) => {
                const mood = MOODS.find((m) => m.value === log.mood);
                const height = [40, 55, 45, 60, 50, 48, 52, 44, 58, 46, 54, 42][i % 12];
                return (
                  <div key={log.id} className="flex flex-col items-center" title={`${mood?.label}: ${new Date(log.createdAt).toLocaleDateString()}`}>
                    <span className="text-2xl">{mood?.flower || "🌸"}</span>
                    <div className="w-0.5 bg-sage-300" style={{ height: `${height / 4}px` }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent moods */}
      {logs.length > 0 && (
        <div>
          <h2 className="font-ui font-semibold text-stone-warm mb-3">Recent Feelings</h2>
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => {
              const mood = MOODS.find((m) => m.value === log.mood);
              return (
                <div key={log.id} className={`card-warm p-4 flex items-center gap-3 bg-gradient-to-r ${mood?.bg || "from-cream-100"} border-0`}>
                  <span className="text-2xl">{mood?.flower || "🌸"}</span>
                  <div className="flex-1">
                    <span className="font-ui font-medium text-stone-warm">{mood?.label}</span>
                    {log.note && <p className="font-ui text-sm text-stone-light">{log.note}</p>}
                  </div>
                  <span className="font-ui text-xs text-stone-light">
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
