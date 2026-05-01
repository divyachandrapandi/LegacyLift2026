import { DetectedComponent, ParsedPage } from '../../types';

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