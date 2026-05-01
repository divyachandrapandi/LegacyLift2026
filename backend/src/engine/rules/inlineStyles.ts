import { Finding, ParsedPage } from '../../types';

export function detectInlineStyles($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const evidence: string[] = [];
  let count = 0;

  $('[style]').each((_, el) => {
    count++;
    if (evidence.length < 3) {
      const tag = (el as any).tagName ?? 'element';
      const styleVal = $(el).attr('style') ?? '';
      evidence.push(`<${tag} style="${styleVal.slice(0, 80)}">`);
    }
  });

  if (count > 0) {
    findings.push({
      id: 'inline-styles',
      category: 'styling',
      severity: count > 10 ? 'critical' : 'warning',
      message: `${count} element(s) use inline styles. These should be replaced with utility classes or a stylesheet.`,
      count,
      evidence,
    });
  }

  return findings;
}