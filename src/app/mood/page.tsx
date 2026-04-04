"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type MoodLog = {
  id: string;
  mood: string;
  note?: string;
  emoji?: string;
  createdAt: string;
};

const MOODS_EN = [
  { value: "happy",    label: "Happy",    emoji: "😊", color: "#E8B86D", flower: "🌻", bg: "from-amber-light/40 to-amber-warm/20" },
  { value: "calm",     label: "Calm",     emoji: "😌", color: "#7CAF9E", flower: "🌿", bg: "from-sage-100 to-sage-200" },
  { value: "grateful", label: "Grateful", emoji: "🙏", color: "#D4704E", flower: "🌸", bg: "from-terracotta-50 to-terracotta-100" },
  { value: "sad",      label: "Sad",      emoji: "😔", color: "#8296B4", flower: "🌧️", bg: "from-stone-lighter to-cream-200" },
  { value: "anxious",  label: "Anxious",  emoji: "😰", color: "#C4923A", flower: "🌾", bg: "from-amber-light/20 to-cream-200" },
  { value: "loved",    label: "Loved",    emoji: "🥰", color: "#D4704E", flower: "🌹", bg: "from-terracotta-50 to-amber-light/30" },
  { value: "tired",    label: "Tired",    emoji: "😴", color: "#A8C8BF", flower: "🌙", bg: "from-sage-50 to-cream-100" },
  { value: "content",  label: "Content",  emoji: "😊", color: "#7CAF9E", flower: "🍃", bg: "from-sage-100 to-cream-200" },
];

const MOODS_HI = [
  { value: "happy",    label: "खुश",        emoji: "😊", color: "#E8B86D", flower: "🌻", bg: "from-amber-light/40 to-amber-warm/20" },
  { value: "calm",     label: "शांत",       emoji: "😌", color: "#7CAF9E", flower: "🌿", bg: "from-sage-100 to-sage-200" },
  { value: "grateful", label: "कृतज्ञ",     emoji: "🙏", color: "#D4704E", flower: "🌸", bg: "from-terracotta-50 to-terracotta-100" },
  { value: "sad",      label: "उदास",       emoji: "😔", color: "#8296B4", flower: "🌧️", bg: "from-stone-lighter to-cream-200" },
  { value: "anxious",  label: "चिंतित",     emoji: "😰", color: "#C4923A", flower: "🌾", bg: "from-amber-light/20 to-cream-200" },
  { value: "loved",    label: "प्यार में",  emoji: "🥰", color: "#D4704E", flower: "🌹", bg: "from-terracotta-50 to-amber-light/30" },
  { value: "tired",    label: "थका हुआ",    emoji: "😴", color: "#A8C8BF", flower: "🌙", bg: "from-sage-50 to-cream-100" },
  { value: "content",  label: "संतुष्ट",    emoji: "😊", color: "#7CAF9E", flower: "🍃", bg: "from-sage-100 to-cream-200" },
];

const AFFIRMATIONS = {
  en: {
    happy:    "That joy you feel is real and beautiful. Keep shining! ☀️",
    calm:     "Your peace is precious. You are doing wonderfully. 🌿",
    grateful: "Gratitude is a superpower. You are rich in love. 💛",
    sad:      "It's okay to feel sad sometimes. You are still loved. 🫂",
    anxious:  "Breathe gently. This feeling will pass. You are safe. 🌬️",
    loved:    "You are surrounded by love, even when it's quiet. 🌹",
    tired:    "Rest is also a form of care. Be gentle with yourself. 🌙",
    content:  "Contentment is a beautiful place to be. Cherish it. 🍃",
  },
  hi: {
    happy:    "जो खुशी आप महसूस कर रहे हैं वह सुंदर है। चमकते रहें! ☀️",
    calm:     "आपकी शांति अनमोल है। आप बहुत अच्छा कर रहे हैं। 🌿",
    grateful: "कृतज्ञता एक महाशक्ति है। आप प्यार से भरपूर हैं। 💛",
    sad:      "कभी-कभी उदास होना ठीक है। आप अभी भी प्यारे हैं। 🫂",
    anxious:  "धीरे सांस लें। यह भावना गुज़र जाएगी। आप सुरक्षित हैं। 🌬️",
    loved:    "आप प्यार से घिरे हैं, भले ही यह शांत हो। 🌹",
    tired:    "आराम भी देखभाल का एक रूप है। खुद के साथ कोमल रहें। 🌙",
    content:  "संतुष्टि एक सुंदर अवस्था है। इसे संजोएं। 🍃",
  },
} as const;

