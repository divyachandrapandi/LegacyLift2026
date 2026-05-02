import { Router, Request, Response } from "express";
import { z } from "zod";
import { isSafeURL } from '../middleware/ssrfGuard';
import { fetchHtml } from '../engine/fetcher';
import { parsePage } from '../engine/parser';
import { detectTableLayout } from '../engine/rules/tableLayout';
import { detectInlineStyles } from '../engine/rules/inlineStyles';
import { detectSemanticGaps } from '../engine/rules/semantic';
import { detectAccessibilityIssues } from '../engine/rules/accessibility';
import { detectComponents } from '../engine/rules/components';
import { computeScore } from '../engine/scorer';
import { generatePlan } from '../engine/ai';

export const analyzeRoute = Router();

/**
 * Request body schema for the analyze endpoint.
 *
 * Description:
 * - Ensures URL payload is non-empty, valid, and HTTP(S) only.
 * - Exists to fail fast before costly fetch/parse/rule operations.
 *
 * Example input:
 * - `{ "url": "https://example.com" }`
 *
 * Example output:
 * - Parsed payload `{ url: "https://example.com" }` or validation errors.
 *
 * Usage in project:
 * - Used by the `/analyze` route handler in this module.
 */
const analyzeRequestSchema = z.object({
  url: z
    .string({ error: "URL is required" })
    .trim()
    .min(1, { message: "URL is required" })
    .url({ message: "Invalid URL format" })
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "Only HTTP(s) protocol allowed",
    }),
});

/**
 * LegacyLift analysis pipeline endpoint.
 *
 * Description:
 * - Orchestrates validation, SSRF protection, HTML fetch, parsing, rule execution,
 *   component detection, and score calculation before returning a report payload.
 * - Exists as the core backend entry point that powers frontend report rendering.
 *
 * Example input:
 * - Request body: `{ "url": "https://example.com" }`
 *
 * Example output / response:
 * - Success (200):
 *   `{ "ok": true, "data": { "url": "https://example.com", "score": 62, "findings": [...], "components": ["Navbar"], "aiPlan": {...} } }`
 * - Error (400):
 *   `{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": {...} } }`
 *
 * Usage in project:
 * - Mounted by `backend/src/app.ts` under `/api`, exposed as `/api/analyze`.
 *
 * REST API details:
 * - Method: `POST`
 * - Path: `/api/analyze`
 * - Request body: `{ "url": "https://example.com" }`
 * - Success response: `{ ok: true, data: { url, score, findings, components, aiPlan } }`
 * - Error response: `{ ok: false, error: { code, message } }`
 */
analyzeRoute.post('/analyze', async (req: Request, res: Response) => {
  // ── 1. Validate input ─────────────────────────────────────────────────────
  const result = analyzeRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: result.error.format() },
    });
  }

  const { url } = result.data;

  // ── 2. SSRF guard ─────────────────────────────────────────────────────────
  if (!isSafeURL(url)) {
    return res.status(403).json({
      ok: false,
      error: { code: 'FORBIDDEN_URL', message: 'Internal and private URLs are not allowed.' },
    });
  }

  // ── 3. Fetch HTML ─────────────────────────────────────────────────────────
  let html: string;
  try {
    const fetched = await fetchHtml(url);
    html = fetched.html;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch URL';
    return res.status(422).json({
      ok: false,
      error: { code: 'FETCH_ERROR', message },
    });
  }

  // ── 4. Parse ──────────────────────────────────────────────────────────────
  const $ = parsePage(html);

  // ── 5. Run rule engine ────────────────────────────────────────────────────
  const findings = [
    ...detectTableLayout($),
    ...detectInlineStyles($),
    ...detectSemanticGaps($),
    ...detectAccessibilityIssues($),
  ];

  // ── 6. Detect components ──────────────────────────────────────────────────
  const components = detectComponents($);

  // ── 7. Score ──────────────────────────────────────────────────────────────
  const score = computeScore(findings);

  // ── 8. Generate AI modernization plan ────────────────────────────────────
  const aiPlan = await generatePlan(url, findings, components);

  return res.json({
    ok: true,
    data: {
      url,
      score,
      findings,
      components,
      aiPlan,
    },
  });
});