import OpenAI from 'openai';
import crypto from 'crypto';
import { z } from 'zod';
import { Finding, DetectedComponent, AiPlan } from '../types';

const client = new OpenAI();

// Module-level cache — lives for the process lifetime
const planCache = new Map<string, AiPlan>();
const MODEL_FALLBACKS = (
  process.env.OPENAI_MODELS?.split(',').map((m) => m.trim()).filter(Boolean) ?? [
    'gpt-4o-mini',
    'gpt-4.1-mini',
    'gpt-4.1',
  ]
);

function isModelAccessError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const maybe = err as { status?: number; message?: string };
  return (
    maybe.status === 403 &&
    typeof maybe.message === 'string' &&
    maybe.message.includes('does not have access to model')
  );
}

/**
 * Zod schema for validating the AI response shape.
 *
 * Description:
 * - Guards against malformed or incomplete AI output before it reaches the frontend.
 * - Exists to enforce the { summary, steps[], recommendedStack[] } contract.
 *
 * Usage in project:
 * - Used inside `generatePlan` to parse and validate the raw JSON extracted from
 *   the OpenAI API response.
 */
const aiPlanSchema = z.object({
  summary: z.string(),
  steps: z.array(z.string()),
  recommendedStack: z.array(z.string()),
});

/**
 * Fallback plan returned when the AI call fails or returns invalid JSON.
 *
 * Description:
 * - Ensures the API always returns a usable aiPlan, even under failure conditions.
 * - Exists so the frontend never receives a null/empty plan.
 *
 * Usage in project:
 * - Returned by `generatePlan` on any error or Zod validation failure.
 */
const DEFAULT_PLAN: AiPlan = {
  summary:
    'This site carries significant legacy technical debt. Prioritise replacing table-based layouts, removing inline styles, and adding semantic HTML before migrating to a component-based React architecture.',
  steps: [
    'Audit all HTML for table-based layouts and replace with CSS Grid or Flexbox',
    'Extract inline styles into a Tailwind CSS utility-class system',
    'Add missing semantic tags: <header>, <nav>, <main>, <footer>',
    'Fix accessibility gaps: alt attributes, form labels, and lang attribute',
    'Componentise repeated UI patterns (Navbar, Hero, Card, Form, Footer) into React components',
  ],
  recommendedStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
};

/**
 * Builds the structured prompt sent to the OpenAI API.
 *
 * Description:
 * - Serialises findings and detected components into a prompt that requests
 *   strict JSON output matching the AiPlan shape.
 * - Exists as a private helper to keep `generatePlan` readable and the prompt
 *   easy to iterate on independently.
 *
 * Example input:
 * - findings: `[{ id: "table-layout", severity: "critical", count: 3, ... }]`
 * - components: `["Navbar", "Footer"]`
 *
 * Example output:
 * - A multi-line prompt string ending with the required JSON shape.
 *
 * Usage in project:
 * - Called only by `generatePlan` in this module.
 */
function buildPrompt(
  findings: Finding[],
  components: DetectedComponent[],
  currentStack: string[]
): string {
  return `You are a web modernization expert helping developers migrate legacy websites to modern React-based architecture.

Analyze the following findings from a legacy website audit:

Findings:
${JSON.stringify(findings, null, 2)}

Detected Components:
${JSON.stringify(components, null, 2)}

Current Stack Already In Use (do not re-recommend these as new adoptions):
${JSON.stringify(currentStack, null, 2)}

Respond with ONLY valid JSON in this exact shape — no markdown, no explanation, no code fences:
{
  "summary": "2-3 sentence overview of the site's modernization needs",
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "recommendedStack": ["Only technologies that are missing or should be newly added"]
}

Rules:
- Do NOT recommend tools already present in "Current Stack Already In Use".
- Prefer upgrade/refactor steps over stack re-adoption when the stack already exists.
- Keep recommendations specific to the provided findings.

Include 4-7 concrete, ordered migration steps. Output only the JSON object.`;
}

/**
 * Generates a structured AI modernization plan from rule-engine findings.
 *
 * Description:
 * - Sends findings and detected components to OpenAI and returns a validated
 *   { summary, steps[], recommendedStack[] } plan.
 * - Results are cached by SHA-256 hash of the URL to avoid duplicate API calls
 *   during demos or repeated requests for the same page.
 * - Falls back to DEFAULT_PLAN on any API error or invalid response shape.
 * - Logs cache hits, plan generation, and errors — never logs the API key.
 *
 * Example input:
 * - url: `"https://example.com"`
 * - findings: `[{ id: "inline-styles", severity: "warning", count: 12, ... }]`
 * - components: `["Navbar", "Footer"]`
 *
 * Example output:
 * - `{ summary: "...", steps: ["Step 1: ...", ...], recommendedStack: ["React", ...] }`
 *
 * Usage in project:
 * - Called by `backend/src/routes/analyze.ts` as step 8 of the analysis pipeline.
 */
export async function generatePlan(
  url: string,
  findings: Finding[],
  components: DetectedComponent[],
  currentStack: string[] = []
): Promise<AiPlan> {
  const normalizedStack = [...new Set(currentStack.map((s) => s.trim()).filter(Boolean))];
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ url, currentStack: normalizedStack }))
    .digest('hex');

  const cached = planCache.get(cacheKey);
  if (cached) {
    console.log(`[ai] cache hit for ${url}`);
    return cached;
  }

  console.log(
    `[ai] generating plan for ${url} — ${findings.length} finding(s), components: ${components.join(', ') || 'none'}, currentStack: ${normalizedStack.join(', ') || 'none'}`
  );

  try {
    for (const model of MODEL_FALLBACKS) {
      try {
        const response = await client.chat.completions.create({
          model,
          max_tokens: 1024,
          messages: [
            { role: 'user', content: buildPrompt(findings, components, normalizedStack) },
          ],
        });

        const text = response.choices[0]?.message?.content ?? '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON object found in AI response');

        const parsed = aiPlanSchema.safeParse(JSON.parse(jsonMatch[0]));

        if (!parsed.success) {
          console.warn('[ai] response failed Zod validation — using default plan');
          return DEFAULT_PLAN;
        }

        const filteredRecommendedStack = parsed.data.recommendedStack.filter(
          (item) =>
            !normalizedStack.some(
              (existing) => existing.toLowerCase() === item.trim().toLowerCase()
            )
        );

        const plan: AiPlan = {
          ...parsed.data,
          recommendedStack: filteredRecommendedStack,
        };

        planCache.set(cacheKey, plan);
        console.log(`[ai] plan cached for ${url} using model ${model}`);
        return plan;
      } catch (modelErr) {
        if (isModelAccessError(modelErr)) {
          console.warn(`[ai] model ${model} not accessible for this project key, trying next fallback`);
          continue;
        }
        throw modelErr;
      }
    }

    throw new Error(
      `No accessible OpenAI models from fallback list: ${MODEL_FALLBACKS.join(', ')}`
    );
  } catch (err) {
    console.error('[ai] generatePlan error:', err instanceof Error ? err.message : err);
    return DEFAULT_PLAN;
  }
}
