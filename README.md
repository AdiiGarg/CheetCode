# 🐆 CheetCode v1.0

CheetCode is an AI-powered LeetCode companion that analyzes your submitted solutions, tracks your progress, and provides personalized improvement recommendations — all inside a clean, modern developer-focused interface.

Built to help you understand **what your code actually does**, not just whether it passes.

---

## ✨ Features

### 🔍 AI Code Analysis
- Analyzes **only your submitted code**
- Accurate Time & Space Complexity
- Clear explanation of current logic
- Detects boilerplate / incomplete code safely
- Actionable next steps for improvement

### 📊 Dashboard
- Total submissions overview
- Easy / Medium / Hard breakdown
- Visual charts
- AI-generated recommendations based on recent activity

### 🧾 My Submissions
- View all past analyzed problems
- Live search by problem title
- Difficulty filters
- Sort by latest / oldest
- Expand one submission at a time to view:
  - Explanation
  - Key takeaways
  - Tips generated during analysis

### 🔐 Authentication
- GitHub OAuth login
- User-specific submission tracking

### 🎨 UI & UX
- Dark, LeetCode-inspired theme
- Fully responsive layout
- Clean typography and smooth interactions

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- NextAuth (GitHub OAuth)
- Monaco Editor

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Groq LLM API

### Deployment
- Frontend: Vercel
- Backend & Database: Railway

---

## 🔑 Environment Variables

### Frontend (Vercel)
```env
NEXT_PUBLIC_BACKEND_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

Backend (Railway / Server)
env
Copy code
DATABASE_URL=
GROQ_API_KEY=
Notes
NEXT_PUBLIC_BACKEND_URL must be enabled for production

GROQ_API_KEY is required for AI analysis & recommendations

Docker is not required in production and can be stopped locally

🚀 Local Setup
bash
Copy code
# Frontend
npm install
npm run dev

# Backend
npm install
npm run start:dev
Ensure PostgreSQL is running and environment variables are configured.

📌 Current Version
CheetCode v1.0

Stable AI analysis flow

Submission tracking & dashboard

Production-ready MVP

🔮 Planned Improvements
Re-analyze past submissions

Topic-wise progress tracking

Coding streaks

Advanced AI insights

Performance comparison across submissions

👤 Author
Made by Aditya Garg

GitHub

LinkedIn

Email

⭐ Final Note
CheetCode is built to help you learn deeply, not shortcut problem-solving.
It focuses on understanding why your solution behaves the way it does.

This is v1.0 — more iterations coming soon 🚀