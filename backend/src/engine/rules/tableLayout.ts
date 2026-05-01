import { Finding, ParsedPage } from '../../types';

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