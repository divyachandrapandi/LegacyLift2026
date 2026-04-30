import { Router, Request, Response } from "express";
import { z } from "zod";
import { isSafeURL } from "../middleware/ssrfGuard";
import { is } from "zod/locales";

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

analyzeRoute.post("/analyze", async (req: Request, res: Response) => {
  const result = analyzeRequestSchema.safeParse(req.body);

  console.log(result);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: result.error.format(),
      },
    });
  }

  const { url } = result.data;

  // SSRF protection
  if (!isSafeURL(url)) {
    return res.status(403).json({
      ok: false,
      error: {
        code: "FORBIDDEN_URL",
        message: "Internal and private URLs are not allowed.",
      },
    });
  }

  // Phase 1 placeholder — returns mock data for now
  return res.json({
    ok: true,
    data: {
      score: 42,
      url,
      issues: ["Placeholder — rule engine not wired yet"],
      components: ["Navbar", "Footer"],
      aiPlan: {
        summary: "Placeholder — AI layer not wired yet",
        steps: ["Step 1 placeholder", "Step 2 placeholder"],
        recommendedStack: ["React", "Tailwind", "Vite"],
      },
    },
  });
});
