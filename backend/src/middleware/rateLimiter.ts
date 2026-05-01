import rateLimit from "express-rate-limit";

/**
 * Global API rate limiter for LegacyLift endpoints.
 *
 * Description:
 * - Limits requests per IP to protect free-tier backend resources.
 * - Exists to prevent abuse and keep the `/api/analyze` endpoint stable.
 *
 * Example input:
 * - 21 requests from same IP within one hour.
 *
 * Example output / response:
 * - `{ ok: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again in an hour." } }`
 *
 * Usage in project:
 * - Registered in `backend/src/app.ts` via `app.use('/api', rateLimiter)`.
 */
export const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // max 20 requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again in an hour.",
    },
  },
});
