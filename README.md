# MediLead AI 🏥🤖

**AI-powered healthcare practice lead intelligence platform for Australia**

Built with Next.js 16, Claude AI (Anthropic), TypeScript, Tailwind CSS, and Recharts.

---

## What It Does

MediLead AI helps healthcare technology sales teams:

1. **Discover** Australian medical practices across all 8 states/territories
2. **Score** each practice 0–100 using Claude AI based on automation readiness (team size, services, telehealth, bulk billing)
3. **Draft** personalised outreach emails with one click — Claude writes a unique email per practice
4. **Track** pipeline status (New → Contacted → Replied → Not Interested)
5. **Analyse** with real-time charts (score distribution, pipeline status, state breakdown)
6. **Ask** questions in natural language via the AI chat assistant (floating 🤖 button)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| AI | Anthropic Claude 3 Haiku |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Types | TypeScript 5 |
| Validation | Zod |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (Server Component)
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── score/route.ts    # POST – AI fit-score (Claude)
│       ├── draft/route.ts    # POST – AI email draft (Claude)
│       └── chat/route.ts     # POST – AI assistant (Claude)
├── components/
│   ├── StatsCards.tsx        # 5 KPI summary cards
│   ├── PracticesTable.tsx    # Interactive table + detail panel
│   ├── Charts.tsx            # Score / status / state charts
│   └── AIChatPanel.tsx       # Floating AI chat widget
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── claude.ts             # Anthropic client singleton
│   ├── prompts.ts            # All AI prompts (versioned)
│   └── utils.ts              # Helpers, badge colours, stats
data/
└── practices.json            # 10 sample AU practices
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com). Add a small credit (\$5 is plenty for demos).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features in Detail

### AI Fit Score
Click **AI Score** on any practice row → Claude analyses team size, services, telehealth, bulk billing, and specialties → returns 0–100 score + 2-sentence reason displayed in the detail panel.

### AI Email Draft
Click **Draft Email** → Claude writes a personalised 150-word outreach email with the practice's name, suburb, and specific pain points. Copy to clipboard with one click.

### AI Chat Assistant
Click the 🤖 floating button → ask in plain English:
- *"Which state has the most practices?"*
- *"List practices with score above 70"*
- *"Who should I contact first?"*

### Pipeline Tracking
Change status (New / Contacted / Replied / Not Interested) inline in the table. Status updates reflect instantly in the charts.

---

## AI Prompt Log

| # | Purpose | Model | Tokens |
|---|---|---|---|
| 1 | Fit-score analysis | claude-3-haiku | ~300 |
| 2 | Personalised email draft | claude-3-haiku | ~500 |
| 3 | Chat assistant system prompt | claude-3-haiku | ~600 |

See [`src/lib/prompts.ts`](src/lib/prompts.ts) for full prompt source.

---

## Deployment (Vercel)

```bash
npx vercel --prod
```

Add `ANTHROPIC_API_KEY` in Vercel environment variables.

---

## Why This Project

Healthcare AI automation is a high-growth sector in Australia. Practices managing 5–15 practitioners spend 30–40% of admin time on scheduling, referrals, billing, and patient follow-ups — all automatable with AI. This tool demonstrates:

- Real-world AI API integration (not fake/hardcoded)
- Production-quality Next.js architecture
- Domain knowledge of Australian healthcare
- End-to-end sales workflow thinking
