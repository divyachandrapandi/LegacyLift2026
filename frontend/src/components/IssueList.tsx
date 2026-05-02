import type { Finding, Severity } from '../lib/types';

interface IssueListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'warning', 'info'];

const SEVERITY_META: Record<Severity, { icon: string; label: string; badgeClass: string }> = {
  critical: { icon: '🔴', label: 'Critical',  badgeClass: 'badge--critical' },
  warning:  { icon: '⚠️', label: 'Warning',   badgeClass: 'badge--warning' },
  info:     { icon: '🔵', label: 'Info',       badgeClass: 'badge--info' },
};

const CATEGORY_COLORS: Record<string, string> = {
  security:         'badge--critical',
  framework:        'badge--warning',
  mobile:           'badge--warning',
  'deprecated-html':'badge--warning',
  performance:      'badge--info',
  seo:              'badge--info',
  layout:           'badge--accent',
  styling:          'badge--accent',
  semantics:        'badge--accent',
  accessibility:    'badge--accent',
  components:       'badge--accent',
};

export default function IssueList({ findings }: IssueListProps) {
  if (findings.length === 0) {
    return (
      <div className="card animate-fade-up">
        <p className="empty-state">✓ No issues found — this site is in great shape!</p>
      </div>
    );
  }

  const grouped = SEVERITY_ORDER.reduce<Record<Severity, Finding[]>>(
    (acc, s) => ({ ...acc, [s]: findings.filter((f) => f.severity === s) }),
    { critical: [], warning: [], info: [] }
  );

  return (
    <div className="card animate-fade-up">
      <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Issues Found <span className="badge badge--accent ml-2">{findings.length}</span>
      </h2>

      {SEVERITY_ORDER.map((sev) => {
        const group = grouped[sev];
        if (group.length === 0) return null;
        const meta = SEVERITY_META[sev];

        return (
          <section key={sev} className="mb-6 last:mb-0">
            <div className="severity-header">
              <span aria-hidden="true">{meta.icon}</span>
              <span style={{ color: `var(--${sev})` }}>{meta.label}</span>
              <span className="count-badge">{group.length}</span>
            </div>

            {group.map((finding) => (
              <details key={finding.id} className="finding-row">
                <summary>
                  <span className={`badge ${CATEGORY_COLORS[finding.category] ?? 'badge--accent'}`}>
                    {finding.category}
                  </span>
                  <span style={{ flex: 1 }}>{finding.message}</span>
                  <span
                    className="badge badge--accent ml-2"
                    title="Instance count"
                    aria-label={`${finding.count} instance${finding.count !== 1 ? 's' : ''}`}
                  >
                    ×{finding.count}
                  </span>
                </summary>

                {finding.evidence.length > 0 && (
                  <div className="mt-3">
                    {finding.evidence.map((snip, i) => (
                      <pre key={i} className="evidence-block">{snip}</pre>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </section>
        );
      })}
    </div>
  );
}
