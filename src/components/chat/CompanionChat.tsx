"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, Volume2, Mic, MicOff } from "lucide-react";

// ✅ Fix: define browser speech types manually so TypeScript stops complaining
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror:  (() => void) | null;
  onend:    (() => void) | null;
}

interface ISpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const OPENING_MESSAGE: Message = {
  role: "assistant",
  content: "Hello! 🌿 I'm so glad you're here. I'm your gentle companion — always here to chat, listen, or just keep you company. How are you feeling today?",
};

export function CompanionChat() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "friend";

  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [unread, setUnread]       = useState(false);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null); // ✅ use our custom type

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const userMsg: Message     = { role: "user", content: userText };
    const updatedMessages      = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, userName: firstName }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!open) setUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I couldn't connect just now. Please try again in a moment 💛" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate  = 0.88;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

  const toggleListening = () => {
    // ✅ Check support without using the SpeechRecognition type directly
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // ✅ Cast the instance to our custom interface
    const recognition = new SR() as ISpeechRecognition;
    recognition.lang           = "en-US";
    recognition.interimResults = false;

    // ✅ Use ISpeechRecognitionEvent instead of SpeechRecognitionEvent
    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const clearChat = () => setMessages([OPENING_MESSAGE]);

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open companion chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-terracotta rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
        style={{ boxShadow: "0 4px 24px rgba(212,112,78,0.45)" }}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {unread && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-amber rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        className={`
          fixed bottom-24 right-6 z-40 w-[340px] flex flex-col
          bg-white rounded-3xl shadow-2xl border border-stone-lighter/60
          transition-all duration-300 origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}
        `}
        style={{ maxHeight: "520px", boxShadow: "0 8px 40px rgba(140,123,107,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-lighter/40 bg-gradient-to-r from-sage-50 to-cream-100 rounded-t-3xl">
          <div className="w-10 h-10 bg-gradient-to-br from-sage to-sage-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
            <span className="text-xl">🌿</span>
          </div>
          <div className="flex-1">
            <p className="font-ui font-semibold text-stone-warm text-sm">Your Companion</p>
            <p className="font-ui text-xs text-sage-500">Always here for you, {firstName} 💛</p>
          </div>
          <button
            onClick={clearChat}
            className="font-ui text-xs text-stone-light hover:text-terracotta transition-colors px-2 py-1 rounded-xl hover:bg-terracotta/10"
          >
            Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 bg-sage/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🌿</span>
                </div>
              )}
              <div
                className={`
                  max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm font-ui leading-relaxed
                  ${m.role === "user"
                    ? "bg-terracotta text-white rounded-br-sm"
                    : "bg-cream-100 text-stone-warm rounded-bl-sm border border-stone-lighter/40"
                  }
                `}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => speak(m.content)}
                    className="mt-1.5 flex items-center gap-1 text-xs text-stone-light hover:text-sage-500 transition-colors"
                  >
                    <Volume2 size={11} />
                    <span>Read aloud</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 bg-sage/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">🌿</span>
              </div>
              <div className="bg-cream-100 border border-stone-lighter/40 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {["I'm feeling lonely 💙", "Tell me something nice 🌸", "I need some calm 🍃"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs font-ui bg-cream-100 hover:bg-sage/10 text-stone-warm border border-stone-lighter/60 rounded-2xl px-3 py-1.5 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="p-3 border-t border-stone-lighter/40 flex gap-2 items-center">
          <button
            onClick={toggleListening}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              listening ? "bg-terracotta text-white animate-pulse" : "bg-cream-200 text-stone-warm hover:bg-sage/20"
            }`}
            title={listening ? "Stop listening" : "Speak your message"}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={listening ? "Listening…" : "Type a message…"}
            disabled={loading || listening}
            className="flex-1 bg-cream-100 border border-stone-lighter/60 rounded-2xl px-4 py-2 text-sm font-ui text-stone-warm placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all disabled:opacity-50"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-terracotta rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-terracotta/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
}