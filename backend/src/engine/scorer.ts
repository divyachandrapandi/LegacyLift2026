import { Finding } from '../types';

// Base weight per severity
const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 15,
  warning: 7,
  info: 2,
};

// Category multipliers — high-liability categories cost more per finding
const CATEGORY_MULTIPLIERS: Record<string, number> = {
  security: 1.5,      // direct user/business risk
  framework: 1.3,     // EOL dependencies = unmaintained codebase
  mobile: 1.3,        // Google mobile-first — directly impacts traffic
  seo: 1.0,
  performance: 1.0,
  'deprecated-html': 1.0,
  layout: 1.0,
  styling: 1.0,
  semantics: 1.0,
  accessibility: 1.0,
  components: 1.0,
};

// Max deduction per individual rule — stops one rule from tanking the score alone
const MAX_DEDUCTION_PER_RULE = 20;

/**
 * Computes the modernization / liability score from deterministic findings.
 *
 * Description:
 * - Applies severity-weighted deductions scaled by a category multiplier,
 *   so security, legacy framework, and mobile issues cost proportionally more.
 * - Returns a bounded 0-100 score: higher = more modern, lower = more debt.
 * - Exists to convert raw findings into a recruiter-friendly summary metric.
 *
 * Example input:
 * - `[{ id: "mixed-content", category: "security", severity: "critical", count: 2 }]`
 *
 * Example output:
 * - `47`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` to build the final API report payload.
 */
export function computeScore(findings: Finding[]): number {
  let totalDeduction = 0;

  for (const finding of findings) {
    const baseWeight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
    const multiplier = CATEGORY_MULTIPLIERS[finding.category] ?? 1.0;

    // Scale by count, apply category multiplier, then cap per rule
    const rawDeduction = baseWeight * multiplier * Math.ceil(finding.count / 2);
    const deduction = Math.min(rawDeduction, MAX_DEDUCTION_PER_RULE);
    totalDeduction += deduction;
  }

  return Math.max(0, Math.round(100 - totalDeduction));
}
