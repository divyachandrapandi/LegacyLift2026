import { Finding, ParsedPage } from '../../types';

/**
 * Detects deprecated HTML elements and attributes removed in HTML5.
 *
 * Description:
 * - Flags <font>, <center>, <marquee>, <blink>, bgcolor, and align attributes
 *   that were deprecated in HTML 4.01 and removed in HTML5.
 * - Exists to surface hard evidence that the page was built before modern
 *   web standards, making it a maintenance and rendering liability.
 *
 * Example input:
 * - Parsed page containing `<font color="red">` and `<center>`.
 *
 * Example output:
 * - `[{ id: "deprecated-html-elements", severity: "warning", evidence: ["<font color=..."] }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectDeprecatedHtml($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const evidence: string[] = [];

  const DEPRECATED_TAGS = ['font', 'center', 'marquee', 'blink', 'basefont', 'big', 'tt'];

  DEPRECATED_TAGS.forEach((tag) => {
    $(tag).each((_, el) => {
      if (evidence.length < 3) {
        evidence.push($.html(el)?.slice(0, 120) ?? `<${tag}>`);
      }
    });
  });

  // Deprecated presentational attributes on any element
  const DEPRECATED_ATTRS = ['bgcolor', 'text', 'vlink', 'alink', 'background'];
  DEPRECATED_ATTRS.forEach((attr) => {
    $(`[${attr}]`).each((_, el) => {
      if (evidence.length < 3) {
        evidence.push($.html(el)?.slice(0, 120) ?? `element with ${attr}=`);
      }
    });
  });

  if (evidence.length > 0) {
    findings.push({
      id: 'deprecated-html-elements',
      category: 'deprecated-html',
      severity: 'warning',
      message: `${evidence.length} deprecated HTML element(s) or attribute(s) found — removed in HTML5.`,
      count: evidence.length,
      evidence,
    });
  }

  return findings;
}
