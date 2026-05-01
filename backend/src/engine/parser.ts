import * as cheerio from 'cheerio';
import { ParsedPage } from '../types';

/**
 * Converts fetched HTML into a Cheerio parser handle for rule execution.
 *
 * Description:
 * - Loads raw markup into Cheerio and returns a queryable DOM-like API.
 * - Exists to separate parsing concerns from route/controller logic.
 *
 * Example input:
 * - `"<html><body><nav></nav><main>...</main></body></html>"`
 *
 * Example output:
 * - `ParsedPage` instance used like `$('nav').length`.
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` after `fetchHtml()` and before rule functions.
 */
export function parsePage(html: string): ParsedPage {
  return cheerio.load(html, {
    // Treat input as HTML (not XML — avoids self-closing tag issues)
    xmlMode: false,
  });
}