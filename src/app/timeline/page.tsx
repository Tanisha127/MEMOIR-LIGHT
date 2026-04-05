"use client";
import { useState, useEffect } from "react";
import { Plus, Star, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  description: string;
  emoji: string;
};

const SAMPLE_EMOJIS = ["🎂", "🎓", "💍", "👶", "🏠", "✈️", "🎉", "🏆", "🌟", "❤️", "📚", "🎵"];

export default function TimelinePage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ year: "", title: "", description: "", emoji: "🌟" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const labels = {
    pageTitle:    isHi ? "जीवन की यात्रा 🗺️"                          : "Life Timeline 🗺️",
    pageSubtitle: isHi ? "आपके जीवन की सुंदर कहानी"                    : "The beautiful story of your life",
    addBtn:       isHi ? "पल जोड़ें"                                    : "Add Moment",
    formTitle:    isHi ? "एक जीवन का पल जोड़ें"                        : "Add a Life Moment",
    yearLabel:    isHi ? "वर्ष"                                         : "Year",
    yearPlaceholder: isHi ? "जैसे 1985"                                 : "e.g. 1985",
    emojiLabel:   isHi ? "इमोजी चुनें"                                  : "Choose an emoji",
    titlePlaceholder: isHi ? "इस पल का शीर्षक"                         : "Title of this moment",
    descPlaceholder: isHi ? "कहानी बताएं… कैसा लगा? कौन था वहाँ?"      : "Tell the story… how did it feel? Who was there?",
    saveBtn:      isHi ? "समयरेखा में जोड़ें"                           : "Add to Timeline",
    saving:       isHi ? "सहेज रहा है…"                                 : "Saving…",
    cancel:       isHi ? "रद्द करें"                                    : "Cancel",
    loading:      isHi ? "आपकी जीवन कहानी लोड हो रही है…"              : "Loading your life story…",
    emptyTitle:   isHi ? "आपकी समयरेखा खाली है"                        : "Your timeline is empty",
    emptyDesc:    isHi ? "पहला पल जोड़ें — जन्मदिन, शादी, कोई यात्रा…" : "Start by adding your first life moment — your birthday, a wedding, a special trip…",
    emptyBtn:     isHi ? "पहला पल जोड़ें"                              : "Add Your First Moment",
    removeTitle:  isHi ? "समयरेखा से हटाएं?"                           : "Remove from timeline?",
    removed:      isHi ? "समयरेखा से हटाया गया"                        : "Removed from timeline",
    removeError:  isHi ? "हटाया नहीं जा सका"                           : "Could not remove",
    saveError:    isHi ? "सहेजा नहीं जा सका। फिर कोशिश करें।"         : "Could not save. Please try again.",
    loadError:    isHi ? "समयरेखा लोड नहीं हो सकी"                    : "Could not load timeline",
    addSuccess:   isHi ? "पल समयरेखा में जुड़ गया 🌟"                  : "Memory added to your timeline 🌟",
    validYear:    isHi ? "कृपया सही वर्ष दर्ज करें"                    : "Please enter a valid year",
    fillFields:   isHi ? "वर्ष और शीर्षक भरें"                         : "Please fill in year and title",
    todayLabel:   isHi ? "आज"                                           : "Today",
    todayTitle:   isHi ? "आप यहाँ हैं 💛"                              : "You are here 💛",
    todayDesc:    isHi ? "हर दिन जो आप जागते हैं, एक नया अध्याय है।"  : "Every day you wake up is another chapter worth writing.",
  };

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/timeline");
      const data = await res.json();
      setEntries(data.sort((a: TimelineEntry, b: TimelineEntry) =>
        parseInt(a.year) - parseInt(b.year)
      ));
    } catch {
      toast.error(labels.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.year || !form.title) return toast.error(labels.fillFields);
    if (parseInt(form.year) < 1900 || parseInt(form.year) > new Date().getFullYear()) {
      return toast.error(labels.validYear);
    }
    setSaving(true);
    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(labels.addSuccess);
      setForm({ year: "", title: "", description: "", emoji: "🌟" });
      setShowForm(false);
      fetchEntries();
    } catch {
      toast.error(labels.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${labels.removeTitle}\n"${title}"`)) return;
    try {
      await fetch("/api/timeline", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success(labels.removed);
      fetchEntries();
    } catch {
      toast.error(labels.removeError);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">{labels.pageTitle}</h1>
          <p className="font-body text-stone-light italic mt-1">{labels.pageSubtitle}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          {labels.addBtn}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">{labels.formTitle}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">{labels.yearLabel}</label>
                <input
                  className="input-warm"
                  placeholder={labels.yearPlaceholder}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">{labels.emojiLabel}</label>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`text-xl p-1 rounded-lg transition-all ${
                        form.emoji === e ? "bg-terracotta/15 scale-110" : "hover:bg-cream-200"
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
              placeholder={labels.titlePlaceholder}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input-warm"
              placeholder={labels.descPlaceholder}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm py-2 flex items-center gap-2">
                {saving ? <><Loader size={14} className="animate-spin" /> {labels.saving}</> : labels.saveBtn}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">{labels.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <Loader className="animate-spin text-sage mx-auto mb-3" size={32} />
          <p className="font-body text-stone-light italic">{labels.loading}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="font-display text-xl text-stone-warm mb-2">{labels.emptyTitle}</p>
          <p className="font-body text-stone-light italic mb-6">{labels.emptyDesc}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus size={18} />
            {labels.emptyBtn}
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
                    <button
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-terracotta/10 rounded-lg flex items-center justify-center text-terracotta hover:bg-terracotta/20"
                      title={isHi ? "हटाएं" : "Remove"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
              <span className="font-ui text-sm font-bold text-terracotta bg-terracotta/10 px-3 py-0.5 rounded-full">
                {labels.todayLabel}
              </span>
              <h3 className="font-display text-lg font-semibold text-stone-warm mt-2 mb-1">{labels.todayTitle}</h3>
              <p className="font-body text-stone-warm text-sm">{labels.todayDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}