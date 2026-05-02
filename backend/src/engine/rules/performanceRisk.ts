import { Finding, ParsedPage } from '../../types';

/**
 * Detects patterns that harm page load performance.
 *
 * Description:
 * - Flags render-blocking <script> tags in <head> and images without lazy loading.
 * - Exists because performance issues directly impact Core Web Vitals scores,
 *   SEO ranking, and user retention — all liability indicators for legacy sites.
 *
 * Example input:
 * - Parsed page with `<script src="app.js">` inside `<head>` and 10 `<img>` tags
 *   with no `loading="lazy"`.
 *
 * Example output:
 * - `[{ id: "render-blocking-scripts", severity: "warning", count: 2, ... }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectPerformanceRisk($: ParsedPage): Finding[] {
  const findings: Finding[] = [];

  // Render-blocking scripts in <head> (no async/defer)
  const blockingEvidence: string[] = [];
  $('head script[src]').each((_, el) => {
    const hasAsync = $(el).attr('async') !== undefined;
    const hasDefer = $(el).attr('defer') !== undefined;
    if (!hasAsync && !hasDefer && blockingEvidence.length < 3) {
      blockingEvidence.push(`<script src="${$(el).attr('src')}">`);
    }
  });

  if (blockingEvidence.length > 0) {
    findings.push({
      id: 'render-blocking-scripts',
      category: 'performance',
      severity: 'warning',
      message: `${blockingEvidence.length} render-blocking <script> tag(s) in <head> without async or defer.`,
      count: blockingEvidence.length,
      evidence: blockingEvidence,
    });
  }

  // Images without lazy loading
  const nonLazyImgs: string[] = [];
  $('img').each((_, el) => {
    const loading = $(el).attr('loading');
    if (loading !== 'lazy' && nonLazyImgs.length < 3) {
      const src = $(el).attr('src') ?? '';
      nonLazyImgs.push(`<img src="${src.slice(0, 80)}">`);
    }
  });

  if (nonLazyImgs.length > 0) {
    findings.push({
      id: 'no-lazy-loading',
      category: 'performance',
      severity: 'info',
      message: `${nonLazyImgs.length} image(s) missing loading="lazy" — may slow initial page load.`,
      count: nonLazyImgs.length,
      evidence: nonLazyImgs,
    });
  }

  return findings;
}
