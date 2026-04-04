"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Mic, MicOff, Sparkles, Camera, X, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Journal = {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  aiSummary?: string;
  tags?: string[];
  createdAt: string;
  photo?: string;
  voiceNote?: string;
};

const MOOD_OPTIONS = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "🤔", label: "Thoughtful", value: "thoughtful" },
  { emoji: "😴", label: "Tired", value: "tired" },
];

interface IWindow extends Window {
  webkitSpeechRecognition?: new () => ISpeechRecognition;
  SpeechRecognition?: new () => ISpeechRecognition;
}
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: ISpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}
interface ISpeechRecognitionEvent {
  results: ISpeechRecognitionResultList;
}
interface ISpeechRecognitionResultList {
  [index: number]: ISpeechRecognitionResult;
  length: number;
}
interface ISpeechRecognitionResult {
  [index: number]: { transcript: string };
}

// ── Inline translation cache & helper ────────────────────
const cache: Record<string, string> = {};

async function translateText(text: string, lang: string): Promise<string> {
  if (!text || lang === "en") return text;
  const key = `${lang}:${text}`;
  if (cache[key]) return cache[key];
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang }),
    });
    const data = await res.json();
    cache[key] = data.translated;
    return data.translated;
  } catch {
    return text;
  }
}

function useTranslateJournals(journals: Journal[]): Journal[] {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<Journal[]>(journals);

  useEffect(() => {
    if (lang === "en") {
      setTranslated(journals);
      return;
    }
    Promise.all(
      journals.map(async (j): Promise<Journal> => {
        const [content, title, aiSummary] = await Promise.all([
          translateText(j.content, lang),
          j.title      ? translateText(j.title, lang)      : Promise.resolve(undefined),
          j.aiSummary  ? translateText(j.aiSummary, lang)  : Promise.resolve(undefined),
        ]);
        return {
          ...j,
          content,
          title:      title      ?? j.title,
          aiSummary:  aiSummary  ?? j.aiSummary,
        };
      })
    ).then(setTranslated);
  }, [journals, lang]);

  return translated;
}

