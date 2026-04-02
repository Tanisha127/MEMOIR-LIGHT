"use client";
import { useState, useEffect } from "react";
import { Plus, Volume2, Heart } from "lucide-react";
import toast from "react-hot-toast";

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  photo?: string;
  notes?: string;
  voiceNote?: string;
};

const RELATIONS = ["Parent", "Child", "Sibling", "Spouse", "Grandchild", "Friend", "Caregiver", "Other"];

const AVATAR_COLORS = [
  "from-terracotta-200 to-terracotta-300",
  "from-sage-200 to-sage-300",
  "from-amber-light to-amber-warm",
  "from-stone-lighter to-stone-light",
];

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState({ name: "", relation: "", notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/family");
      const data = await res.json();
      setMembers(data);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.name) return toast.error("Please enter a name");
    setLoading(true);
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(`${form.name} added to your family 💛`);
      setForm({ name: "", relation: "", notes: "" });
      setShowForm(false);
      fetchMembers();
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const speakIntro = (member: FamilyMember) => {
    const text = `This is ${member.name}, your ${member.relation}. ${member.notes || ""}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    toast(`Introducing ${member.name} 🔊`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">My Family 👨‍👩‍👧</h1>
          <p className="font-body text-stone-light italic mt-1">
            The people who love you and care for you
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">Add a Family Member</h2>
          <div className="space-y-4">
            <input
              className="input-warm"
              placeholder="Their name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="input-warm"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            >
              <option value="">Select relationship…</option>
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea
              className="input-warm"
              placeholder="A little note about them: where they live, what they love, a happy memory…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm py-2">
                {loading ? "Saving…" : "Add to Family 💛"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-warm p-8 max-w-sm w-full animate-slide-up">
            <div className="text-center mb-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${AVATAR_COLORS[0]} flex items-center justify-center text-4xl mx-auto mb-4 shadow-warm`}>
                {selected.photo ? (
                  <img src={selected.photo} className="w-full h-full rounded-full object-cover" alt={selected.name} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-warm">{selected.name}</h2>
              <p className="font-ui text-stone-light">{selected.relation}</p>
            </div>
            {selected.notes && (
              <div className="bg-cream-100 rounded-2xl p-4 mb-5">
                <p className="font-body text-stone-warm text-sm leading-relaxed">{selected.notes}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => speakIntro(selected)}
                className="btn-sage flex items-center gap-2 flex-1 justify-center text-sm py-2.5"
              >
                <Volume2 size={16} />
                Hear Introduction
              </button>
              <button
                onClick={() => setSelected(null)}
                className="btn-secondary flex-1 text-sm py-2.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {members.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <p className="font-display text-xl text-stone-warm mb-2">Your family gallery awaits</p>
          <p className="font-body text-stone-light italic">Add the people who matter most to you</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="card-warm p-5 flex flex-col items-center text-center group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-2xl mb-3 shadow-soft group-hover:shadow-warm transition-shadow`}>
                {m.photo ? (
                  <img src={m.photo} className="w-full h-full rounded-full object-cover" alt={m.name} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <p className="font-ui font-semibold text-stone-warm text-sm">{m.name}</p>
              <p className="font-ui text-xs text-stone-light">{m.relation}</p>
              <Heart size={12} className="text-terracotta/40 mt-2 group-hover:text-terracotta transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
