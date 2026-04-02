"use client";
import { useState } from "react";
import { Plus, Star } from "lucide-react";
import toast from "react-hot-toast";

type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  description: string;
  emoji: string;
  photo?: string;
};

const SAMPLE_EMOJIS = ["🎂", "🎓", "💍", "👶", "🏠", "✈️", "🎉", "🏆", "🌟", "❤️", "📚", "🎵"];

const SAMPLE_ENTRIES: TimelineEntry[] = [
  { id: "1", year: "1955", title: "Born in a small town", description: "A beautiful spring morning welcomed me into the world.", emoji: "🎂" },
  { id: "2", year: "1973", title: "Graduated from university", description: "Years of hard work paid off. My family was so proud.", emoji: "🎓" },
  { id: "3", year: "1979", title: "Got married", description: "The happiest day of my life. We danced until midnight.", emoji: "💍" },
  { id: "4", year: "1982", title: "First child born", description: "Nothing prepares you for that kind of love.", emoji: "👶" },
];

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>(SAMPLE_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ year: "", title: "", description: "", emoji: "🌟" });

  const handleAdd = () => {
    if (!form.year || !form.title) return toast.error("Please fill in year and title");
    const newEntry: TimelineEntry = { id: Date.now().toString(), ...form };
    setEntries([...entries, newEntry].sort((a, b) => parseInt(a.year) - parseInt(b.year)));
    setForm({ year: "", title: "", description: "", emoji: "🌟" });
    setShowForm(false);
    toast.success("Memory added to your timeline 🌟");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">Life Timeline 🗺️</h1>
          <p className="font-body text-stone-light italic mt-1">
            The beautiful story of your life
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Moment
        </button>
      </div>

      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">Add a Life Moment</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                className="input-warm"
                placeholder="Year (e.g. 1985)"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                type="number"
                min="1900" max="2025"
              />
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">Choose an emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`text-xl p-1 rounded-lg transition-all ${form.emoji === e ? "bg-terracotta/15 scale-110" : "hover:bg-cream-200"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              className="input-warm"
              placeholder="Title of this moment"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input-warm"
              placeholder="Tell the story… how did it feel? Who was there?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm py-2">Add to Timeline</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative timeline-line pl-14">
        {entries.map((entry, i) => (
          <div key={entry.id} className="relative mb-8 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {/* Dot */}
            <div className="absolute -left-14 top-1 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-sage-200 flex items-center justify-center text-xl shadow-soft z-10">
                {entry.emoji}
              </div>
            </div>

            <div className="card-warm p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="font-ui text-sm font-bold text-terracotta bg-terracotta/10 px-3 py-0.5 rounded-full">
                  {entry.year}
                </span>
                <Star size={14} className="text-amber-warm opacity-60" />
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-warm mb-2">{entry.title}</h3>
              <p className="font-body text-stone-warm leading-relaxed text-sm">{entry.description}</p>
            </div>
          </div>
        ))}

        {/* Present */}
        <div className="relative">
          <div className="absolute -left-14 top-1 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-xl shadow-warm animate-pulse-warm">
              <span>🌟</span>
            </div>
          </div>
          <div className="card-warm p-5 bg-gradient-to-br from-terracotta-50 to-amber-light/20 border-terracotta/20">
            <span className="font-ui text-sm font-bold text-terracotta bg-terracotta/10 px-3 py-0.5 rounded-full">Today</span>
            <h3 className="font-display text-lg font-semibold text-stone-warm mt-2 mb-1">You are here 💛</h3>
            <p className="font-body text-stone-warm text-sm">
              Every day you wake up is another chapter worth writing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
