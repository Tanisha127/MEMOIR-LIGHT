"use client";
import { useState, useEffect } from "react";
import { Phone, Plus, AlertTriangle, Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Contact = { id: string; name: string; phone: string; relation: string };

export default function EmergencyPage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", phone: "", relation: "" });
  const [alertSent, setAlertSent] = useState(false);

  const labels = {
    pageTitle:      isHi ? "आपातकाल 🆘"                              : "Emergency 🆘",
    pageSubtitle:   isHi ? "मदद हमेशा पास है। आप अकेले नहीं हैं।"   : "Help is always close. You are never alone.",
    helpNow:        isHi ? "अगर आपको अभी मदद चाहिए:"               : "If you need help right now:",
    sent:           isHi ? "भेज दिया!"                               : "Sent!",
    help:           isHi ? "मदद"                                     : "HELP",
    pressMe:        isHi ? "दबाएं"                                   : "Press me",
    notified:       isHi ? "आपके संपर्कों को तुरंत सूचित किया जाएगा" : "Your contacts will be notified immediately",
    contactsTitle:  isHi ? "आपातकालीन संपर्क"                       : "Emergency Contacts",
    addBtn:         isHi ? "जोड़ें"                                   : "Add",
    namePlaceholder: isHi ? "नाम"                                    : "Name",
    phonePlaceholder: isHi ? "फ़ोन नंबर"                             : "Phone number",
    relationPlaceholder: isHi ? "संबंध (जैसे बेटी)"                 : "Relationship (e.g. Daughter)",
    save:           isHi ? "सहेजें"                                  : "Save",
    cancel:         isHi ? "रद्द करें"                               : "Cancel",
    emptyContacts:  isHi ? "किसी ऐसे व्यक्ति को जोड़ें जो मदद कर सके" : "Add someone who can help you in an emergency",
    alertSuccess:   isHi ? "आपातकालीन संपर्कों को अलर्ट भेजा गया 🆘" : "Alert sent to your emergency contacts 🆘",
    addSuccess:     isHi ? "संपर्क जोड़ा गया 💛"                     : "added as emergency contact 💛",
    saveError:      isHi ? "संपर्क सहेजा नहीं जा सका"               : "Could not save contact",
    fillFields:     isHi ? "नाम और फ़ोन नंबर भरें"                  : "Please fill name and phone",
    callBtn:        isHi ? "कॉल करें"                                : "Call",
    deleteBtn:      isHi ? "हटाएं"                                   : "Remove",
    confirmDelete:  isHi ? "क्या आप इस संपर्क को हटाना चाहते हैं?" : "Remove this contact?",
    deleteSuccess:  isHi ? "संपर्क हटाया गया"                       : "Contact removed",
  };

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/emergency");
      setContacts(await res.json());
    } catch {}
  };

  const handleAdd = async () => {
    if (!form.name || !form.phone) return toast.error(labels.fillFields);
    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(`${form.name} ${labels.addSuccess}`);
      setForm({ name: "", phone: "", relation: "" });
      setShowForm(false);
      fetchContacts();
    } catch {
      toast.error(labels.saveError);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(labels.confirmDelete)) return;
    try {
      await fetch("/api/emergency", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success(labels.deleteSuccess);
      fetchContacts();
    } catch {}
  };

  const sendAlert = () => {
    setAlertSent(true);
    toast.success(labels.alertSuccess);
    const msg = isHi
      ? "मदद का संकेत भेजा गया। शांत रहें। आपके परिवार को सूचित किया गया है।"
      : "Help alert sent. Stay calm. Your family has been notified.";
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 0.85;
    u.lang = isHi ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(u);
    setTimeout(() => setAlertSent(false), 5000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">{labels.pageTitle}</h1>
        <p className="font-body text-stone-light italic mt-1">{labels.pageSubtitle}</p>
      </div>

      {/* Big SOS button */}
      <div className="card-warm p-8 mb-8 text-center bg-gradient-to-br from-terracotta-50 to-terracotta-100 border-0">
        <p className="font-ui text-sm font-medium text-terracotta-400 mb-4">{labels.helpNow}</p>
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
              <span className="font-ui font-bold text-sm">{labels.sent}</span>
            </>
          ) : (
            <>
              <AlertTriangle size={32} className="mb-1" />
              <span className="font-ui font-bold text-lg">{labels.help}</span>
              <span className="font-ui text-xs opacity-80">{labels.pressMe}</span>
            </>
          )}
        </button>
        <p className="font-body text-stone-warm text-sm mt-4 italic">{labels.notified}</p>
      </div>

      {/* Contacts section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-ui font-semibold text-stone-warm">{labels.contactsTitle}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm py-2 flex items-center gap-1.5"
        >
          <Plus size={15} />
          {labels.addBtn}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-warm p-5 mb-5 animate-slide-up">
          <div className="space-y-3">
            <input
              className="input-warm"
              placeholder={labels.namePlaceholder}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input-warm"
              placeholder={labels.phonePlaceholder}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              type="tel"
            />
            <input
              className="input-warm"
              placeholder={labels.relationPlaceholder}
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            />
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm py-2">{labels.save}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">{labels.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact list */}
      <div className="space-y-3">
        {contacts.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📞</div>
            <p className="font-body text-stone-light italic">{labels.emptyContacts}</p>
          </div>
        )}
        {contacts.map((c) => (
          <div key={c.id} className="card-warm p-4 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-terracotta/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Phone className="text-terracotta" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-ui font-semibold text-stone-warm">{c.name}</p>
              <p className="font-ui text-sm text-stone-light">{c.relation} · {c.phone}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${c.phone}`}
                title={labels.callBtn}
                className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center text-sage-500 hover:bg-sage hover:text-white transition-all"
              >
                <Phone size={16} />
              </a>
              <button
                onClick={() => handleDelete(c.id)}
                title={labels.deleteBtn}
                className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}