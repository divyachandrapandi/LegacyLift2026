# LegacyLift — Project Roadmap & Source of Truth

> **Version:** 1.0 | **Status:** Pre-development | **Type:** Portfolio Project
> **One-liner:** AI-powered legacy website analyzer that generates a modernization blueprint for React-based architecture.

This document is the single source of truth for LegacyLift. Anyone (or any AI assistant) reading this should immediately understand *what* we're building, *why*, *how*, and *in what order*.

---

## Table of Contents

1. [Purpose & Problem Solved](#1-purpose--problem-solved)
2. [Tech Stack](#2-tech-stack)
3. [End-to-End Workflow](#3-end-to-end-workflow)
4. [Architecture](#4-architecture)
5. [Tools & Responsibilities](#5-tools--responsibilities)
6. [Build Procedure](#6-build-procedure)
7. [Deployment](#7-deployment)
8. [Project Conventions](#8-project-conventions)
9. [Out of Scope (MVP)](#9-out-of-scope-mvp)

---

## 1. Purpose & Problem Solved

### The Problem
Legacy websites (PHP, WordPress, jQuery-era static HTML) accumulate technical debt: table-based layouts, inline styles, no semantic HTML, accessibility gaps, no component reuse. Developers tasked with modernizing them face a blank page — *"Where do I even start?"*

### The Solution
LegacyLift takes a public URL, performs deterministic analysis on the rendered HTML, and uses an AI model to produce a **modernization blueprint** — not just a score, but a step-by-step migration plan toward a modern React stack.

### Why This Matters (Portfolio Angle)
- Demonstrates **systems thinking** — frontend + backend + AI + deterministic logic
- Shows **thoughtful AI integration** (rules find facts; AI explains and plans)
- Solves a **real developer pain point** rather than re-doing a todo app
- **Demoable in 30 seconds** — paste URL, get report

### Core Principle
> **Rules find facts. AI explains and plans.**

---

## 2. Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Axios / Fetch | API calls to backend |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js (LTS) | Runtime |
| Express | HTTP server framework |
| TypeScript | Type safety |
| Axios | Fetching target URL HTML |
| Cheerio | Server-side HTML parsing (jQuery-like) |
| Zod | Runtime input validation |
| express-rate-limit | Prevent API abuse |
| dotenv | Environment variables |

### AI Layer
| Tool | Purpose |
|------|---------|
| Claude API (`claude-sonnet-4-20250514`) or OpenAI `gpt-4o-mini` | Generate modernization plan |

### Deployment
| Tool | Purpose |
|------|---------|
| Vercel | Frontend hosting |
| Render or Railway | Backend hosting (free tier) |
| GitHub | Source control + CI/CD trigger |

### Explicitly Rejected (with reason)
- ❌ **Playwright** — 500MB+ Chromium binary; legacy sites are server-rendered, so a plain HTTP fetch is sufficient. Adds deployment pain for zero MVP value.
- ❌ **MongoDB / any database** — MVP is stateless; storing reports adds complexity without portfolio benefit.
- ❌ **Next.js** — overkill; we want to demonstrate clear frontend/backend separation.

---

## 3. End-to-End Workflow

What happens, step-by-step, from the moment a user submits a URL:

```
1. USER INPUT
   User pastes a URL into the input field on the React frontend.
   Frontend validates: non-empty, valid URL format, http/https only.

2. API REQUEST
   Frontend POSTs to backend: POST /api/analyze { url: "..." }

3. BACKEND VALIDATION
   Express route validates the URL again (Zod schema).
   Rate limiter checks request quota.
   URL is checked against a deny-list (localhost, internal IPs — SSRF protection).

4. HTML FETCH
   Backend calls axios.get(url) with a 10s timeout and a real User-Agent header.
   On failure (timeout, 404, blocked) → return structured error to frontend.

5. PARSING
   Raw HTML is loaded into Cheerio: const $ = cheerio.load(html)

6. RULE ENGINE (deterministic analysis)
   A series of independent rule functions run against the parsed DOM:
     - detectTableLayouts($)        → flag <table> used for layout
     - detectInlineStyles($)        → count style="..." attributes
     - detectSemanticGaps($)        → missing <header>, <main>, <nav>, <footer>
     - detectAccessibility($)       → missing alt, label, ARIA
     - detectComponents($)          → identify Navbar, Hero, Card, Form, Footer patterns
     - detectFrameworkSignals($)    → jQuery, Bootstrap 3, old PHP outputs
   Each rule returns a structured finding: { id, severity, message, count, evidence }

7. SCORING
   A weighted score (0-100) is computed from rule findings.
   Higher score = more modern; lower = more technical debt.

8. AI MODERNIZATION PLAN
   A structured prompt is built containing:
     - The findings array
     - The detected components
     - A request for: summary, ordered migration steps, recommended stack
   Sent to Claude/OpenAI with response_format hint for JSON output.
   Response is parsed and validated.

9. RESPONSE ASSEMBLY
   Backend returns a single JSON payload:
     { score, issues, components, aiPlan, meta }

10. FRONTEND RENDER
    React receives the report and renders it in sections:
      - Score card (visual, prominent)
      - Issues list (severity-coded)
      - Detected components (chips/badges)
      - AI Modernization Plan (numbered steps)
```

---

## 4. Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER (Browser)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND (React + Vite)                      │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  URL Input Form │→ │  API Client  │→ │ Report View  │    │
│  └─────────────────┘  └──────────────┘  └──────────────┘    │
│                Hosted on Vercel                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/analyze
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware: CORS, rate-limit, JSON parser, Zod      │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Route: POST /api/analyze                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ANALYSIS ENGINE                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │ Fetcher  │→ │  Parser  │→ │   Rule Engine    │   │    │
│  │  │ (axios)  │  │(Cheerio) │  │  (rule modules)  │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  │                                       │             │    │
│  │                                       ▼             │    │
│  │                              ┌────────────────┐     │    │
│  │                              │    Scorer      │     │    │
│  │                              └────────────────┘     │    │
│  │                                       │             │    │
│  │                                       ▼             │    │
│  │                              ┌────────────────┐     │    │
│  │                              │   AI Layer     │─────┼────┼──→ Claude/OpenAI API
│  │                              └────────────────┘     │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                │
│                            ▼                                │
│              JSON Response (score, issues,                  │
│              components, aiPlan)                            │
│                                                             │
│              Hosted on Render / Railway                     │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
legacylift/
├── frontend/
│   ├── src/
│   │   ├── components/      # UrlForm, ScoreCard, IssueList, AiPlanCard, etc.
│   │   ├── pages/           # Home (single page MVP)
│   │   ├── lib/             # api client, types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/          # analyze.ts
│   │   ├── engine/
│   │   │   ├── fetcher.ts   # axios wrapper
│   │   │   ├── parser.ts    # cheerio loader
│   │   │   ├── rules/       # one file per rule
│   │   │   │   ├── tableLayout.ts
│   │   │   │   ├── inlineStyles.ts
│   │   │   │   ├── semantic.ts
│   │   │   │   ├── accessibility.ts
│   │   │   │   └── components.ts
│   │   │   ├── scorer.ts
│   │   │   └── ai.ts        # Claude/OpenAI integration
│   │   ├── middleware/      # rate limit, validation
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── PROJECT.md               # this file
└── README.md
```

---

## 5. Tools & Responsibilities

| Tool | Layer | Responsibility |
|------|-------|----------------|
| **React** | Frontend | Render UI, manage form state, display report |
| **TypeScript** | Both | Type-safe contracts between frontend/backend |
| **Vite** | Frontend | Dev server, HMR, optimized prod build |
| **Tailwind CSS** | Frontend | Rapid styling, consistent design tokens |
| **Express** | Backend | HTTP routing, middleware pipeline |
| **Axios** | Backend | Fetch target URL HTML with timeout/headers |
| **Cheerio** | Backend | jQuery-like DOM traversal of fetched HTML |
| **Zod** | Backend | Validate request body & AI response shape |
| **express-rate-limit** | Backend | Prevent abuse of free-tier API quota |
| **dotenv** | Backend | Load API keys from `.env` (never committed) |
| **Rule Engine (custom)** | Backend | Pure functions detecting issues in parsed DOM |
| **Claude / OpenAI API** | Backend | Generate human-readable modernization plan |
| **Vercel** | Infra | Host frontend (auto-deploy from GitHub) |
| **Render / Railway** | Infra | Host backend (auto-deploy from GitHub) |
| **GitHub** | Infra | Source control, PR reviews, CI trigger |

---

## 6. Build Procedure

A clear, ordered build path. Each phase is independently testable.

### Phase 0 — Project Scaffolding (Day 1)
1. Create GitHub repo `legacylift`
2. Initialize monorepo structure: `/frontend` and `/backend` folders
3. Add root `README.md`, `PROJECT.md`, `.gitignore`
4. Set up `frontend` with: `npm create vite@latest frontend -- --template react-ts`
5. Set up `backend` with: `npm init -y` + TypeScript + Express + ts-node-dev
6. Install Tailwind in frontend, configure `tailwind.config.js`
7. Verify both apps start independently (`npm run dev` on each)

### Phase 1 — Backend MVP: Skeleton API (Days 2–3)
1. Create Express server in `backend/src/server.ts`
2. Add CORS middleware allowing the Vite dev origin
3. Create `POST /api/analyze` route that returns mock data
4. Add Zod schema for request validation: `{ url: string().url() }`
5. Add `express-rate-limit` (e.g., 20 req/hour per IP)
6. Add SSRF guard: reject localhost, private IP ranges, non-http(s) schemes
7. Test with `curl` — confirm validation errors and mock response work

### Phase 2 — Analysis Engine Core (Days 4–6)
1. Build `fetcher.ts` — axios wrapper with 10s timeout, real User-Agent, redirect handling
2. Build `parser.ts` — wrap `cheerio.load()` and return a parsed handle
3. Define the **Finding** type: `{ id, category, severity, message, count, evidence }`
4. Implement rule modules one at a time, each as a pure function `(parsed) => Finding[]`:
   - `tableLayout.ts` — detect `<table>` not inside `<figure>` and without `role="presentation"` flagged separately
   - `inlineStyles.ts` — count elements with a `style` attribute
   - `semantic.ts` — check presence of `<header>`, `<nav>`, `<main>`, `<footer>`
   - `accessibility.ts` — `<img>` without `alt`, `<input>` without label, missing lang on html
   - `components.ts` — heuristic detection of Navbar, Hero, Card, Form, Footer
5. Build `scorer.ts` — weighted scoring function (0–100)
6. Wire rules into the `/api/analyze` route — return real findings from a sample HTML

### Phase 3 — AI Layer (Days 7–8)
1. Set up API key in `.env` and `.env.example`
2. Build `ai.ts` with a single function `generatePlan(findings, components)`
3. Craft a **structured prompt** asking for JSON output: `{ summary, steps[], recommendedStack[] }`
4. Validate the AI response with Zod — fall back to a default plan if parsing fails
5. Add request logging (without logging the API key)
6. Add a simple in-memory cache keyed by URL hash to avoid duplicate AI calls during demo

### Phase 4 — Frontend UI (Days 9–11)
1. Design the report layout: hero header, URL input, results card stack
2. Build components:
   - `UrlForm` — input + submit button + loading state
   - `ScoreCard` — circular score visualization
   - `IssueList` — grouped by severity with icons
   - `ComponentChips` — detected components as pills
   - `AiPlanCard` — summary + numbered steps + stack badges
3. Build the API client in `lib/api.ts` with proper typing
4. Handle loading, error, and empty states
5. Style with Tailwind — keep it clean, modern, recruiter-friendly
6. Test against 3–4 known legacy demo URLs

### Phase 5 — Polish & Edge Cases (Days 12–13)
1. Handle network errors, 4xx/5xx from target URL, malformed HTML
2. Add a "Try a sample URL" button with curated demo links
3. Add basic SEO: title, meta description, favicon
4. Add a footer with GitHub link
5. Write the public `README.md` with screenshots, demo URL, and usage

### Phase 6 — Deploy & Demo (Day 14)
1. Deploy backend to Render/Railway (set env vars)
2. Deploy frontend to Vercel (set `VITE_API_URL`)
3. Update CORS allowlist on backend with the Vercel URL
4. End-to-end test from production
5. Record a 30-second demo video for portfolio

---

## 7. Deployment

### Frontend → Vercel
- Connect GitHub repo, set root directory to `/frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` = production backend URL
- Auto-deploys on push to `main`

### Backend → Render (or Railway)
- Connect GitHub repo, set root directory to `/backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables:
  - `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)
  - `ALLOWED_ORIGIN` = Vercel frontend URL
  - `PORT` (provided by host)
  - `NODE_ENV=production`
- Free tier note: backend may sleep after inactivity → first request after sleep takes ~30s. Mention this in README.

### CI/CD
- Both platforms auto-deploy on `git push origin main`
- No GitHub Actions needed for MVP — keep it simple
- Optionally add a basic GitHub Action later for `npm test` on PRs

### Secrets Hygiene
- API keys live in deployment platform env vars, never in code
- `.env` is gitignored; `.env.example` shows the required keys with empty values

---

## 8. Project Conventions

- **Language:** TypeScript everywhere — strict mode on
- **Branching:** `main` is always deployable; feature branches → PR → merge
- **Commits:** Conventional Commits style (`feat:`, `fix:`, `docs:`, `chore:`)
- **Code style:** Prettier + ESLint, default configs
- **API contract:** Backend always returns `{ ok: boolean, data?: T, error?: { code, message } }`
- **Error handling:** Never expose stack traces in production responses
- **Testing:** No mandatory tests for MVP, but a few rule-engine unit tests are encouraged (rules are pure functions — easy to test)

---

## 9. Out of Scope (MVP)

These are intentionally deferred. Listing them prevents scope creep and gives clear "future work" bullets for the resume.

- ❌ Multi-page crawling (analyze a whole site)
- ❌ Authenticated site support (login walls)
- ❌ JavaScript-rendered SPAs (would require Playwright)
- ❌ Auto-generation of React component code
- ❌ Chat-based AI follow-up Q&A
- ❌ User accounts / saved reports / history
- ❌ Visual dependency graphs
- ❌ PDF/Markdown export of the report

---

## Quick Context for AI Assistants

> **If you are an AI assistant reading this for the first time:** LegacyLift is a portfolio web app. A user submits a public URL of a legacy website. A Node.js backend fetches the HTML with axios (no headless browser), parses it with Cheerio, runs a deterministic rule engine to detect issues like table layouts and inline styles, and then sends those findings to Claude/OpenAI to generate a structured modernization plan. A React + Tailwind frontend displays the resulting score, issues, detected components, and migration steps. Frontend is on Vercel; backend is on Render/Railway. The guiding principle is: **rules find facts, AI explains and plans.**