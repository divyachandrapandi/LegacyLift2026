// Frontend mirror of backend types — no cheerio dependency

export type Severity = 'critical' | 'warning' | 'info';

export type FindingCategory =
  | 'layout'
  | 'styling'
  | 'semantics'
  | 'accessibility'
  | 'components'
  | 'framework'
  | 'mobile'
  | 'seo'
  | 'performance'
  | 'security'
  | 'deprecated-html';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  message: string;
  count: number;
  evidence: string[];
}

export type DetectedComponent =
  | 'Navbar'
  | 'Hero'
  | 'Card'
  | 'Form'
  | 'Footer'
  | 'Sidebar'
  | 'Table';

export interface AiPlan {
  summary: string;
  steps: string[];
  recommendedStack: string[];
}

export interface AnalyzeResponse {
  url: string;
  score: number;
  findings: Finding[];
  components: DetectedComponent[];
  currentStack: string[];
  detectedStack: string[];
  aiPlan: AiPlan;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: { code: string; message: string | object };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
