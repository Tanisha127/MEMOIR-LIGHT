# 🌿 Memoir Light — AI Memory Companion

> *A warm, gentle companion for memory care and daily living*

Memoir Light is a beautiful, accessible web application designed for elderly individuals and people with memory impairments. It combines thoughtful UI design with AI-powered features to create a safe, comforting digital companion.

---

## ✨ What Makes This Different

| Feature | Description |
|---|---|
| 🌸 **Mood Garden** | Visual flower garden that grows with your daily mood logs |
| 🌬️ **Calm Breathing** | Guided breathing exercises with 3 science-backed patterns |
| 🗺️ **Life Timeline** | Chronicle your life story with milestones and memories |
| 🎨 **Colour Therapy Canvas** | Freehand drawing tool for creative expression |
| 💛 **Warm AI Reflections** | GPT-powered journal summaries written like a kind friend |
| 🔊 **Voice Everything** | Voice input for journals, voice output for reminders |
| 🌿 **Terracotta & Sage Palette** | Warm, earthy tones — not cold blue/white |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **AI**: OpenAI GPT-4o-mini
- **Voice**: Web Speech API (built into browsers)
- **Fonts**: Playfair Display + Lora + DM Sans

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd memoir-light
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."   # Optional — fallback responses built in
```

> **Free PostgreSQL options**: [Neon.tech](https://neon.tech) · [Supabase](https://supabase.com) · [Railway](https://railway.app)

### 3. Set Up the Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🌿

---

## 🌟 Unique Features 

1. **Mood Garden** — Moods become flowers in a growing visual garden
2. **Life Timeline** — Chronicle life milestones from birth to today
3. **Calm Breathing** — 3 breathing patterns with animated circle guide
4. **Colour Therapy Canvas** — In-app drawing with brushes and colours
5. **AI Affirmations** — Mood-triggered personalised affirmations
6. **Hydration tracker** — Visual glass-by-glass water tracker on dashboard
7. **Voice journal input** — Speak your memories instead of typing
8. **Family voice introduction** — Text-to-speech intro for each family member

---

## 🔒 Privacy & Safety

- All data stored in your own database
- Passwords hashed with bcrypt (12 rounds)
- JWT session tokens
- No data sent to third parties except OpenAI (for AI features, optional)

---

## 📱 Accessibility

- Large font size toggle (Normal / Large / Very Large)
- High contrast warm palette
- Voice input and output throughout
- Large tap targets (min 44px)
- Serif fonts for better readability

