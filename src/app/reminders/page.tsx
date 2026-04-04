"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Bell, Check, Volume2, Pill, Droplets, ListChecks, Calendar, BellRing, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { showBrowserNotification, startReminderChecker } from "@/lib/notifications";
import { useLanguage } from "@/context/LanguageContext";

type Reminder = {
  id: string;
  title: string;
  description?: string;
  type: string;
  time: string;
  completed: boolean;
};

const TYPE_CONFIG = {
  MEDICATION:  { icon: Pill,       emoji: "💊", color: "text-terracotta-400", bg: "bg-terracotta-50" },
  HYDRATION:   { icon: Droplets,   emoji: "💧", color: "text-sage-500",       bg: "bg-sage-50" },
  TASK:        { icon: ListChecks, emoji: "✅", color: "text-amber-deep",     bg: "bg-amber-light/20" },
  APPOINTMENT: { icon: Calendar,   emoji: "📅", color: "text-stone-warm",     bg: "bg-cream-200" },
  EXERCISE:    { icon: Bell,       emoji: "🏃", color: "text-sage-400",       bg: "bg-sage-50" },
};

const T = {
  en: {
    title:            "Reminders 🔔",
    subtitle:         "Gentle nudges to take care of yourself",
    add:              "Add",
    newReminder:      "New Reminder",
    titlePlaceholder: "e.g. Take morning medication",
    detailsPlaceholder:"Any extra details… (optional)",
    type:             "Type",
    time:             "Time",
    save:             "Save Reminder",
    saving:           "Saving…",
    cancel:           "Cancel",
    upcomingToday:    "Upcoming Today",
    completed:        "Completed 🎉",
    noReminders:      "No reminders yet",
    noRemindersDesc:  "Add one to help yourself stay on track",
    notifActive:      "Push notifications are active — reminders will pop up at their scheduled time",
    notifOff:         "Enable notifications on the dashboard to get pop-up reminders at reminder time",
    pleaseAddTitle:   "Please add a title",
    reminderSet:      "Reminder set! 🔔",
    couldNotSave:     "Could not save reminder",
    wellDone:         "Well done! ✨",
    reading:          "Reading",
    testSent:         "Test notification sent 🔔",
    deleteQ:          "Delete",
    yesDelete:        "Yes, delete",
    keepIt:           "Keep it",
    deleted:          "Reminder deleted",
    couldNotDelete:   "Could not delete reminder",
    typeLabels: {
      MEDICATION:  "Medication",
      HYDRATION:   "Hydration",
      TASK:        "Task",
      APPOINTMENT: "Appointment",
      EXERCISE:    "Exercise",
    },
  },
  hi: {
    title:            "अनुस्मारक 🔔",
    subtitle:         "खुद का ख्याल रखने के लिए सौम्य याद दिलाना",
    add:              "जोड़ें",
    newReminder:      "नया अनुस्मारक",
    titlePlaceholder: "जैसे: सुबह की दवा लें",
    detailsPlaceholder:"कोई अतिरिक्त विवरण… (वैकल्पिक)",
    type:             "प्रकार",
    time:             "समय",
    save:             "अनुस्मारक सहेजें",
    saving:           "सहेजा जा रहा है…",
    cancel:           "रद्द करें",
    upcomingToday:    "आज के आगामी",
    completed:        "पूर्ण हो गया 🎉",
    noReminders:      "अभी कोई अनुस्मारक नहीं",
    noRemindersDesc:  "एक जोड़ें ताकि आप ट्रैक पर रहें",
    notifActive:      "पुश सूचनाएं सक्रिय हैं — अनुस्मारक निर्धारित समय पर दिखेंगे",
    notifOff:         "पॉप-अप अनुस्मारक के लिए डैशबोर्ड पर सूचनाएं चालू करें",
    pleaseAddTitle:   "कृपया शीर्षक जोड़ें",
    reminderSet:      "अनुस्मारक सेट हो गया! 🔔",
    couldNotSave:     "अनुस्मारक सहेजा नहीं जा सका",
    wellDone:         "बहुत बढ़िया! ✨",
    reading:          "पढ़ रहे हैं",
    testSent:         "परीक्षण सूचना भेजी गई 🔔",
    deleteQ:          "हटाएं",
    yesDelete:        "हाँ, हटाएं",
    keepIt:           "रखें",
    deleted:          "अनुस्मारक हटा दिया गया",
    couldNotDelete:   "अनुस्मारक हटाया नहीं जा सका",
    typeLabels: {
      MEDICATION:  "दवा",
      HYDRATION:   "पानी",
      TASK:        "कार्य",
      APPOINTMENT: "अपॉइंटमेंट",
      EXERCISE:    "व्यायाम",
    },
  },
} as const;

