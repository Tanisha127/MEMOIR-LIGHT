"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        toast.success("Welcome to Memoir Light! 🌿");
      }
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Invalid email or password");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-sunrise flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-sage/10 leaf-decoration" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-terracotta/8 leaf-decoration" />
      <div className="absolute top-1/3 left-[-40px] w-[200px] h-[200px] rounded-full bg-amber-light/20 leaf-decoration" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-warm mb-5">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-warm mb-2">
            Memoir Light
          </h1>
          <p className="font-body text-stone-light text-lg italic">
            Your gentle memory companion
          </p>
        </div>

        {/* Card */}
        <div className="card-warm p-8">
          <div className="flex gap-2 mb-8 bg-cream-100 rounded-2xl p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl font-ui font-medium text-sm transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-terracotta shadow-soft"
                    : "text-stone-warm hover:text-terracotta"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-1.5">
                  Your Name
                </label>
                <input
                  className="input-warm"
                  placeholder="e.g. Margaret"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="input-warm"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-ui text-sm font-medium text-stone-warm mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="input-warm"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block font-ui text-sm font-medium text-stone-warm mb-1.5">
                  I am a...
                </label>
                <select
                  className="input-warm"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="USER">Person using Memoir Light</option>
                  <option value="CAREGIVER">Caregiver / Family Member</option>
                </select>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Just a moment…</span>
                </>
              ) : (
                mode === "login" ? "Welcome Back 🌿" : "Begin Your Journey 🌱"
              )}
            </button>
          </div>
        </div>

        <p className="text-center font-ui text-sm text-stone-light mt-6">
          You are safe here. Everything moves at your pace. 💛
        </p>
      </div>
    </div>
  );
}
