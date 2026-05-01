# LegacyLift — Architecture Workflow

## Quick Workflow (Plain English)

1. User pastes a URL in the frontend and clicks Analyze.
2. Frontend validates format and sends `POST /api/analyze` to backend.
3. Backend validates again, applies rate limit, and blocks unsafe URLs (SSRF guard).
4. Backend fetches the target page HTML using axios.
5. Backend parses HTML using Cheerio.
6. Rule engine runs deterministic checks (table layout, inline styles, semantic gaps, accessibility, components, framework signals).
7. Scorer computes a technical debt / modernization score (0-100).
8. AI layer receives findings and returns a structured modernization plan.
9. Backend sends one JSON report to frontend (`score`, `issues`, `components`, `aiPlan`, `meta`).
10. Frontend renders the final report sections for the user.

## Workflow Image

![LegacyLift workflow illustration](./workflow.png)

---

```mermaid
flowchart TD
    User(["👤 User (Browser)"])

    subgraph Frontend ["Frontend — React + Vite · Hosted on Vercel"]
        UrlForm["UrlForm\nURL input + validation"]
        ApiClient["API Client\nlib/api.ts"]
        ReportView["Report View\nScoreCard · IssueList\nComponentChips · AiPlanCard"]
    end

    subgraph Backend ["Backend — Node.js + Express · Hosted on Render / Railway"]
        Middleware["Middleware\nCORS · Rate Limit · Zod · SSRF Guard"]
        Route["POST /api/analyze"]

        subgraph Engine ["Analysis Engine"]
            Fetcher["Fetcher\naxios · 10s timeout\nreal User-Agent"]
            Parser["Parser\nCheerio · load HTML"]
            Rules["Rule Engine\n─────────────\ntableLayout\ninlineStyles\nsemantic\naccessibility\ncomponents\nframeworkSignals"]
            Scorer["Scorer\nweighted 0–100"]
        end

        AILayer["AI Layer\nai.ts · generatePlan()"]
    end

    ExtAI(["☁️ Claude / OpenAI API"])
    GitHub(["🐙 GitHub\nSource control · CI/CD trigger"])

    User -->|"paste URL"| UrlForm
    UrlForm --> ApiClient
    ApiClient -->|"POST /api/analyze\n{ url }"| Middleware
    Middleware --> Route
    Route --> Fetcher
    Fetcher -->|"raw HTML"| Parser
    Parser -->|"Cheerio handle"| Rules
    Rules -->|"findings[]"| Scorer
    Scorer -->|"score + findings"| AILayer
    AILayer -->|"structured prompt"| ExtAI
    ExtAI -->|"{ summary, steps[], stack[] }"| AILayer
    AILayer -->|"aiPlan"| Route
    Route -->|"{ score, issues,\ncomponents, aiPlan }"| ApiClient
    ApiClient --> ReportView
    ReportView -->|"renders report"| User

    GitHub -.->|"auto-deploy"| Frontend
    GitHub -.->|"auto-deploy"| Backend
```

## Layer Summary

| Layer | Tech | Host |
|-------|------|------|
| Frontend | React 18 · TypeScript · Vite · Tailwind | Vercel |
| Backend | Node.js · Express · TypeScript | Render / Railway |
| Analysis Engine | Axios · Cheerio · Custom rule modules | (part of backend) |
| AI Layer | Claude API / OpenAI API | External |
| Source Control | GitHub | GitHub |

> **Core principle:** Rules find facts. AI explains and plans.

## Build Workflow (Implementation View)

```mermaid
sequenceDiagram
    autonumber
    participant U as User (Browser)
    participant F as Frontend (React)
    participant B as Backend API (Express)
    participant FE as Fetcher (axios)
    participant P as Parser (Cheerio)
    participant R as Rule Engine
    participant S as Scorer
    participant AI as AI Layer (Claude/OpenAI)

    U->>F: Paste URL + click Analyze
    F->>F: Basic validation (empty/format/http-https)
    F->>B: POST /api/analyze { url }

    B->>B: Validate again (Zod)
    B->>B: Rate-limit + SSRF guard checks

    B->>FE: Fetch target page HTML (timeout + user-agent)
    FE-->>B: Raw HTML
    B->>P: Load HTML into Cheerio DOM
    P-->>B: Parsed DOM handle

    B->>R: Run deterministic rules
    R-->>B: findings[] + detected components

    B->>S: Compute modernization score (0-100)
    S-->>B: score

    B->>AI: Send findings/components for plan generation
    AI-->>B: summary + ordered migration steps + recommended stack

    B-->>F: JSON report { score, issues, components, aiPlan, meta }
    F->>U: Render report cards and migration plan
```
