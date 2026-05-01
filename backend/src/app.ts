import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRoute } from './routes/analyze';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', rateLimiter);

/**
 * Health-check route for uptime verification.
 *
 * Description:
 * - Returns a lightweight success payload indicating API availability.
 * - Exists to support deployment checks and quick backend diagnostics.
 *
 * Example input:
 * - `GET /health` with no request body.
 *
 * Example output / response:
 * - `{ "ok": true, "message": "LegacyLift API is running" }`
 *
 * Usage in project:
 * - Used by deploy/runtime checks; mounted directly in `backend/src/app.ts`.
 *
 * REST API details:
 * - Method: `GET`
 * - Path: `/health`
 * - Request body: none
 * - Success response: `{ ok: true, message: string }`
 * - Error response: not expected in normal flow
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'LegacyLift API is running' });
});

// Routes
app.use('/api', analyzeRoute);

export default app;