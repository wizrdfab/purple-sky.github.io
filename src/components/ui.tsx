import { useState, type ReactNode } from 'react';
import { shortAddress } from '../format';
import { useLang } from '../i18n';

export function Notice({ kind = 'info', children, role }: { kind?: 'info' | 'warn' | 'danger' | 'ok'; children: ReactNode; role?: string }) {
  return (
    <div className={`notice notice-${kind}`} role={role ?? (kind === 'danger' ? 'alert' : undefined)}>
      {children}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <p className="spinner" role="status">
      <span className="spinner-dot" aria-hidden="true" />
      {label}
    </p>
  );
}

/** An address, shortened, with copy and Solscan. */
export function Address({ value, href }: { value: string; href?: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard refused (an old browser or an iframe): the full address is in the title for manual copying.
    }
  };
  return (
    <span className="address" title={value}>
      <code>{shortAddress(value)}</code>
      <button type="button" className="link-button" onClick={copy}>
        {copied ? t.app.wallets.copied : t.app.wallets.copy}
      </button>
      {href && (
        <a href={href} target="_blank" rel="noreferrer">
          {t.app.wallets.explorer}
        </a>
      )}
    </span>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="steps" aria-label="progress">
      {labels.map((l, i) => (
        <li key={l} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="steps-n">{i + 1}</span>
          <span className="steps-label">{l}</span>
        </li>
      ))}
    </ol>
  );
}

export function Icon({ name }: { name: 'check' | 'x' | 'alert' | 'moon' | 'sun' | 'wallet' | 'shield' | 'leaf' | 'github' | 'telegram' | 'x-logo' | 'mail' }) {
  const paths: Record<typeof name, ReactNode> = {
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    alert: (
      <>
        <path d="M12 3l9.5 17h-19z" />
        <path d="M12 10v4.5M12 17.5v.5" />
      </>
    ),
    moon: <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M16 12.5h2M3 9.5h18" />
      </>
    ),
    shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />,
    leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" />,
    github: (
      <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 00-6.2 0C6.6 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    ),
    telegram: <path d="M21 4L3 11l6 2 2 6 3-4 5 4zM9 13l9-7" />,
    'x-logo': <path d="M4 4l16 16M20 4L4 20" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.5 6l8.5 7 8.5-7" />
      </>
    ),
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}
