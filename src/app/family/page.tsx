"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Volume2, Heart, Camera, Mic, MicOff, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  photo?: string;
  notes?: string;
  voiceNote?: string;
};

const AVATAR_COLORS = [
  "from-terracotta-200 to-terracotta-300",
  "from-sage-200 to-sage-300",
  "from-amber-light to-amber-warm",
  "from-stone-lighter to-stone-light",
];

const T = {
  en: {
    title:           "My Family 👨‍👩‍👧",
    subtitle:        "The people who love you and care for you",
    addMember:       "Add Member",
    addTitle:        "Add a Family Member",
    namePlaceholder: "Their name",
    selectRelation:  "Select relationship…",
    notesPlaceholder:"A little note about them: where they live, what they love, a happy memory…",
    photo:           "Their Photo",
    optional:        "(optional)",
    clickPhoto:      "Click to upload a photo",
    photoHint:       "JPG, PNG · Max 2MB",
    photoTooBig:     "Photo must be under 2MB",
    voiceNote:       "Their Voice Note",
    voiceHint:       "Record them saying something — their name, a greeting, or 'I love you'",
    startRecording:  "Start Recording",
    stopRecording:   "Stop Recording",
    recordingMsg:    "Recording started… speak now 🎙️",
    recordingActive: "● Recording… press Stop when done",
    micDenied:       "Microphone access denied. Please allow it in browser settings.",
    addToFamily:     "Add to Family 💛",
    saving:          "Saving…",
    cancel:          "Cancel",
    playVoice:       "Play Voice",
    hearIntro:       "Hear Intro",
    close:           "Close",
    galleryEmpty:    "Your family gallery awaits",
    galleryEmptyDesc:"Add the people who matter most to you",
    added:           "added to your family 💛",
    couldNotSave:    "Could not save. Please try again.",
    voiceSaved:      "voice saved",
    relations: ["Parent","Child","Sibling","Spouse","Grandchild","Friend","Caregiver","Other"],
  },
  hi: {
    title:           "मेरा परिवार 👨‍👩‍👧",
    subtitle:        "जो लोग आपसे प्यार करते हैं और आपकी देखभाल करते हैं",
    addMember:       "सदस्य जोड़ें",
    addTitle:        "एक परिवार सदस्य जोड़ें",
    namePlaceholder: "उनका नाम",
    selectRelation:  "रिश्ता चुनें…",
    notesPlaceholder:"उनके बारे में एक नोट: वे कहाँ रहते हैं, क्या पसंद है, एक खुशनुमा याद…",
    photo:           "उनकी तस्वीर",
    optional:        "(वैकल्पिक)",
    clickPhoto:      "फ़ोटो अपलोड करने के लिए क्लिक करें",
    photoHint:       "JPG, PNG · अधिकतम 2MB",
    photoTooBig:     "फ़ोटो 2MB से कम होनी चाहिए",
    voiceNote:       "उनकी आवाज़ का नोट",
    voiceHint:       "उन्हें कुछ बोलते हुए रिकॉर्ड करें — उनका नाम, अभिवादन, या 'मैं तुमसे प्यार करता हूँ'",
    startRecording:  "रिकॉर्डिंग शुरू करें",
    stopRecording:   "रिकॉर्डिंग बंद करें",
    recordingMsg:    "रिकॉर्डिंग शुरू हुई… अब बोलें 🎙️",
    recordingActive: "● रिकॉर्डिंग हो रही है… पूरा होने पर Stop दबाएं",
    micDenied:       "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में अनुमति दें।",
    addToFamily:     "परिवार में जोड़ें 💛",
    saving:          "सहेजा जा रहा है…",
    cancel:          "रद्द करें",
    playVoice:       "आवाज़ सुनें",
    hearIntro:       "परिचय सुनें",
    close:           "बंद करें",
    galleryEmpty:    "आपकी परिवार गैलरी आपका इंतज़ार कर रही है",
    galleryEmptyDesc:"जो लोग आपके लिए सबसे महत्वपूर्ण हैं उन्हें जोड़ें",
    added:           "आपके परिवार में जोड़ दिया गया 💛",
    couldNotSave:    "सहेजा नहीं जा सका। कृपया पुनः प्रयास करें।",
    voiceSaved:      "आवाज़ सहेजी गई",
    relations: ["माता-पिता","बच्चा","भाई-बहन","जीवनसाथी","पोता-पोती","मित्र","देखभालकर्ता","अन्य"],
  },
} as const;

