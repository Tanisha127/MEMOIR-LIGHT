"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Mic, MicOff, Sparkles } from "lucide-react";
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

  useEffect(() => { fetchJournals(); }, []);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal");
      setJournals(await res.json());
    } catch { /* ignore */ }
  };

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

  const handleSubmit = async () => {
    if (!form.content) return toast.error("Please write something first");
    setLoading(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          aiSummary,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Memory saved beautifully 📖");
      setForm({ title: "", content: "", mood: "", tags: "" });
      setAiSummary("");
      setShowForm(false);
      fetchJournals();
    } catch { toast.error("Could not save. Please try again."); }
    finally { setLoading(false); }
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
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          {showForm ? "Close" : "New Memory"}
        </button>
      </div>

      {showForm && (
        <div className="card-warm p-6 mb-8 animate-slide-up">
          <h2 className="font-display text-xl font-semibold text-stone-warm mb-5">Write a Memory ✍️</h2>
          <div className="space-y-4">
            <input
              className="input-warm"
              placeholder="Give it a title… (optional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="relative">
              <textarea
                className="input-warm min-h-[140px] pr-12"
                placeholder="What happened today? Even small things matter…"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <button
                onClick={recording ? stopVoice : startVoice}
                className={`absolute right-3 top-3 p-2 rounded-xl transition-all ${
                  recording ? "bg-terracotta text-white animate-pulse" : "bg-cream-200 text-stone-warm hover:bg-cream-300"
                }`}
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-2">How are you feeling?</label>
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

            <input
              className="input-warm"
              placeholder="Tags: family, park, happy (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            {aiSummary && (
              <div className="bg-sage/10 border border-sage/20 rounded-2xl p-4">
                <p className="font-ui text-xs font-medium text-sage-500 mb-1">✨ AI Memory Summary</p>
                <p className="font-body text-stone-warm text-sm">{aiSummary}</p>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button onClick={generateSummary} disabled={aiLoading} className="btn-sage flex items-center gap-2 text-sm py-2">
                <Sparkles size={15} />
                {aiLoading ? "Thinking…" : "Generate AI Summary"}
              </button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 text-sm py-2">
                {loading ? "Saving…" : "Save Memory 💛"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {journals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📔</div>
            <p className="font-display text-xl text-stone-warm mb-2">Your journal awaits</p>
            <p className="font-body text-stone-light italic">Start with something small — even &ldquo;Today I saw a flower&rdquo;</p>
          </div>
        )}
        {journals.map((j) => (
          <div key={j.id} className="card-warm p-5 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-ui text-xs text-stone-light mb-1">{formatDate(j.createdAt)}</p>
                {j.title && <h3 className="font-display text-lg font-semibold text-stone-warm">{j.title}</h3>}
              </div>
              {j.mood && <span className="text-xl">{MOOD_OPTIONS.find((m) => m.value === j.mood)?.emoji}</span>}
            </div>
            <p className="font-body text-stone-warm leading-relaxed mb-3">{j.content}</p>
            {j.aiSummary && (
              <div className="bg-sage/10 rounded-xl p-3">
                <p className="font-ui text-xs text-sage-500 font-medium mb-0.5">✨ AI Reflection</p>
                <p className="font-body text-sm text-stone-warm italic">{j.aiSummary}</p>
              </div>
            )}
            {j.tags && j.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {j.tags.map((tag) => (
                  <span key={tag} className="bg-cream-200 text-stone-warm text-xs font-ui px-2.5 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}