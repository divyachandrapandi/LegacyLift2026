import { useState } from 'react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function UrlForm({ onSubmit, loading }: UrlFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function validate(url: string): string {
    if (!url.trim()) return 'Please enter a URL.';
    if (!/^https?:\/\//i.test(url.trim())) return 'URL must start with http:// or https://';
    return '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate(value);
    if (msg) { setError(msg); return; }
    setError('');
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="url-form-wrapper" noValidate>
      <div className="url-form-row">
        <input
          type="url"
          className={`url-input${error ? ' url-input--error' : ''}`}
          placeholder="https://example.com"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(''); }}
          disabled={loading}
          aria-label="Website URL to analyze"
          aria-describedby={error ? 'url-error' : undefined}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
      {error && (
        <p id="url-error" role="alert" className="mt-2 text-sm" style={{ color: 'var(--critical)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
