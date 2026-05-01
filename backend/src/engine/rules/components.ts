import { DetectedComponent, ParsedPage } from '../../types';

/**
 * Heuristically detects common UI component patterns from legacy markup.
 *
 * Description:
 * - Infers components like Navbar, Hero, Card, Form, and Footer from tags/classes/ids.
 * - Exists to help the AI layer suggest a practical React component migration plan.
 *
 * Example input:
 * - Parsed page with `<nav>...</nav>` and `<section class="hero">...</section>`.
 *
 * Example output:
 * - `["Navbar", "Hero", "Form"]`
 *
 * Usage in project:
 * - Used by `backend/src/routes/analyze.ts` after issue detection and before response assembly.
 */
export function detectComponents($: ParsedPage): DetectedComponent[] {
  const detected = new Set<DetectedComponent>();

  // ── Navbar ────────────────────────────────────────────────────────────────
  if (
    $('nav').length > 0 ||
    $('[class*="nav"]').length > 0 ||
    $('[id*="nav"]').length > 0 ||
    $('[class*="header"]').length > 0
  ) {
    detected.add('Navbar');
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  if (
    $('[class*="hero"]').length > 0 ||
    $('[id*="hero"]').length > 0 ||
    $('[class*="banner"]').length > 0 ||
    $('[class*="jumbotron"]').length > 0
  ) {
    detected.add('Hero');
  }

  // ── Card ──────────────────────────────────────────────────────────────────
  if (
    $('[class*="card"]').length > 0 ||
    $('[class*="tile"]').length > 0 ||
    $('[class*="product"]').length > 0
  ) {
    detected.add('Card');
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  if ($('form').length > 0) {
    detected.add('Form');
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  if (
    $('footer').length > 0 ||
    $('[class*="footer"]').length > 0 ||
    $('[id*="footer"]').length > 0
  ) {
    detected.add('Footer');
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  if (
    $('aside').length > 0 ||
    $('[class*="sidebar"]').length > 0 ||
    $('[id*="sidebar"]').length > 0
  ) {
    detected.add('Sidebar');
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  if ($('table').length > 0) {
    detected.add('Table');
  }

  return Array.from(detected);
}