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

export const isSafeURL = (url: string): boolean => {
  // Basic URL format validation
  return !BLOCKED_PATTERNS.some((pattern) => pattern.test(url));
};
