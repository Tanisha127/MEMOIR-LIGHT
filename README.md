# 🌿 Memoir Light

> *A warm, gentle AI companion for memory care and daily living*

Memoir Light is a beautiful, accessible web application designed for elderly individuals and people with memory impairments. It combines thoughtful UI design with AI-powered features to create a safe, comforting digital space — built with love, not cold blue interfaces.

**Live Demo** → (https://memoir-light.vercel.app)

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Tanisha127/MEMOIR-LIGHT.git
cd MEMOIR-LIGHT
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Free PostgreSQL options: [Neon.tech](https://neon.tech) · [Supabase](https://supabase.com) · [Railway](https://railway.app)

### 3. Database Setup
```bash
npm run db:generate
npm run db:push
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio (visual DB editor)
```

---

## Deployment

Memoir Light deploys to Vercel in one click.

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

Database: Use [Neon.tech](https://neon.tech) for a free serverless PostgreSQL instance that works perfectly with Vercel.

---

*Made for the people who deserve gentleness.*