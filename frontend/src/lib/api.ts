import type { AnalyzeResponse, ApiResponse } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

/**
 * Sends a URL to the backend analysis pipeline and returns the full report.
 *
 * Description:
 * - POSTs to /api/analyze and unwraps the { ok, data } envelope.
 * - Throws a human-readable string on API errors or network failures so
 *   callers can display it directly in the UI.
 *
 * Example input:
 * - `"https://zuora.com"`
 *
 * Example output:
 * - `{ url, score, findings, components, currentStack, detectedStack, aiPlan }`
 *
 * Usage in project:
 * - Called by `App.tsx` on form submit.
 */
export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw 'Unable to reach the backend. Make sure the server is running.';
  }

  const json = (await response.json()) as ApiResponse<AnalyzeResponse>;

  if (!json.ok) {
    const msg = json.error.message;
    throw typeof msg === 'string' ? msg : 'The server returned a validation error.';
  }

  return json.data;
}
