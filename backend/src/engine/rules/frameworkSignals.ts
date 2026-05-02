import { ParsedPage } from '../../types';

/**
 * Detects likely framework/tooling signals from fetched page markup.
 *
 * Description:
 * - Uses lightweight heuristics from script/link paths, meta tags, and DOM markers.
 * - Exists to infer a best-effort current stack so AI recommendations can avoid
 *   suggesting tools the target site likely already uses.
 *
 * Example input:
 * - Parsed page containing `/_next/static/` and `<script src=".../jquery.min.js">`.
 *
 * Example output:
 * - `["Next.js", "React", "jQuery"]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` to augment `currentStack` for `generatePlan`.
 */
export function detectFrameworkSignals($: ParsedPage): string[] {
  const detected = new Set<string>();
  const fullHtml = $.html().toLowerCase();
  const scriptSrcs = $('script[src]')
    .map((_, el) => ($(el).attr('src') ?? '').toLowerCase())
    .get();
  const linkHrefs = $('link[href]')
    .map((_, el) => ($(el).attr('href') ?? '').toLowerCase())
    .get();
  const generator = ($('meta[name="generator"]').attr('content') ?? '').toLowerCase();
  const allAssetRefs = `${scriptSrcs.join(' ')} ${linkHrefs.join(' ')}`.toLowerCase();

  const hasAny = (...tokens: string[]): boolean =>
    tokens.some((token) => fullHtml.includes(token) || allAssetRefs.includes(token));

  if (hasAny('/_next/', '__next_data__', 'id="__next"')) {
    detected.add('Next.js');
    detected.add('React');
  }

  if (hasAny('/_nuxt/', '__nuxt')) {
    detected.add('Nuxt');
    detected.add('Vue');
  }

  if (hasAny('ng-version', 'angular', '/runtime-es2015.', '/polyfills-es2015.')) {
    detected.add('Angular');
  }

  if (hasAny('data-reactroot', 'react-dom', 'react.production.min.js', 'id="root"')) {
    detected.add('React');
  }

  if (hasAny('__vite', '/@vite/client')) {
    detected.add('Vite');
  }

  if (hasAny('tailwind', 'tw-')) {
    detected.add('Tailwind CSS');
  }

  if (hasAny('jquery', 'jquery.min.js')) {
    detected.add('jQuery');
  }

  if (hasAny('bootstrap', 'bootstrap.min.css', 'bootstrap.min.js')) {
    detected.add('Bootstrap');
  }

  if (generator.includes('wordpress') || hasAny('wp-content', 'wp-includes')) {
    detected.add('WordPress');
  }

  return Array.from(detected);
}
