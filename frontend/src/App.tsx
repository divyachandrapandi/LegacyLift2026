import { useState } from 'react';
import './styles/main.scss';

import { analyzeUrl } from './lib/api';
import type { AnalyzeResponse } from './lib/types';

import UrlForm from './components/UrlForm';
import ScoreCard from './components/ScoreCard';
import IssueList from './components/IssueList';
import ComponentChips from './components/ComponentChips';
import AiPlanCard from './components/AiPlanCard';

const DEMO_URLS = [
  'https://zuora.com',
  'https://www.spacejam.com',
  'https://www.berkshirehathaway.com',
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await analyzeUrl(url);
      setReport(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-up">
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Fetching, analyzing, and generating your plan…
            </p>
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
              <ScoreCard score={report.score} />
              <ComponentChips
                components={report.components}
                detectedStack={report.detectedStack}
              />
            </div>

            {/* Issues */}
            <IssueList findings={report.findings} />

            {/* AI Plan */}
            <AiPlanCard aiPlan={report.aiPlan} />
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
