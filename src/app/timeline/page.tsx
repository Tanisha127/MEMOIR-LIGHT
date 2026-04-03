"use client";
import { useState, useEffect } from "react";
import { Plus, Star, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";

type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  description: string;
  emoji: string;
};

const SAMPLE_EMOJIS = ["🎂", "🎓", "💍", "👶", "🏠", "✈️", "🎉", "🏆", "🌟", "❤️", "📚", "🎵"];

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ year: "", title: "", description: "", emoji: "🌟" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/timeline");
      const data = await res.json();
      // Sort by year ascending
      setEntries(data.sort((a: TimelineEntry, b: TimelineEntry) =>
        parseInt(a.year) - parseInt(b.year)
      ));
    } catch {
      toast.error("Could not load timeline");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.year || !form.title) return toast.error("Please fill in year and title");
    if (parseInt(form.year) < 1900 || parseInt(form.year) > new Date().getFullYear()) {
      return toast.error("Please enter a valid year");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Memory added to your timeline 🌟");
      setForm({ year: "", title: "", description: "", emoji: "🌟" });
      setShowForm(false);
      fetchEntries();
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from your timeline?`)) return;
    try {
      await fetch("/api/timeline", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Removed from timeline");
      fetchEntries();
    } catch {
      toast.error("Could not remove");
    }
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Moment
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">
            Add a Life Moment
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">
                  Year
                </label>
                <input
                  className="input-warm"
                  placeholder="e.g. 1985"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">
                  Choose an emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`text-xl p-1 rounded-lg transition-all ${
                        form.emoji === e
                          ? "bg-terracotta/15 scale-110"
                          : "hover:bg-cream-200"
                      }`}
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
              <button
                onClick={handleAdd}
                disabled={saving}
                className="btn-primary text-sm py-2 flex items-center gap-2"
              >
                {saving ? (
                  <><Loader size={14} className="animate-spin" /> Saving…</>
                ) : (
                  "Add to Timeline"
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary text-sm py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <Loader className="animate-spin text-sage mx-auto mb-3" size={32} />
          <p className="font-body text-stone-light italic">Loading your life story…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="font-display text-xl text-stone-warm mb-2">Your timeline is empty</p>
          <p className="font-body text-stone-light italic mb-6">
            Start by adding your first life moment — your birthday, a wedding, a special trip…
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Add Your First Moment
          </button>
        </div>
      )}

      {/* Timeline */}
      {!loading && entries.length > 0 && (
        <div className="relative timeline-line pl-14">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="relative mb-8 animate-fade-in group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
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
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-warm opacity-60" />
                    {/* Delete button — shows on hover */}
                    <button
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-terracotta/10 rounded-lg flex items-center justify-center text-terracotta hover:bg-terracotta/20"
                      title="Remove from timeline"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-warm mb-2">
                  {entry.title}
                </h3>
                <p className="font-body text-stone-warm leading-relaxed text-sm">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}

          {/* Present — always at bottom */}
          <div className="relative">
            <div className="absolute -left-14 top-1 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-xl shadow-warm animate-pulse-warm">
                <span>🌟</span>
              </div>
            </div>
            <div className="card-warm p-5 bg-gradient-to-br from-terracotta-50 to-amber-light/20 border-terracotta/20">
              <span className="font-ui text-sm font-bold text-terracotta bg-terracotta/10 px-3 py-0.5 rounded-full">
                Today
              </span>
              <h3 className="font-display text-lg font-semibold text-stone-warm mt-2 mb-1">
                You are here 💛
              </h3>
              <p className="font-body text-stone-warm text-sm">
                Every day you wake up is another chapter worth writing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}