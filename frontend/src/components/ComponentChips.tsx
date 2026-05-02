import type { DetectedComponent } from '../lib/types';

interface ComponentChipsProps {
  components: DetectedComponent[];
  detectedStack: string[];
}

export default function ComponentChips({ components, detectedStack }: ComponentChipsProps) {
  const hasComponents = components.length > 0;
  const hasStack = detectedStack.length > 0;

  if (!hasComponents && !hasStack) {
    return (
      <div className="card animate-fade-up">
        <p className="empty-state">No components or stack signals detected.</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {hasComponents && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
             style={{ color: 'var(--text-faint)' }}>
            Detected UI Components
          </p>
          <div className="flex flex-wrap gap-2">
            {components.map((c) => (
              <span key={c} className="badge badge--accent">{c}</span>
            ))}
          </div>
        </div>
      )}

      {hasStack && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
             style={{ color: 'var(--text-faint)' }}>
            Tech Stack Detected
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedStack.map((tech) => (
              <span key={tech} className="badge badge--teal">{tech}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