export default function FamilyPage() {
  const { lang } = useLanguage();
  const t = T[lang];

  const [members, setMembers]   = useState<FamilyMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [form, setForm]         = useState({ name: "", relation: "", notes: "" });
  const [loading, setLoading]   = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64]   = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceURL, setVoiceURL]   = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<BlobPart[]>([]);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/family");
      setMembers(await res.json());
    } catch {}
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error(t.photoTooBig); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      setPhotoBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        setVoiceURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t2) => t2.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      toast(t.recordingMsg);
    } catch {
      toast.error(t.micDenied);
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };
  const removeVoice   = () => { setVoiceBlob(null); setVoiceURL(null); };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const handleSubmit = async () => {
    if (!form.name) return toast.error(lang === "hi" ? "कृपया नाम दर्ज करें" : "Please enter a name");
    setLoading(true);
    try {
      let voiceBase64: string | null = null;
      if (voiceBlob) voiceBase64 = await blobToBase64(voiceBlob);
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: photoBase64 || null, voiceNote: voiceBase64 || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${form.name} ${t.added}`);
      setForm({ name: "", relation: "", notes: "" });
      setPhotoPreview(null); setPhotoBase64(null);
      setVoiceBlob(null);   setVoiceURL(null);
      setShowForm(false);
      fetchMembers();
    } catch {
      toast.error(t.couldNotSave);
    } finally {
      setLoading(false);
    }
  };

  const speakIntro = (member: FamilyMember) => {
    if (member.voiceNote) {
      const audio = new Audio(member.voiceNote);
      audio.play();
      toast(`Playing ${member.name}'s voice note 🔊`);
      return;
    }
    const text = lang === "hi"
      ? `यह ${member.name} हैं, आपके ${member.relation}। ${member.notes || ""}`
      : `This is ${member.name}, your ${member.relation}. ${member.notes || ""}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.85;
    utterance.lang  = lang === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
    toast(`Introducing ${member.name} 🔊`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">{t.title}</h1>
          <p className="font-body text-stone-light italic mt-1">{t.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          {t.addMember}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">{t.addTitle}</h2>
          <div className="space-y-5">
            <input
              className="input-warm"
              placeholder={t.namePlaceholder}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="input-warm"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            >
              <option value="">{t.selectRelation}</option>
              {t.relations.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea
              className="input-warm"
              placeholder={t.notesPlaceholder}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />

            {/* Photo */}
            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-2">
                📷 {t.photo} <span className="text-stone-light font-normal">{t.optional}</span>
              </label>
              {photoPreview ? (
                <div className="relative inline-block">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover shadow-soft" />
                  <button onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-terracotta text-white rounded-full flex items-center justify-center shadow-soft">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 bg-cream-100 border-2 border-dashed border-stone-lighter rounded-2xl text-stone-warm hover:bg-cream-200 hover:border-sage transition-all font-ui text-sm"
                >
                  <Camera size={18} className="text-sage" />
                  {t.clickPhoto}
                </button>
              )}
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="font-ui text-xs text-stone-light mt-1">{t.photoHint}</p>
            </div>

            {/* Voice */}
            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-1">
                🎙️ {t.voiceNote} <span className="text-stone-light font-normal">{t.optional}</span>
              </label>
              <p className="font-ui text-xs text-stone-light mb-3">{t.voiceHint}</p>
              {voiceURL ? (
                <div className="flex items-center gap-3 bg-sage/10 rounded-2xl p-3">
                  <audio src={voiceURL} controls className="flex-1 h-8" />
                  <button onClick={removeVoice} className="w-8 h-8 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-ui text-sm font-medium transition-all ${
                    recording
                      ? "bg-terracotta text-white animate-pulse"
                      : "bg-cream-100 text-stone-warm hover:bg-cream-200 border-2 border-dashed border-stone-lighter hover:border-sage"
                  }`}
                >
                  {recording
                    ? <><MicOff size={16} /> {t.stopRecording}</>
                    : <><Mic size={16} className="text-sage" /> {t.startRecording}</>
                  }
                </button>
              )}
              {recording && (
                <p className="font-ui text-xs text-terracotta mt-2 animate-pulse">{t.recordingActive}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm py-2.5">
                {loading ? t.saving : t.addToFamily}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2.5">
                {t.cancel}
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-terracotta-100 to-sage-100 flex items-center justify-center text-4xl mx-auto mb-4 shadow-warm overflow-hidden">
                {selected.photo
                  ? <img src={selected.photo} className="w-full h-full object-cover" alt={selected.name} />
                  : <span>👤</span>
                }
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-warm">{selected.name}</h2>
              <p className="font-ui text-stone-light">{selected.relation}</p>
            </div>
            {selected.notes && (
              <div className="bg-cream-100 rounded-2xl p-4 mb-5">
                <p className="font-body text-stone-warm text-sm leading-relaxed">{selected.notes}</p>
              </div>
            )}
            {selected.voiceNote && (
              <div className="bg-sage/10 rounded-2xl p-3 mb-5">
                <p className="font-ui text-xs text-sage-500 mb-2 font-medium">🎙️ {t.voiceNote}</p>
                <audio src={selected.voiceNote} controls className="w-full h-8" />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => speakIntro(selected)}
                className="btn-sage flex items-center gap-2 flex-1 justify-center text-sm py-2.5"
              >
                <Volume2 size={16} />
                {selected.voiceNote ? t.playVoice : t.hearIntro}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm py-2.5">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {members.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <p className="font-display text-xl text-stone-warm mb-2">{t.galleryEmpty}</p>
          <p className="font-body text-stone-light italic">{t.galleryEmptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="card-warm p-5 flex flex-col items-center text-center group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-2xl mb-3 shadow-soft group-hover:shadow-warm transition-shadow overflow-hidden`}>
                {m.photo
                  ? <img src={m.photo} className="w-full h-full object-cover" alt={m.name} />
                  : <span>👤</span>
                }
              </div>
              <p className="font-ui font-semibold text-stone-warm text-sm">{m.name}</p>
              <p className="font-ui text-xs text-stone-light">{m.relation}</p>
              {m.voiceNote && (
                <span className="font-ui text-xs text-sage-500 mt-1">🎙️ {t.voiceSaved}</span>
              )}
              <Heart size={12} className="text-terracotta/40 mt-1 group-hover:text-terracotta transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}