import { z } from "zod";

// Patterns that should never be fetched by the server
const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\./, // link-local
  /^https?:\/\/::1/, // IPv6 loopback
];

/**
 * Validates that a submitted URL is safe for server-side fetching.
 *
 * Description:
 * - Blocks localhost, loopback, link-local, and private network targets.
 * - Exists to reduce SSRF risk in LegacyLift's URL-analysis endpoint.
 *
 * Example input:
 * - `"https://example.com"` -> `true`
 * - `"http://localhost:3000"` -> `false`
 *
 * Example output:
 * - `boolean`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` before calling `fetchHtml()`.
 */
export const isSafeURL = (url: string): boolean => {
  // Basic URL format validation
  return !BLOCKED_PATTERNS.some((pattern) => pattern.test(url));
};
