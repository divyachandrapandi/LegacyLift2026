import { Finding, ParsedPage } from '../../types';

// Semantic landmarks every modern page should have
const SEMANTIC_TAGS = ['header', 'nav', 'main', 'footer', 'article', 'section'] as const;

export function detectSemanticGaps($: ParsedPage): Finding[] {
  const findings: Finding[] = [];
  const missing: string[] = [];

  for (const tag of SEMANTIC_TAGS) {
    if ($(tag).length === 0) {
      missing.push(`<${tag}>`);
    }
  }

  // Check if page relies entirely on <div> for structure
  const divCount = $('div').length;
  const semanticCount = SEMANTIC_TAGS.reduce((acc, tag) => acc + $(tag).length, 0);
  const divHeavy = divCount > 10 && semanticCount < 2;

  if (missing.length > 0) {
    findings.push({
      id: 'missing-semantic-tags',
      category: 'semantics',
      severity: missing.length >= 3 ? 'critical' : 'warning',
      message: `Missing semantic HTML elements: ${missing.join(', ')}`,
      count: missing.length,
      evidence: missing,
    });
  }

  if (divHeavy) {
    findings.push({
      id: 'div-heavy-layout',
      category: 'semantics',
      severity: 'warning',
      message: `Page uses ${divCount} <div> elements with only ${semanticCount} semantic landmark(s). Consider restructuring with semantic HTML.`,
      count: divCount,
      evidence: [`${divCount} divs found`, `${semanticCount} semantic elements found`],
    });
  }

  return findings;
}