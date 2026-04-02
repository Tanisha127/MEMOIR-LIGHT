"use client";
import { useState, useEffect } from "react";
import { Plus, Bell, Check, Volume2, Pill, Droplets, ListChecks, Calendar } from "lucide-react";
import toast from "react-hot-toast";

type Reminder = {
  id: string;
  title: string;
  description?: string;
  type: string;
  time: string;
  completed: boolean;
};

const TYPE_CONFIG = {
  MEDICATION: { icon: Pill, emoji: "💊", color: "text-terracotta-400", bg: "bg-terracotta-50" },
  HYDRATION: { icon: Droplets, emoji: "💧", color: "text-sage-500", bg: "bg-sage-50" },
  TASK: { icon: ListChecks, emoji: "✅", color: "text-amber-deep", bg: "bg-amber-light/20" },
  APPOINTMENT: { icon: Calendar, emoji: "📅", color: "text-stone-warm", bg: "bg-cream-200" },
  EXERCISE: { icon: Bell, emoji: "🏃", color: "text-sage-400", bg: "bg-sage-50" },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "MEDICATION", time: "08:00" });

  useEffect(() => { fetchReminders(); }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      setReminders(await res.json());
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Please add a title");
    setLoading(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Reminder set! 🔔");
      setForm({ title: "", description: "", type: "MEDICATION", time: "08:00" });
      setShowForm(false);
      fetchReminders();
    } catch {
      toast.error("Could not save reminder");
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
        toast.success("Well done! ✨");
        speakCongrats();
      }
      fetchReminders();
    } catch {}
  };

  const speakCongrats = () => {
    const u = new SpeechSynthesisUtterance("Well done! You've completed a task today.");
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const speakReminder = (r: Reminder) => {
    const u = new SpeechSynthesisUtterance(`Reminder: ${r.title}. ${r.description || ""}`);
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
    toast(`Reading: ${r.title} 🔊`);
  };

  const grouped = reminders.reduce((acc, r) => {
    const key = r.completed ? "done" : "upcoming";
    acc[key] = [...(acc[key] || []), r];
    return acc;
  }, {} as Record<string, Reminder[]>);

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">Reminders 🔔</h1>
          <p className="font-body text-stone-light italic mt-1">
            Gentle nudges to take care of yourself
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add
        </button>
      </div>

      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">New Reminder</h2>
          <div className="space-y-4">
            <input
              className="input-warm"
              placeholder="e.g. Take morning medication"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input-warm"
              placeholder="Any extra details… (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">Type</label>
                <select className="input-warm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {Object.keys(TYPE_CONFIG).map((t) => (
                    <option key={t} value={t}>{(TYPE_CONFIG as Record<string, {emoji: string}>)[t].emoji} {t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-ui text-xs font-medium text-stone-warm mb-1.5">Time</label>
                <input type="time" className="input-warm" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm py-2">
                {loading ? "Saving…" : "Save Reminder"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {(grouped.upcoming || []).length > 0 && (
        <div className="mb-6">
          <h2 className="font-ui font-semibold text-stone-warm mb-3">Upcoming Today</h2>
          <div className="space-y-3">
            {(grouped.upcoming || []).map((r) => {
              const config = (TYPE_CONFIG as Record<string, {emoji: string; bg: string; color: string}>)[r.type] || TYPE_CONFIG.TASK;
              return (
                <div key={r.id} className={`card-warm p-4 flex items-center gap-4`}>
                  <div className={`w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {config.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-ui font-medium text-stone-warm">{r.title}</p>
                    {r.description && <p className="font-ui text-sm text-stone-light">{r.description}</p>}
                    <p className="font-ui text-xs text-stone-light mt-0.5">{r.time}</p>
                  </div>
                  <div className="flex gap-2">
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
          <h2 className="font-ui font-semibold text-stone-light mb-3">Completed 🎉</h2>
          <div className="space-y-3 opacity-60">
            {(grouped.done || []).map((r) => (
              <div key={r.id} className="card-warm p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-sage/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  ✅
                </div>
                <div className="flex-1">
                  <p className="font-ui font-medium text-stone-warm line-through">{r.title}</p>
                </div>
                <button
                  onClick={() => toggleComplete(r.id, r.completed)}
                  className="w-9 h-9 bg-cream-200 rounded-xl flex items-center justify-center text-stone-light hover:text-stone-warm transition-colors"
                >
                  <Check size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <p className="font-display text-xl text-stone-warm mb-2">No reminders yet</p>
          <p className="font-body text-stone-light italic">Add one to help yourself stay on track</p>
        </div>
      )}
    </div>
  );
}
