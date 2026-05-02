import { useState, useEffect, useRef } from 'react';
import './styles/main.scss';

import { analyzeUrl } from './lib/api';
import type { AnalyzeResponse } from './lib/types';

import UrlForm from './components/UrlForm';
import ScoreCard from './components/ScoreCard';
import IssueList from './components/IssueList';
import ComponentChips from './components/ComponentChips';
import AiPlanCard from './components/AiPlanCard';

const LOADING_STEPS = [
  { label: 'Fetching page HTML…',     detail: 'Sending request to target URL' },
  { label: 'Running rule engine…',    detail: 'Checking layout, security, SEO, and more' },
  { label: 'Generating AI plan…',     detail: 'Asking the AI to build your modernization blueprint' },
];

const DEMO_URLS = [
  'https://www.spacex.com/',
  'https://saaspo.com/',
  'https://www.hubspot.com/',
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); }, []);

  async function handleAnalyze(url: string) {
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setReport(null);

    stepTimerRef.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 4000);

    try {
      const data = await analyzeUrl(url);
      setReport(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
    }
  }

  function handleReset() {
    setReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page-wrapper">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="content-container">
          <h1 className="hero__title">
            <span style={{ color: 'var(--accent)' }}>Legacy</span>Lift
          </h1>
          <p className="hero__tagline">
            Paste any public URL — get an AI-powered modernization blueprint in seconds.
          </p>
          <UrlForm onSubmit={handleAnalyze} loading={loading} />

          {/* Demo URL chips */}
          {!report && !loading && (
            <div className="demo-urls">
              <span className="demo-urls__label">Try a demo</span>
              {DEMO_URLS.map((url) => (
                <button
                  key={url}
                  onClick={() => handleAnalyze(url)}
                  className="demo-urls__chip"
                  type="button"
                >
                  {url.replace('https://', '')}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="content-container pb-16">

        {/* Progressive loading */}
        {loading && (
          <div className="loading-steps animate-fade-up">
            <div className="spinner loading-steps__spinner" />
            <div className="loading-steps__track">
              {LOADING_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`loading-steps__step${i === loadingStep ? ' loading-steps__step--active' : ''}${i < loadingStep ? ' loading-steps__step--done' : ''}`}
                >
                  <span className="loading-steps__dot" aria-hidden="true">
                    {i < loadingStep ? '✓' : i === loadingStep ? '◉' : '○'}
                  </span>
                  <span>
                    <span className="loading-steps__label">{step.label}</span>
                    {i === loadingStep && (
                      <span className="loading-steps__detail"> {step.detail}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-banner animate-fade-up mb-6" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Report */}
        {report && !loading && (
          <div className="report-stack">
            {/* Analyzed URL */}
            <p className="text-xs text-center mb-2" style={{ color: 'var(--text-faint)' }}>
              Results for{' '}
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-light)' }}
              >
                {report.url}
              </a>
            </p>

            {/* Score + Chips */}
            <div className="report-top">
              <ScoreCard score={report.score} findings={report.findings} />
              <ComponentChips
                components={report.components}
                detectedStack={report.detectedStack}
              />
            </div>

            {/* Issues */}
            <IssueList findings={report.findings} />

            {/* AI Plan */}
            <AiPlanCard aiPlan={report.aiPlan} />

            {/* Analyze another */}
            <div className="text-center pt-4 pb-2">
              <button onClick={handleReset} className="btn-secondary" type="button">
                ↩ Analyze another URL
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="text-center text-xs py-8"
        style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <p>LegacyLift — Rules find facts. AI explains and plans.</p>
        <p className="mt-2">
          <a
            href="https://github.com/divyachandrapandi/LegacyLift2026"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
