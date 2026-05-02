import { Finding, ParsedPage } from '../../types';

/**
 * Detects missing SEO essentials that affect search visibility.
 *
 * Description:
 * - Checks for <title>, meta description, and Open Graph tags.
 * - Exists because missing SEO tags are a direct business liability —
 *   they reduce organic traffic and social share previews.
 *
 * Example input:
 * - Parsed page with no <meta name="description"> and no <title>.
 *
 * Example output:
 * - `[{ id: "missing-seo-tags", severity: "warning", evidence: ["Missing: <title>", ...] }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectSeoHealth($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const missing: string[] = [];

  if ($('title').length === 0 || $('title').text().trim() === '') {
    missing.push('Missing or empty <title> tag');
  }

  if ($('meta[name="description"]').length === 0) {
    missing.push('Missing <meta name="description">');
  }

  if ($('meta[property="og:title"]').length === 0) {
    missing.push('Missing <meta property="og:title"> (Open Graph)');
  }

  if ($('meta[property="og:description"]').length === 0) {
    missing.push('Missing <meta property="og:description"> (Open Graph)');
  }

  if (missing.length > 0) {
    findings.push({
      id: 'missing-seo-tags',
      category: 'seo',
      severity: 'warning',
      message: `${missing.length} SEO tag(s) missing — affects search ranking and social sharing.`,
      count: missing.length,
      evidence: missing,
    });
  }

  return findings;
}