const T = {
  en: {
    title:           "Mood Garden 🌸",
    subtitle:        "How are you feeling right now? Every feeling is welcome here.",
    howFeeling:      "How are you feeling today?",
    notePlaceholder: "Any thoughts you'd like to share? (optional)",
    plant:           "Plant this feeling 🌱",
    planting:        "Planting in your garden…",
    pickMood:        "Please pick a mood first",
    couldNotSave:    "Could not save your mood",
    gardenTitle:     "Your Mood Garden",
    gardenEmpty:     "Your garden is waiting to bloom",
    recentFeelings:  "Recent Feelings",
    newFlower:       "A new flower has bloomed in your garden 🌱",
  },
  hi: {
    title:           "मूड गार्डन 🌸",
    subtitle:        "आप अभी कैसा महसूस कर रहे हैं? हर भावना यहाँ स्वागत है।",
    howFeeling:      "आज आप कैसा महसूस कर रहे हैं?",
    notePlaceholder: "कोई विचार साझा करना चाहते हैं? (वैकल्पिक)",
    plant:           "यह भावना लगाएं 🌱",
    planting:        "आपके बगीचे में लगाया जा रहा है…",
    pickMood:        "कृपया पहले एक मूड चुनें",
    couldNotSave:    "आपका मूड सहेजा नहीं जा सका",
    gardenTitle:     "आपका मूड गार्डन",
    gardenEmpty:     "आपका बगीचा खिलने का इंतज़ार कर रहा है",
    recentFeelings:  "हाल की भावनाएं",
    newFlower:       "आपके बगीचे में एक नया फूल खिला है 🌱",
  },
} as const;

export default function MoodGardenPage() {
  const { lang } = useLanguage();
  const t        = T[lang];
  const MOODS    = lang === "hi" ? MOODS_HI : MOODS_EN;

  const [logs, setLogs]                   = useState<MoodLog[]>([]);
  const [selected, setSelected]           = useState("");
  const [note, setNote]                   = useState("");
  const [loading, setLoading]             = useState(false);
  const [showAffirmation, setShowAffirmation] = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/mood");
      setLogs(await res.json());
    } catch {}
  };

  const saveMood = async () => {
    if (!selected) return toast.error(t.pickMood);
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
      toast.error(t.couldNotSave);
    } finally {
      setLoading(false);
    }
  };

  const gardenFlowers  = logs.slice(0, 12);
  const selectedMood   = MOODS.find((m) => m.value === selected);
  const affirmation    = selected
    ? AFFIRMATIONS[lang][selected as keyof typeof AFFIRMATIONS.en]
    : "";

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">{t.title}</h1>
        <p className="font-body text-stone-light italic mt-1">{t.subtitle}</p>
      </div>

      {/* Affirmation overlay */}
      {showAffirmation && selectedMood && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className={`card-warm p-10 max-w-sm text-center bg-gradient-to-br ${selectedMood.bg} animate-slide-up`}>
            <div className="text-6xl mb-4">{selectedMood.flower}</div>
            <p className="font-display text-xl font-bold text-stone-warm mb-3">{affirmation}</p>
            <p className="font-ui text-sm text-stone-light">{t.newFlower}</p>
          </div>
        </div>
      )}

      {/* Mood picker */}
      <div className="card-warm p-6 mb-8">
        <h2 className="font-ui font-semibold text-stone-warm mb-4">{t.howFeeling}</h2>
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
          placeholder={t.notePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        <button onClick={saveMood} disabled={loading} className="btn-primary w-full">
          {loading ? t.planting : t.plant}
        </button>
      </div>

      {/* Garden */}
      <div className="card-warm p-6 mb-6">
        <h2 className="font-ui font-semibold text-stone-warm mb-4">{t.gardenTitle}</h2>
        {gardenFlowers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🌱</div>
            <p className="font-body text-stone-light italic text-sm">{t.gardenEmpty}</p>
          </div>
        ) : (
          <div className="relative bg-gradient-to-b from-cream-100 to-sage-50 rounded-2xl p-6 min-h-[140px] overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-sage-100 rounded-b-2xl" />
            <div className="flex flex-wrap gap-4 items-end justify-center relative z-10">
              {gardenFlowers.map((log, i) => {
                const mood   = MOODS.find((m) => m.value === log.mood) ?? MOODS_EN.find((m) => m.value === log.mood);
                const height = [40,55,45,60,50,48,52,44,58,46,54,42][i % 12];
                return (
                  <div
                    key={log.id}
                    className="flex flex-col items-center"
                    title={`${mood?.label}: ${new Date(log.createdAt).toLocaleDateString()}`}
                  >
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
          <h2 className="font-ui font-semibold text-stone-warm mb-3">{t.recentFeelings}</h2>
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => {
              const mood = MOODS.find((m) => m.value === log.mood) ?? MOODS_EN.find((m) => m.value === log.mood);
              return (
                <div
                  key={log.id}
                  className={`card-warm p-4 flex items-center gap-3 bg-gradient-to-r ${mood?.bg || "from-cream-100"} border-0`}
                >
                  <span className="text-2xl">{mood?.flower || "🌸"}</span>
                  <div className="flex-1">
                    <span className="font-ui font-medium text-stone-warm">{mood?.label}</span>
                    {log.note && <p className="font-ui text-sm text-stone-light">{log.note}</p>}
                  </div>
                  <span className="font-ui text-xs text-stone-light">
                    {new Date(log.createdAt).toLocaleDateString(
                      lang === "hi" ? "hi-IN" : "en-US",
                      { month: "short", day: "numeric" }
                    )}
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