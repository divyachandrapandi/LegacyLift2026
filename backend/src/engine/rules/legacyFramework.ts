import { Finding, ParsedPage } from '../../types';

const LEGACY_JQUERY_RE = /jquery[-.](0|1|2)\.\d+/i;
const LEGACY_BOOTSTRAP_RE = /bootstrap[-.]([34])\.\d+/i;

/**
 * Detects legacy JavaScript library versions that are a maintenance liability.
 *
 * Description:
 * - Flags jQuery 0.x/1.x/2.x and Bootstrap 3/4, framesets, and other
 *   obsolete dependencies as critical outdated-tech findings.
 * - Exists to surface concrete evidence of EOL libraries — distinct from
 *   frameworkSignals.ts which detects the current stack for the AI prompt.
 *
 * Example input:
 * - Parsed page with `<script src="/assets/jquery-1.9.1.min.js">`.
 *
 * Example output:
 * - `[{ id: "legacy-library", severity: "critical", evidence: ['<script src="...jquery-1.9.1...">'] }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectLegacyFramework($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const evidence: string[] = [];

  $('script[src]').each((_, el) => {
    const src = $(el).attr('src') ?? '';
    if (
      (LEGACY_JQUERY_RE.test(src) || LEGACY_BOOTSTRAP_RE.test(src)) &&
      evidence.length < 3
    ) {
      evidence.push(`<script src="${src}">`);
    }
  });

  $('link[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (LEGACY_BOOTSTRAP_RE.test(href) && evidence.length < 3) {
      evidence.push(`<link href="${href}">`);
    }
  });

  $('frameset, frame').each((_, el) => {
    if (evidence.length < 3) evidence.push($.html(el)?.slice(0, 120) ?? '<frameset>');
  });

  if (evidence.length > 0) {
    findings.push({
      id: 'legacy-library',
      category: 'framework',
      severity: 'critical',
      message: `${evidence.length} legacy library/framework signal(s) detected (jQuery 1/2.x, Bootstrap 3/4, frameset) — EOL and unmaintained.`,
      count: evidence.length,
      evidence,
    });
  }

  return findings;
}
