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
        LegacyLift — Rules find facts. AI explains and plans.
      </footer>
    </div>
  );
}
