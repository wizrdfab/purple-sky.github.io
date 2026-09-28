import { lazy, Suspense, useMemo, useRef } from 'react';
import { config, type Mode } from '../config';
import { useLang } from '../i18n';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Notice, Spinner } from '../components/ui';
import { httpApi } from './api';
import { Button } from './Button';
import { DemoWallet, DemoWorld, demoApi } from './demo';
import { usePort } from './port';

// Privy's SDK is large: it loads only here, and never in the demo.
const PrivyWallet = lazy(() => import('./privyWallet'));

function RealButton() {
  const port = usePort();
  // One API client for the page's life; it asks the current port for a fresh token on every call.
  const token = useRef(port.getAccessToken);
  token.current = port.getAccessToken;
  const api = useMemo(() => httpApi(config.apiBase, () => token.current()), []);
  return <Button api={api} />;
}

function Demo({ mode, delay }: { mode: Mode; delay: number }) {
  const { t } = useLang();
  const world = useMemo(() => new DemoWorld({ mode, delay }), [mode, delay]);
  const api = useMemo(() => demoApi(world), [world]);
  return (
    <>
      <Notice kind="warn" role="note">
        <p>
          <strong>{t.app.demoBanner}</strong> <a href="/app/">{t.app.demoExit}</a>
        </p>
      </Notice>
      <DemoWallet world={world}>
        <Button api={api} />
      </DemoWallet>
    </>
  );
}

export default function AppPage({ search }: { search: URLSearchParams }) {
  const { t } = useLang();
  const demo = config.allowDemo && search.get('demo') === '1';
  let body;
  if (demo) {
    const mode: Mode = search.get('mode') === 'waitlist' ? 'waitlist' : 'open';
    const delay = Math.min(5000, Math.max(0, Number(search.get('delay') ?? 400) || 0));
    body = <Demo mode={mode} delay={delay} />;
  } else if (!config.privyAppId) {
    body = (
      <Notice kind="info">
        <p>{t.app.notConfigured}</p>
        <p>
          {t.app.signUpByContact} <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a> ·{' '}
          <a href={config.contact.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </p>
        {config.allowDemo && (
          <a className="btn btn-small" href="/app/?demo=1">
            {t.app.openDemo}
          </a>
        )}
      </Notice>
    );
  } else {
    body = (
      <ErrorBoundary fallback={<Notice kind="danger">{t.app.loadFailed}</Notice>}>
        <Suspense fallback={<Spinner label={t.app.loading} />}>
          <PrivyWallet>
            <RealButton />
          </PrivyWallet>
        </Suspense>
      </ErrorBoundary>
    );
  }
  return (
    <main id="main" className="page app-page">
      <h1>{t.app.title}</h1>
      {body}
    </main>
  );
}