export default function JournalPage() {
  const { lang } = useLanguage();
  const [journals, setJournals]         = useState<Journal[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [aiLoading, setAiLoading]       = useState(false);
  const [recording, setRecording]       = useState(false);
  const [form, setForm]                 = useState({ title: "", content: "", mood: "", tags: "" });
  const [aiSummary, setAiSummary]       = useState("");
  const recognitionRef                  = useRef<ISpeechRecognition | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64]   = useState<string | null>(null);
  const photoInputRef                   = useRef<HTMLInputElement>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceBlob, setVoiceBlob]       = useState<Blob | null>(null);
  const [voiceURL, setVoiceURL]         = useState<string | null>(null);
  const mediaRecorderRef                = useRef<MediaRecorder | null>(null);
  const chunksRef                       = useRef<BlobPart[]>([]);
  const [editingId, setEditingId]       = useState<string | null>(null);

  const translatedJournals = useTranslateJournals(journals);

  const isHi = lang === "hi";

  const labels = {
    title:          isHi ? "स्मृति डायरी 📖"                    : "Memory Journal 📖",
    subtitle:       isHi ? "हर याद अनमोल है।"                   : "Every memory is precious. Write yours here.",
    newMemory:      isHi ? "नई याद"                             : "New Memory",
    close:          isHi ? "बंद करें"                           : "Close",
    writeTitle:     isHi ? "एक याद लिखें ✍️"                    : "Write a Memory ✍️",
    editTitle:      isHi ? "याद संपादित करें ✏️"                 : "Edit Memory ✏️",
    yourMemory:     isHi ? "आपकी याद"                           : "Your Memory",
    dictate:        isHi ? "बोलें"                              : "Dictate",
    stopDictate:    isHi ? "रोकें"                              : "Stop Dictation",
    howFeeling:     isHi ? "आप कैसा महसूस कर रहे हैं?"         : "How are you feeling?",
    addPhoto:       isHi ? "📷 फोटो जोड़ें"                     : "📷 Add a Photo",
    addVoice:       isHi ? "🎙️ आवाज़ मेमो जोड़ें"               : "🎙️ Add a Voice Memo",
    tags:           isHi ? "टैग: परिवार, पार्क (अल्पविराम से)" : "Tags: family, park (comma-separated)",
    aiSummaryLabel: isHi ? "✨ AI स्मृति सारांश"                : "✨ AI Memory Summary",
    generateAI:     isHi ? "AI सारांश बनाएं"                    : "Generate AI Summary",
    thinking:       isHi ? "सोच रहा हूं…"                       : "Thinking…",
    saveMemory:     isHi ? "याद सहेजें 💛"                      : "Save Memory 💛",
    saveChanges:    isHi ? "बदलाव सहेजें ✏️"                   : "Save Changes ✏️",
    saving:         isHi ? "सहेज रहा है…"                       : "Saving…",
    cancel:         isHi ? "रद्द करें"                          : "Cancel",
    emptyTitle:     isHi ? "आपकी डायरी इंतजार कर रही है"       : "Your journal awaits",
    emptyDesc:      isHi ? "छोटी सी बात से शुरू करें"           : "Start with something small",
    aiReflection:   isHi ? "✨ AI विचार"                        : "✨ AI Reflection",
    voiceMemo:      isHi ? "🎙️ आवाज़ मेमो"                     : "🎙️ Voice Memo",
    optional:       isHi ? "(वैकल्पिक)"                         : "(optional)",
    recordingMsg:   isHi ? "● रिकॉर्डिंग हो रही है…"            : "● Recording in progress…",
    listening:      isHi ? "🎙️ सुन रहा हूं…"                    : "🎙️ Listening… speak now",
    startRec:       isHi ? "रिकॉर्डिंग शुरू करें"               : "Start Recording",
    stopRec:        isHi ? "रिकॉर्डिंग रोकें"                   : "Stop Recording",
    clickPhoto:     isHi ? "फोटो अपलोड करें"                    : "Click to add a photo to this memory",
    titlePlaceholder: isHi ? "शीर्षक दें… (वैकल्पिक)"           : "Give it a title… (optional)",
    contentPlaceholder: isHi ? "आज क्या हुआ? छोटी बातें भी मायने रखती हैं…" : "What happened today? Even small things matter…",
  };

  useEffect(() => { fetchJournals(); }, []);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal");
      const data: Journal[] = await res.json();
      setJournals(data);
    } catch { /* ignore */ }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", mood: "", tags: "" });
    setAiSummary("");
    setPhotoPreview(null);
    setPhotoBase64(null);
    setVoiceBlob(null);
    setVoiceURL(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Photo must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const startVoiceMemo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        setVoiceURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setVoiceRecording(true);
      toast("Recording your memory… 🎙️");
    } catch {
      toast.error("Microphone access denied.");
    }
  };

  const stopVoiceMemo = () => { mediaRecorderRef.current?.stop(); setVoiceRecording(false); };
  const removeVoice   = () => { setVoiceBlob(null); setVoiceURL(null); };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const startVoice = () => {
    const win = window as IWindow;
    const SR  = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SR) { toast.error("Voice input not supported"); return; }
    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript).join(" ");
      setForm((f) => ({ ...f, content: transcript }));
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setRecording(false); };

  const generateSummary = async () => {
    if (!form.content) return toast.error("Please write something first");
    setAiLoading(true);
    try {
      const res  = await fetch("/api/journal/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch { toast.error("Could not generate summary"); }
    finally   { setAiLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.content) return toast.error("Please write something first");
    setLoading(true);
    try {
      let voiceBase64: string | null = null;
      if (voiceBlob) voiceBase64 = await blobToBase64(voiceBlob);

      if (editingId) {
        const res = await fetch("/api/journal", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Memory updated 📖");
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            aiSummary,
            photo:     photoBase64  || null,
            voiceNote: voiceBase64  || null,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Memory saved beautifully 📖");
      }
      resetForm();
      fetchJournals();
    } catch { toast.error("Could not save. Please try again."); }
    finally   { setLoading(false); }
  };

  const handleEdit = (j: Journal) => {
    setEditingId(j.id);
    setForm({
      title:   j.title  || "",
      content: j.content,
      mood:    j.mood   || "",
      tags:    (j.tags  || []).join(", "),
    });
    setAiSummary("");
    setPhotoPreview(j.photo || null);
    setPhotoBase64(null);
    setVoiceURL(null);
    setVoiceBlob(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, title?: string) => {
    if (!confirm(`Delete "${title || "this memory"}"?\nThis cannot be undone.`)) return;
    try {
      const res = await fetch("/api/journal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Memory deleted");
      fetchJournals();
    } catch { toast.error("Could not delete."); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(isHi ? "hi-IN" : "en-US", {
      weekday: "long", month: "long", day: "numeric",
    });

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">{labels.title}</h1>
          <p className="font-body text-stone-light italic mt-1">{labels.subtitle}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {showForm && !editingId ? labels.close : labels.newMemory}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">
            {editingId ? labels.editTitle : labels.writeTitle}
          </h2>
          <div className="space-y-5">

            <input
              className="input-warm"
              placeholder={labels.titlePlaceholder}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* Text + dictation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-ui text-sm font-medium text-stone-warm">{labels.yourMemory}</label>
                <button
                  onClick={recording ? stopVoice : startVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-ui text-xs font-medium transition-all ${
                    recording
                      ? "bg-terracotta text-white animate-pulse"
                      : "bg-cream-200 text-stone-warm hover:bg-cream-300"
                  }`}
                >
                  {recording
                    ? <><MicOff size={13} /> {labels.stopDictate}</>
                    : <><Mic size={13} /> {labels.dictate}</>
                  }
                </button>
              </div>
              <textarea
                className="input-warm min-h-[120px]"
                placeholder={labels.contentPlaceholder}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              {recording && (
                <p className="font-ui text-xs text-terracotta mt-1 animate-pulse">{labels.listening}</p>
              )}
            </div>

            {/* Mood */}
            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-2">
                {labels.howFeeling}
              </label>
              <div className="flex gap-2 flex-wrap">
                {MOOD_OPTIONS.map(({ emoji, label, value }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, mood: value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-ui text-sm transition-all ${
                      form.mood === value
                        ? "bg-terracotta/15 text-terracotta border border-terracotta/30"
                        : "bg-cream-100 text-stone-warm hover:bg-cream-200"
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo — new entries only */}
            {!editingId && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-2">
                  {labels.addPhoto}{" "}
                  <span className="text-stone-light font-normal">{labels.optional}</span>
                </label>
                {photoPreview ? (
                  <div className="relative inline-block w-full">
                    <img
                      src={photoPreview}
                      alt="Memory photo"
                      className="w-full max-h-48 object-cover rounded-2xl shadow-soft"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute top-2 right-2 w-7 h-7 bg-terracotta text-white rounded-full flex items-center justify-center shadow-soft"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 bg-cream-100 border-2 border-dashed border-stone-lighter rounded-2xl text-stone-warm hover:bg-cream-200 hover:border-sage transition-all font-ui text-sm w-full justify-center"
                  >
                    <Camera size={18} className="text-sage" />
                    {labels.clickPhoto}
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="font-ui text-xs text-stone-light mt-1">JPG, PNG · Max 3MB</p>
              </div>
            )}

            {/* Voice memo — new entries only */}
            {!editingId && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-1">
                  {labels.addVoice}{" "}
                  <span className="text-stone-light font-normal">{labels.optional}</span>
                </label>
                {voiceURL ? (
                  <div className="flex items-center gap-3 bg-sage/10 rounded-2xl p-3">
                    <audio src={voiceURL} controls className="flex-1 h-8" />
                    <button
                      onClick={removeVoice}
                      className="w-8 h-8 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={voiceRecording ? stopVoiceMemo : startVoiceMemo}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-ui text-sm font-medium transition-all w-full justify-center ${
                      voiceRecording
                        ? "bg-terracotta text-white animate-pulse"
                        : "bg-cream-100 text-stone-warm hover:bg-cream-200 border-2 border-dashed border-stone-lighter hover:border-sage"
                    }`}
                  >
                    {voiceRecording
                      ? <><MicOff size={16} /> {labels.stopRec}</>
                      : <><Mic size={16} className="text-sage" /> {labels.startRec}</>
                    }
                  </button>
                )}
                {voiceRecording && (
                  <p className="font-ui text-xs text-terracotta mt-2 animate-pulse">{labels.recordingMsg}</p>
                )}
              </div>
            )}

            {/* Tags */}
            <input
              className="input-warm"
              placeholder={labels.tags}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            {/* AI Summary — new entries only */}
            {!editingId && (
              <>
                {aiSummary && (
                  <div className="bg-sage/10 border border-sage/20 rounded-2xl p-4">
                    <p className="font-ui text-xs font-medium text-sage-500 mb-1">{labels.aiSummaryLabel}</p>
                    <p className="font-body text-stone-warm text-sm">{aiSummary}</p>
                  </div>
                )}
                <button
                  onClick={generateSummary}
                  disabled={aiLoading}
                  className="btn-sage flex items-center gap-2 text-sm py-2"
                >
                  <Sparkles size={15} />
                  {aiLoading ? labels.thinking : labels.generateAI}
                </button>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 text-sm py-2">
                {loading ? labels.saving : editingId ? labels.saveChanges : labels.saveMemory}
              </button>
              <button onClick={resetForm} className="btn-secondary text-sm py-2">
                {labels.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal list */}
      <div className="space-y-4">
        {journals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📔</div>
            <p className="font-display text-xl text-stone-warm mb-2">{labels.emptyTitle}</p>
            <p className="font-body text-stone-light italic">{labels.emptyDesc}</p>
          </div>
        )}

        {translatedJournals.map((j: Journal) => (
          <div key={j.id} className="card-warm p-5 animate-fade-in group">

            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-ui text-xs text-stone-light mb-1">{formatDate(j.createdAt)}</p>
                {j.title && (
                  <h3 className="font-display text-lg font-semibold text-stone-warm">{j.title}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                {j.mood && (
                  <span className="text-xl">
                    {MOOD_OPTIONS.find((m) => m.value === j.mood)?.emoji}
                  </span>
                )}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const original = journals.find((jj) => jj.id === j.id);
                      if (original) handleEdit(original);
                    }}
                    title="Edit"
                    className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center text-sage-500 hover:bg-sage/20 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(j.id, j.title)}
                    title="Delete"
                    className="w-8 h-8 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Photo */}
            {j.photo != null && j.photo.length > 0 && (
              <div className="mb-3 rounded-2xl overflow-hidden">
                <img src={j.photo} alt="Memory" className="w-full max-h-56 object-cover" />
              </div>
            )}

            {/* Content */}
            <p className="font-body text-stone-warm leading-relaxed mb-3">{j.content}</p>

            {/* Voice memo */}
            {j.voiceNote != null && j.voiceNote.length > 0 && (
              <div className="bg-sage/10 rounded-2xl p-3 mb-3">
                <p className="font-ui text-xs text-sage-500 font-medium mb-2">{labels.voiceMemo}</p>
                <audio src={j.voiceNote} controls className="w-full h-8" />
              </div>
            )}

            {/* AI reflection */}
            {j.aiSummary != null && j.aiSummary.length > 0 && (
              <div className="bg-sage/10 rounded-xl p-3">
                <p className="font-ui text-xs text-sage-500 font-medium mb-0.5">{labels.aiReflection}</p>
                <p className="font-body text-sm text-stone-warm italic">{j.aiSummary}</p>
              </div>
            )}

            {/* Tags */}
            {j.tags != null && j.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {j.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-cream-200 text-stone-warm text-xs font-ui px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}