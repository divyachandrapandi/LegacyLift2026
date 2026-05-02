import type { Finding } from '../lib/types';

interface ScoreCardProps {
  score: number;
  findings: Finding[];
}

const SIZE = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Mirror backend category multipliers for client-side breakdown display
const CATEGORY_MULTIPLIERS: Record<string, number> = {
  security: 1.5, framework: 1.3, mobile: 1.3,
};
const SEVERITY_WEIGHTS: Record<string, number> = { critical: 15, warning: 7, info: 2 };

function ringColor(score: number) {
  if (score >= 70) return 'var(--score-good)';
  if (score >= 40) return 'var(--score-medium)';
  return 'var(--score-bad)';
}

function label(score: number) {
  if (score >= 70) return 'Modern';
  if (score >= 40) return 'Needs Work';
  return 'High Risk';
}

function topImpactCategories(findings: Finding[]) {
  const impact: Record<string, number> = {};
  for (const f of findings) {
    const w = SEVERITY_WEIGHTS[f.severity] ?? 0;
    const m = CATEGORY_MULTIPLIERS[f.category] ?? 1;
    impact[f.category] = (impact[f.category] ?? 0) + Math.min(w * m * Math.ceil(f.count / 2), 20);
  }
  return Object.entries(impact)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

const CATEGORY_COLORS: Record<string, string> = {
  security: 'var(--critical)', framework: 'var(--warning)', mobile: 'var(--warning)',
  seo: 'var(--info)', performance: 'var(--info)', layout: 'var(--accent-light)',
  styling: 'var(--accent-light)', semantics: 'var(--accent-light)',
  accessibility: 'var(--accent-light)', 'deprecated-html': 'var(--warning)',
  components: 'var(--accent-light)',
};

export default function ScoreCard({ score: rawScore, findings }: ScoreCardProps) {
  const score = Math.max(0, Math.min(100, rawScore));
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color = ringColor(score);
  const topCategories = topImpactCategories(findings);

  return (
    <div className="card animate-fade-up" style={{ textAlign: 'center' }}>
      <svg
        className="score-ring"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{
          margin: '0 auto', display: 'block',
          ['--ring-offset' as string]: offset,
          ['--ring-color' as string]: color,
        }}
        aria-label={`Modernization score: ${score} out of 100`}
        role="img"
      >
        <circle className="ring-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} />
        <circle
          className="ring-fill"
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill="var(--text-primary)" fontSize="32" fontWeight="800" fontFamily="system-ui, sans-serif">
          {score}
        </text>
      </svg>

      <p className="mt-3 text-sm font-semibold" style={{ color }}>{label(score)}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Modernization Score</p>

      {/* Top impact breakdown */}
      {topCategories.length > 0 && (
        <div className="score-breakdown">
          <p className="score-breakdown__title">Top impact</p>
          {topCategories.map(([cat, pts]) => (
            <div key={cat} className="score-breakdown__row">
              <span className="score-breakdown__cat" style={{ color: CATEGORY_COLORS[cat] ?? 'var(--text-muted)' }}>
                {cat}
              </span>
              <div className="score-breakdown__bar-track">
                <div
                  className="score-breakdown__bar-fill"
                  style={{
                    width: `${Math.min(100, (pts / 20) * 100)}%`,
                    background: CATEGORY_COLORS[cat] ?? 'var(--accent)',
                  }}
                />
              </div>
              <span className="score-breakdown__pts">-{Math.round(pts)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
