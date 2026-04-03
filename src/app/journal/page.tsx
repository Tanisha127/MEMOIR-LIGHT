"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Mic, MicOff, Sparkles, Camera, X, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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

export default function JournalPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", mood: "", tags: "" });
  const [aiSummary, setAiSummary] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceURL, setVoiceURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchJournals(); }, []);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal");
      setJournals(await res.json());
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

  // ── Photo handlers ─────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Photo must be under 3MB"); return; }
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

  // ── Voice memo ─────────────────────────────────────────
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
      toast.error("Microphone access denied. Please allow it in browser settings.");
    }
  };

  const stopVoiceMemo = () => { mediaRecorderRef.current?.stop(); setVoiceRecording(false); };
  const removeVoice = () => { setVoiceBlob(null); setVoiceURL(null); };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  // ── Dictation ─────────────────────────────────────────
  const startVoice = () => {
    const win = window as IWindow;
    const SR = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join(" ");
      setForm((f) => ({ ...f, content: transcript }));
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setRecording(false); };

  // ── AI summary ────────────────────────────────────────
  const generateSummary = async () => {
    if (!form.content) return toast.error("Please write something first");
    setAiLoading(true);
    try {
      const res = await fetch("/api/journal/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch { toast.error("Could not generate summary right now"); }
    finally { setAiLoading(false); }
  };

  // ── Submit (create or update) ─────────────────────────
  const handleSubmit = async () => {
    if (!form.content) return toast.error("Please write something first");
    setLoading(true);
    try {
      let voiceBase64: string | null = null;
      if (voiceBlob) voiceBase64 = await blobToBase64(voiceBlob);

      if (editingId) {
        // UPDATE
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
        // CREATE
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            aiSummary,
            photo: photoBase64 || null,
            voiceNote: voiceBase64 || null,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Memory saved beautifully 📖");
      }

      resetForm();
      fetchJournals();
    } catch { toast.error("Could not save. Please try again."); }
    finally { setLoading(false); }
  };

  // ── Edit ──────────────────────────────────────────────
  const handleEdit = (j: Journal) => {
    setEditingId(j.id);
    setForm({
      title: j.title || "",
      content: j.content,
      mood: j.mood || "",
      tags: (j.tags || []).join(", "),
    });
    setAiSummary("");
    setPhotoPreview(j.photo || null);
    setPhotoBase64(null); // don't re-upload existing photo
    setVoiceURL(null);
    setVoiceBlob(null);
    setShowForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async (id: string, title?: string) => {
    const label = title || "this memory";
    if (!confirm(`Are you sure you want to delete "${label}"?\n\nThis cannot be undone.`)) return;
    try {
      const res = await fetch("/api/journal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Memory deleted");
      fetchJournals();
    } catch {
      toast.error("Could not delete. Please try again.");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-warm">Memory Journal 📖</h1>
          <p className="font-body text-stone-light italic mt-1">Every memory is precious. Write yours here.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {showForm && !editingId ? "Close" : "New Memory"}
        </button>
      </div>

      {/* Form — used for both create and edit */}
      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">
            {editingId ? "Edit Memory ✏️" : "Write a Memory ✍️"}
          </h2>
          <div className="space-y-5">

            <input
              className="input-warm"
              placeholder="Give it a title… (optional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* Text + dictation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-ui text-sm font-medium text-stone-warm">Your Memory</label>
                <button
                  onClick={recording ? stopVoice : startVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-ui text-xs font-medium transition-all ${
                    recording
                      ? "bg-terracotta text-white animate-pulse"
                      : "bg-cream-200 text-stone-warm hover:bg-cream-300"
                  }`}
                >
                  {recording ? <><MicOff size={13} /> Stop Dictation</> : <><Mic size={13} /> Dictate</>}
                </button>
              </div>
              <textarea
                className="input-warm min-h-[120px]"
                placeholder="What happened today? Even small things matter…"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              {recording && (
                <p className="font-ui text-xs text-terracotta mt-1 animate-pulse">
                  🎙️ Listening… speak now, then press Stop Dictation
                </p>
              )}
            </div>

            {/* Mood */}
            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-2">
                How are you feeling?
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

            {/* Photo Upload — only show on new entries */}
            {!editingId && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-2">
                  📷 Add a Photo <span className="text-stone-light font-normal">(optional)</span>
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
                    Click to add a photo to this memory
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

            {/* Voice Memo — only on new entries */}
            {!editingId && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-1">
                  🎙️ Add a Voice Memo <span className="text-stone-light font-normal">(optional)</span>
                </label>
                <p className="font-ui text-xs text-stone-light mb-3">
                  Record yourself describing this memory in your own voice
                </p>
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
                      ? <><MicOff size={16} /> Stop Recording</>
                      : <><Mic size={16} className="text-sage" /> Start Recording</>
                    }
                  </button>
                )}
                {voiceRecording && (
                  <p className="font-ui text-xs text-terracotta mt-2 animate-pulse">
                    ● Recording in progress… press Stop when done
                  </p>
                )}
              </div>
            )}

            <input
              className="input-warm"
              placeholder="Tags: family, park, happy (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            {/* AI summary — only on new entries */}
            {!editingId && (
              <>
                {aiSummary && (
                  <div className="bg-sage/10 border border-sage/20 rounded-2xl p-4">
                    <p className="font-ui text-xs font-medium text-sage-500 mb-1">✨ AI Memory Summary</p>
                    <p className="font-body text-stone-warm text-sm">{aiSummary}</p>
                  </div>
                )}
                <button
                  onClick={generateSummary}
                  disabled={aiLoading}
                  className="btn-sage flex items-center gap-2 text-sm py-2"
                >
                  <Sparkles size={15} />
                  {aiLoading ? "Thinking…" : "Generate AI Summary"}
                </button>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm py-2"
              >
                {loading
                  ? "Saving…"
                  : editingId ? "Save Changes ✏️" : "Save Memory 💛"
                }
              </button>
              <button onClick={resetForm} className="btn-secondary text-sm py-2">
                Cancel
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
            <p className="font-display text-xl text-stone-warm mb-2">Your journal awaits</p>
            <p className="font-body text-stone-light italic">
              Start with something small — even &ldquo;Today I saw a flower&rdquo;
            </p>
          </div>
        )}

        {journals.map((j) => (
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
                {/* Edit & Delete — visible on hover */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(j)}
                    title="Edit this memory"
                    className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center text-sage-500 hover:bg-sage/20 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(j.id, j.title)}
                    title="Delete this memory"
                    className="w-8 h-8 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta hover:bg-terracotta/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Photo */}
            {j.photo && (
              <div className="mb-3 rounded-2xl overflow-hidden">
                <img src={j.photo} alt="Memory" className="w-full max-h-56 object-cover" />
              </div>
            )}

            <p className="font-body text-stone-warm leading-relaxed mb-3">{j.content}</p>

            {/* Voice memo */}
            {j.voiceNote && (
              <div className="bg-sage/10 rounded-2xl p-3 mb-3">
                <p className="font-ui text-xs text-sage-500 font-medium mb-2">🎙️ Voice Memo</p>
                <audio src={j.voiceNote} controls className="w-full h-8" />
              </div>
            )}

            {j.aiSummary && (
              <div className="bg-sage/10 rounded-xl p-3">
                <p className="font-ui text-xs text-sage-500 font-medium mb-0.5">✨ AI Reflection</p>
                <p className="font-body text-sm text-stone-warm italic">{j.aiSummary}</p>
              </div>
            )}

            {j.tags && j.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {j.tags.map((tag) => (
                  <span key={tag} className="bg-cream-200 text-stone-warm text-xs font-ui px-2.5 py-0.5 rounded-full">
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