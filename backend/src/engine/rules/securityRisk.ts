import { Finding, ParsedPage } from '../../types';

/**
 * Detects security vulnerabilities and risky patterns in page markup.
 *
 * Description:
 * - Flags mixed content (http:// assets on a page), and target="_blank" links
 *   without rel="noopener noreferrer" which enable reverse tabnapping attacks.
 * - Exists because security issues are the highest-priority liability category —
 *   they expose users and the business to direct risk.
 *
 * Example input:
 * - Parsed page with `<script src="http://cdn.example.com/app.js">` and
 *   `<a href="https://partner.com" target="_blank">`.
 *
 * Example output:
 * - `[{ id: "mixed-content", severity: "critical", ... }, { id: "unsafe-blank-target", ... }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectSecurityRisk($: ParsedPage): Finding[] {
  const findings: Finding[] = [];

  // Mixed content — http:// assets loaded on the page
  const mixedEvidence: string[] = [];
  $('script[src], link[href], img[src], iframe[src]').each((_, el) => {
    const attr =
      $(el).attr('src') || $(el).attr('href') || '';
    if (attr.startsWith('http://') && mixedEvidence.length < 3) {
      const tag = el.type === 'tag' ? el.name : 'element';
      mixedEvidence.push(`<${tag} with http:// asset: ${attr.slice(0, 80)}>`);
    }
  });

  if (mixedEvidence.length > 0) {
    findings.push({
      id: 'mixed-content',
      category: 'security',
      severity: 'critical',
      message: `${mixedEvidence.length} resource(s) loaded over http:// — exposes users to mixed-content attacks.`,
      count: mixedEvidence.length,
      evidence: mixedEvidence,
    });
  }

  // Unsafe target="_blank" without rel="noopener"
  const unsafeLinks: string[] = [];
  $('a[target="_blank"]').each((_, el) => {
    const rel = $(el).attr('rel') ?? '';
    const hasNoopener = rel.includes('noopener') || rel.includes('noreferrer');
    if (!hasNoopener && unsafeLinks.length < 3) {
      const href = $(el).attr('href') ?? '';
      unsafeLinks.push(`<a href="${href.slice(0, 80)}" target="_blank">`);
    }
  });

  if (unsafeLinks.length > 0) {
    findings.push({
      id: 'unsafe-blank-target',
      category: 'security',
      severity: 'warning',
      message: `${unsafeLinks.length} link(s) use target="_blank" without rel="noopener noreferrer" — reverse tabnapping risk.`,
      count: unsafeLinks.length,
      evidence: unsafeLinks,
    });
  }

  return findings;
}
