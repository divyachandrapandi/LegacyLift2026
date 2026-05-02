import type { AiPlan } from '../lib/types';

interface AiPlanCardProps {
  aiPlan: AiPlan;
}

export default function AiPlanCard({ aiPlan }: AiPlanCardProps) {
  return (
    <div className="card-gradient-border animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <span style={{ fontSize: '20px' }} aria-hidden="true">🤖</span>
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          AI Modernization Plan
        </h2>
      </div>

      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
        {aiPlan.summary}
      </p>

      <ol style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {aiPlan.steps.map((step, i) => (
          <li key={i} className="step-item">
            <span className="step-number" aria-hidden="true">{i + 1}</span>
            <span className="step-text">{step}</span>
          </li>
        ))}
      </ol>

      {aiPlan.recommendedStack.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
             style={{ color: 'var(--text-faint)' }}>
            Recommended Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {aiPlan.recommendedStack.map((tech) => (
              <span key={tech} className="badge badge--violet">{tech}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
