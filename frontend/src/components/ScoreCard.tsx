interface ScoreCardProps {
  score: number;
}

const SIZE = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringColor(score: number): string {
  if (score >= 70) return 'var(--score-good)';
  if (score >= 40) return 'var(--score-medium)';
  return 'var(--score-bad)';
}

function label(score: number): string {
  if (score >= 70) return 'Modern';
  if (score >= 40) return 'Needs Work';
  return 'High Risk';
}

export default function ScoreCard({ score: rawScore }: ScoreCardProps) {
  const score = Math.max(0, Math.min(100, rawScore));
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color = ringColor(score);

  return (
    <div className="card animate-fade-up" style={{ textAlign: 'center' }}>
      <svg
        className="score-ring"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ margin: '0 auto', display: 'block',
          ['--ring-offset' as string]: offset,
          ['--ring-color' as string]: color,
        }}
        aria-label={`Modernization score: ${score} out of 100`}
        role="img"
      >
        {/* Background track */}
        <circle
          className="ring-track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
        />
        {/* Animated fill */}
        <circle
          className="ring-fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Score number */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="32"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          {score}
        </text>
      </svg>

      <p className="mt-3 text-sm font-semibold" style={{ color }}>
        {label(score)}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
        Modernization Score
      </p>
    </div>
  );
}
