import { Finding, ParsedPage } from '../../types';

/**
 * Detects table-based layout usage that should be modernized.
 *
 * Description:
 * - Flags likely non-data tables used for page layout.
 * - Exists to highlight legacy structure patterns common in older websites.
 *
 * Example input:
 * - Parsed page containing `<table><tr><td><div>Page layout</div></td></tr></table>`.
 *
 * Example output:
 * - `[{ id: "table-layout", severity: "critical", count: 1, evidence: ["<table>..."] }]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` as part of the rule engine findings pipeline.
 */
export function detectTableLayout($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const evidence: string[] = [];

  // Tables used for layout (not data) — no role="presentation" and not in <figure>
  $('table').each((_, el) => {
    const role = $(el).attr('role');
    const insideFigure = $(el).closest('figure').length > 0;
    const isDataTable =
      $(el).find('th').length > 0 || $(el).attr('summary');

    if (!insideFigure && role !== 'presentation' && !isDataTable) {
      if (evidence.length < 3) {
        // Grab outer HTML trimmed to 120 chars for AI context
        const snippet = $.html(el)?.slice(0, 120) ?? '';
        evidence.push(snippet);
      }
    }
  });

  const layoutTableCount = evidence.length;

  if (layoutTableCount > 0) {
    findings.push({
      id: 'table-layout',
      category: 'layout',
      severity: 'critical',
      message: `${layoutTableCount} table(s) detected that appear to be used for layout instead of data.`,
      count: layoutTableCount,
      evidence,
    });
  }

  return findings;
}