export default function RemindersPage() {
  const { lang } = useLanguage();
  const t = T[lang];

  const [reminders, setReminders]   = useState<Reminder[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm]             = useState({ title: "", description: "", type: "MEDICATION", time: "08:00" });
  const [notifEnabled, setNotifEnabled] = useState(false);
  const checkerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchReminders();
    if ("Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    if (reminders.length === 0) return;
    if (checkerRef.current) clearInterval(checkerRef.current);
    checkerRef.current = startReminderChecker(reminders);
    return () => { if (checkerRef.current) clearInterval(checkerRef.current); };
  }, [reminders]);

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      setReminders(await res.json());
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.title) return toast.error(t.pleaseAddTitle);
    setLoading(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(t.reminderSet);
      if (notifEnabled) {
        showBrowserNotification("✅ " + t.reminderSet, `"${form.title}"`, "/reminders");
      }
      setForm({ title: "", description: "", type: "MEDICATION", time: "08:00" });
      setShowForm(false);
      fetchReminders();
    } catch {
      toast.error(t.couldNotSave);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!completed) {
        toast.success(t.wellDone);
        const u = new SpeechSynthesisUtterance(
          lang === "hi"
            ? "बहुत बढ़िया! आपने आज एक काम पूरा किया।"
            : "Well done! You've completed a task today."
        );
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
      fetchReminders();
    } catch {}
  };

  const deleteReminder = async (id: string, title: string) => {
    toast((t2) => (
      <div className="flex flex-col gap-3">
        <p className="font-ui text-sm text-stone-warm">
          {t.deleteQ} <strong>"{title}"</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t2.id);
              setDeletingId(id);
              try {
                const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error();
                toast.success(t.deleted);
                fetchReminders();
              } catch {
                toast.error(t.couldNotDelete);
              } finally {
                setDeletingId(null);
              }
            }}
            className="bg-terracotta text-white text-xs font-ui font-medium px-3 py-1.5 rounded-xl"
          >
            {t.yesDelete}
          </button>
          <button
            onClick={() => toast.dismiss(t2.id)}
            className="bg-cream-200 text-stone-warm text-xs font-ui font-medium px-3 py-1.5 rounded-xl"
          >
            {t.keepIt}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const speakReminder = (r: Reminder) => {
    const text = lang === "hi"
      ? `अनुस्मारक: ${r.title}. ${r.description || ""}`
      : `Reminder: ${r.title}. ${r.description || ""}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = lang === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(u);
    toast(`${t.reading}: ${r.title} 🔊`);
  };

  const testNotification = (r: Reminder) => {
    const emoji = (TYPE_CONFIG as Record<string, { emoji: string }>)[r.type]?.emoji || "🔔";
    showBrowserNotification(`${emoji} ${r.title}`, r.description || "", "/reminders");
    toast(t.testSent);
  };

  const grouped = reminders.reduce((acc, r) => {
    const key = r.completed ? "done" : "upcoming";
    acc[key] = [...(acc[key] || []), r];
    return acc;
  }, {} as Record<string, Reminder[]>);

  const DeleteButton = ({ id, title }: { id: string; title: string }) => (
    <button
      onClick={() => deleteReminder(id, title)}
      disabled={deletingId === id}
      title={t.deleteQ}
      className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-40"
    >
      {deletingId === id ? <span className="text-xs">…</span> : <Trash2 size={15} />}
    </button>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">{t.title}</h1>
          <p className="font-body text-stone-light italic mt-1">{t.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          {t.add}
        </button>
      </div>

      {/* Notification status */}
      {notifEnabled ? (
        <div className="bg-sage/10 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-sage/20">
          <span className="text-xl">🔔</span>
          <p className="font-ui text-sm text-sage-500 font-medium flex-1">{t.notifActive}</p>
        </div>
      ) : (
        <div className="bg-amber-light/20 rounded-2xl p-4 mb-6 flex items-center gap-3 border border-amber-warm/30">
          <BellRing className="text-amber-deep flex-shrink-0" size={20} />
          <p className="font-ui text-sm text-stone-warm flex-1">{t.notifOff}</p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">{t.newReminder}</h2>
          <div className="space-y-4">
            <input
              className="input-warm"
              placeholder={t.titlePlaceholder}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input-warm"
              placeholder={t.detailsPlaceholder}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">{t.type}</label>
                <select
                  className="input-warm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {Object.keys(TYPE_CONFIG).map((key) => (
                    <option key={key} value={key}>
                      {(TYPE_CONFIG as Record<string, { emoji: string }>)[key].emoji}{" "}
                      {t.typeLabels[key as keyof typeof t.typeLabels]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">{t.time}</label>
                <input
                  type="time"
                  className="input-warm"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm py-2">
                {loading ? t.saving : t.save}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {(grouped.upcoming || []).length > 0 && (
        <div className="mb-6">
          <h2 className="font-ui font-semibold text-stone-warm mb-3">{t.upcomingToday}</h2>
          <div className="space-y-3">
            {(grouped.upcoming || []).map((r) => {
              const config = (TYPE_CONFIG as Record<string, { emoji: string; bg: string; color: string }>)[r.type] || TYPE_CONFIG.TASK;
              return (
                <div key={r.id} className="card-warm p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {config.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-ui font-medium text-stone-warm">{r.title}</p>
                    {r.description && (
                      <p className="font-ui text-sm text-stone-light">{r.description}</p>
                    )}
                    <p className="font-ui text-xs text-stone-light mt-0.5">⏰ {r.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {notifEnabled && (
                      <button
                        onClick={() => testNotification(r)}
                        title="Test notification"
                        className="w-9 h-9 bg-amber-light/30 rounded-xl flex items-center justify-center text-amber-deep hover:bg-amber-light/50 transition-colors"
                      >
                        <BellRing size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => speakReminder(r)}
                      className="w-9 h-9 bg-sage/10 rounded-xl flex items-center justify-center text-sage-500 hover:bg-sage/20 transition-colors"
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      onClick={() => toggleComplete(r.id, r.completed)}
                      className="w-9 h-9 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                    <DeleteButton id={r.id} title={r.title} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {(grouped.done || []).length > 0 && (
        <div>
          <h2 className="font-ui font-semibold text-stone-light mb-3">{t.completed}</h2>
          <div className="space-y-3 opacity-60">
            {(grouped.done || []).map((r) => (
              <div key={r.id} className="card-warm p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-sage/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">✅</div>
                <div className="flex-1">
                  <p className="font-ui font-medium text-stone-warm line-through">{r.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleComplete(r.id, r.completed)}
                    className="w-9 h-9 bg-cream-200 rounded-xl flex items-center justify-center text-stone-light hover:text-stone-warm transition-colors"
                  >
                    <Check size={15} />
                  </button>
                  <DeleteButton id={r.id} title={r.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {reminders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <p className="font-display text-xl text-stone-warm mb-2">{t.noReminders}</p>
          <p className="font-body text-stone-light italic">{t.noRemindersDesc}</p>
        </div>
      )}
    </div>
  );
}