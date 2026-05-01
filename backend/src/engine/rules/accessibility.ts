import { Finding, ParsedPage} from '../../types';

export function detectAccessibilityIssues($: ParsedPage): Finding[] {
  const findings: Finding[] = [];

  // ── 1. Images without alt text ───────────────────────────────────────────
  const imgsWithoutAlt: string[] = [];
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined) {
      const src = $(el).attr('src')?.slice(0, 60) ?? 'unknown';
      if (imgsWithoutAlt.length < 3) imgsWithoutAlt.push(`<img src="${src}">`);
    }
  });

  if (imgsWithoutAlt.length > 0) {
    findings.push({
      id: 'img-missing-alt',
      category: 'accessibility',
      severity: 'critical',
      message: `${imgsWithoutAlt.length} image(s) are missing alt attributes.`,
      count: imgsWithoutAlt.length,
      evidence: imgsWithoutAlt,
    });
  }

  // ── 2. Inputs without associated labels ──────────────────────────────────
  const unlabelledInputs: string[] = [];
  $('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').each((_, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledBy = $(el).attr('aria-labelledby');
    const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      const type = $(el).attr('type') ?? 'text';
      if (unlabelledInputs.length < 3) {
        unlabelledInputs.push(`<input type="${type}" id="${id ?? 'none'}">`);
      }
    }
  });

  if (unlabelledInputs.length > 0) {
    findings.push({
      id: 'input-missing-label',
      category: 'accessibility',
      severity: 'warning',
      message: `${unlabelledInputs.length} input(s) have no associated label, aria-label, or aria-labelledby.`,
      count: unlabelledInputs.length,
      evidence: unlabelledInputs,
    });
  }

  // ── 3. Missing lang attribute on <html> ───────────────────────────────────
  const htmlLang = $('html').attr('lang');
  if (!htmlLang) {
    findings.push({
      id: 'missing-html-lang',
      category: 'accessibility',
      severity: 'warning',
      message: 'The <html> element is missing a lang attribute. Screen readers need this to use the correct language profile.',
      count: 1,
      evidence: ['<html> has no lang attribute'],
    });
  }

  return findings;
}