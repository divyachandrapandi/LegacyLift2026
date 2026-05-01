import { Finding } from '../types';

// Weight per severity — how many points each issue costs
const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 15,
  warning: 7,
  info: 2,
};

// Max deduction per individual rule — stops one rule from tanking the score alone
const MAX_DEDUCTION_PER_RULE = 20;

/**
 * Computes the modernization score from deterministic findings.
 *
 * Description:
 * - Applies severity-weighted deductions and returns a bounded 0-100 score.
 * - Exists to convert raw issue findings into a recruiter-friendly summary metric.
 *
 * Example input:
 * - `[{ id: "missing-semantic-tags", severity: "critical", count: 4, ... }]`
 *
 * Example output:
 * - `62`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` to build the final API report payload.
 */
export function computeScore(findings: Finding[]): number {
  let totalDeduction = 0;

  for (const finding of findings) {
    const weight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
    // Scale deduction by count but cap it
    const deduction = Math.min(weight * Math.ceil(finding.count / 2), MAX_DEDUCTION_PER_RULE);
    totalDeduction += deduction;
  }

  // Score is 100 minus total deductions, floored at 0
  return Math.max(0, 100 - totalDeduction);
}