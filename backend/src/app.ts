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

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'LegacyLift API is running' });
});

// Routes
app.use('/api', analyzeRoute);

export default app;