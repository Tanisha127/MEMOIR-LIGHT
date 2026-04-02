"use client";
import { useState, useEffect } from "react";
import { Phone, Plus, AlertTriangle, Heart } from "lucide-react";
import toast from "react-hot-toast";

type Contact = { id: string; name: string; phone: string; relation: string };

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/emergency");
      setContacts(await res.json());
    } catch {}
  };

  const handleAdd = async () => {
    if (!form.name || !form.phone) return toast.error("Please fill name and phone");
    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(`${form.name} added as emergency contact 💛`);
      setForm({ name: "", phone: "", relation: "" });
      setShowForm(false);
      fetchContacts();
    } catch {
      toast.error("Could not save contact");
    }
  };

  const sendAlert = () => {
    setAlertSent(true);
    toast.success("Alert sent to your emergency contacts 🆘");
    const u = new SpeechSynthesisUtterance("Help alert sent. Stay calm. Your family has been notified.");
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
    setTimeout(() => setAlertSent(false), 5000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">Emergency 🆘</h1>
        <p className="font-body text-stone-light italic mt-1">Help is always close. You are never alone.</p>
      </div>

      {/* Big SOS button */}
      <div className="card-warm p-8 mb-8 text-center bg-gradient-to-br from-terracotta-50 to-terracotta-100 border-0">
        <p className="font-ui text-sm font-medium text-terracotta-400 mb-4">If you need help right now:</p>
        <button
          onClick={sendAlert}
          className={`w-36 h-36 rounded-full mx-auto flex flex-col items-center justify-center shadow-warm-lg transition-all duration-300 ${
            alertSent
              ? "bg-sage text-white scale-95"
              : "bg-terracotta text-white hover:bg-terracotta-500 animate-pulse-warm"
          }`}
        >
          {alertSent ? (
            <>
              <Heart size={32} className="mb-1" />
              <span className="font-ui font-bold text-sm">Sent!</span>
            </>
          ) : (
            <>
              <AlertTriangle size={32} className="mb-1" />
              <span className="font-ui font-bold text-lg">HELP</span>
              <span className="font-ui text-xs opacity-80">Press me</span>
            </>
          )}
        </button>
        <p className="font-body text-stone-warm text-sm mt-4 italic">
          Your contacts will be notified immediately
        </p>
      </div>

      {/* Contacts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-ui font-semibold text-stone-warm">Emergency Contacts</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 flex items-center gap-1.5">
          <Plus size={15} />
          Add
        </button>
      </div>

      {showForm && (
        <div className="card-warm p-5 mb-5 animate-slide-up">
          <div className="space-y-3">
            <input className="input-warm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input-warm" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" />
            <input className="input-warm" placeholder="Relationship (e.g. Daughter)" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm py-2">Save</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📞</div>
            <p className="font-body text-stone-light italic">Add someone who can help you in an emergency</p>
          </div>
        )}
        {contacts.map((c) => (
          <div key={c.id} className="card-warm p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              <Phone className="text-terracotta" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-ui font-semibold text-stone-warm">{c.name}</p>
              <p className="font-ui text-sm text-stone-light">{c.relation} · {c.phone}</p>
            </div>
            <a
              href={`tel:${c.phone}`}
              className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center text-sage-500 hover:bg-sage hover:text-white transition-all"
            >
              <Phone size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
