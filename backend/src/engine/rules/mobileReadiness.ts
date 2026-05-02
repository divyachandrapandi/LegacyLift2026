import { Finding, ParsedPage } from '../../types';

/**
 * Detects missing or broken mobile-readiness signals.
 *
 * Description:
 * - Checks for a viewport meta tag and fixed-width layout attributes that
 *   prevent the page from rendering correctly on mobile devices.
 * - Exists because non-responsive sites are both a UX liability and a
 *   Google search ranking penalty (Core Web Vitals / mobile-first indexing).
 *
 * Example input:
 * - Parsed page with no `<meta name="viewport">` and a `<table width="960">`.
 *
 * Example output:
 * - `[{ id: "no-viewport-meta", severity: "critical", ... }, { id: "fixed-width-layout", ... }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectMobileReadiness($: ParsedPage): Finding[] {
  const findings: Finding[] = [];

  // Missing viewport meta
  const hasViewport = $('meta[name="viewport"]').length > 0;
  if (!hasViewport) {
    findings.push({
      id: 'no-viewport-meta',
      category: 'mobile',
      severity: 'critical',
      message: 'No <meta name="viewport"> tag found — page will not render correctly on mobile devices.',
      count: 1,
      evidence: ['<meta name="viewport"> is missing from <head>'],
    });
  }

  // Fixed-width table or div layouts
  const fixedEvidence: string[] = [];
  $('table[width], div[style]').each((_, el) => {
    if (fixedEvidence.length >= 3) return;
    const width = $(el).attr('width');
    const style = $(el).attr('style') ?? '';
    const hasFixedWidth =
      (width && /^\d+$/.test(width.trim())) ||
      /width\s*:\s*\d+px/i.test(style);
    if (hasFixedWidth) {
      fixedEvidence.push($.html(el)?.slice(0, 120) ?? '');
    }
  });

  if (fixedEvidence.length > 0) {
    findings.push({
      id: 'fixed-width-layout',
      category: 'mobile',
      severity: 'warning',
      message: `${fixedEvidence.length} element(s) use fixed pixel widths — incompatible with responsive design.`,
      count: fixedEvidence.length,
      evidence: fixedEvidence,
    });
  }

  return findings;
}
