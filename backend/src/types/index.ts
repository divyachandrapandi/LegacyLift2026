import * as cheerio from 'cheerio';

export type Severity = "critical" | "warning" | "info";

export type FindingCategory =
  | "layout"
  | "styling"
  | "semantics"
  | "accessibility"
  | "components";

export interface Finding {
  id: string; // unique rule id e.g. "table-layout"
  category: FindingCategory;
  severity: Severity;
  message: string; // human readable description
  count: number; // how many instances found
  evidence: string[]; // sample snippets (max 3) for AI context
}

// ─── Detected Components ────────────────────────────────────────────────────
export type DetectedComponent =
  | "Navbar"
  | "Hero"
  | "Card"
  | "Form"
  | "Footer"
  | "Sidebar"
  | "Table";

// ─── Analysis Result ────────────────────────────────────────────────────────
export interface AnalysisResult {
  url: string;
  score: number;
  findings: Finding[];
  components: DetectedComponent[];
}

// ─── AI Plan ────────────────────────────────────────────────────────────────
export interface AiPlan {
  summary: string;
  steps: string[];
  recommendedStack: string[];
}

// ─── Full Report ─────────────────────────────────────────────────────────────
export interface Report {
  url: string;
  score: number;
  findings: Finding[];
  components: DetectedComponent[];
  aiPlan: AiPlan;
}

export interface FetchResult {
  html: string;
  finalUrl: string;   // URL after any redirects
  statusCode: number;
}

export type ParsedPage = cheerio.CheerioAPI;
