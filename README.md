# LinkedCRM — LinkedIn Relationship Manager

A personal dashboard to track LinkedIn connections, prioritize outreach, generate AI messages, and land referrals.

---

## Setup (5 minutes)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Open terminal in this folder
- Windows: Right-click the folder → "Open in Terminal"
- Mac: Drag folder to Terminal, or right-click → "New Terminal at Folder"

### Step 3 — Install and run
```bash
npm install
npm start
```
The app opens at http://localhost:3000

---

## Get your FREE Groq API Key

1. Go to https://console.groq.com
2. Sign up (free, takes 2 minutes)
3. Go to API Keys → Create new key
4. Copy the key (starts with gsk_...)
5. Paste it in the app under Settings

Model used: **Llama 3.3 70B** — completely free, very fast.

---

## Import your LinkedIn Connections

1. Go to LinkedIn → Me → Settings & Privacy
2. Data Privacy → Get a copy of your data
3. Select "Connections" → Request archive
4. Wait for email (up to 24 hours), download the ZIP
5. Extract it, find `Connections.csv`
6. In the app: Connections tab → Import CSV → select that file

All 4,500+ connections import in seconds!

---

## Features

- **Dashboard** — Priority scores, funnel analytics, role breakdown
- **Connections** — Full table with search, filter, sort by score
- **AI Messages** — Generate personalized messages for each outreach phase
- **Message Log** — Paste sent/received messages, auto sentiment detection
- **Target Companies** — Track which connections work at your dream companies
- **Settings** — Add Groq API key + your profile for personalized messages

---

## Outreach Phases

| Phase | When | Goal |
|-------|------|------|
| Warm-up | Week 1-2 | Reconnect naturally |
| Active | Week 2-3 | Share value, build rapport |
| Coffee Chat | Week 3-4 | Get on a call |
| Referral Ask | Week 4+ | Ask after real rapport built |

---

## Priority Score (0–100)

Each connection is scored based on:
- **Warmth** (30%) — How well you know them (set manually 1-5)
- **Relevance** (40%) — How relevant to your job search (set manually 1-5)
- **Recency** (20%) — Days since last contact
- **Role Bonus** (+15) — Recruiters and Hiring Managers

---

## Data Privacy

All data is stored locally in your browser (localStorage). Nothing is sent to any server except the Groq API when you click "Generate Message."
