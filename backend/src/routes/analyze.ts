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

export const analyzeRoute = Router();

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

  // ── 8. Return (AI plan wired in Phase 3) ─────────────────────────────────
  return res.json({
    ok: true,
    data: {
      url,
      score,
      findings,
      components,
      aiPlan: {
        summary: 'AI plan coming in Phase 3',
        steps: [],
        recommendedStack: ['React', 'Tailwind', 'Vite'],
      },
    },
  });
});