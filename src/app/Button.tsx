import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { config } from '../config';
import { useLang } from '../i18n';
import { Address, Notice, Spinner } from '../components/ui';
import { ApiError, type Api, type Me, type Summary } from './api';
import { Dashboard } from './Dashboard';
import { usePort } from './port';
import { canStart, paramsFrom } from './rules';
import { Setup } from './Setup';
import { explorerAccount } from './solana';
import { Waitlist } from './Waitlist';

/** The one button: sign in, then the waitlist, the setup or the dashboard, as the API and the site's mode say. */
export function Button({ api }: { api: Api }) {
  const port = usePort();
  const { t } = useLang();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [meError, setMeError] = useState<ApiError | null>(null);
  const [newPeriod, setNewPeriod] = useState(false);
  const loading = useRef(false);

  useEffect(() => {
    api.summary().then(setSummary, () => setSummary(null));
  }, [api]);

  const reload = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const m = await api.me();
      setMe(m);
      setMeError(null);
    } catch (e) {
      setMeError(e instanceof ApiError ? e : new ApiError(0, 'unknown', String(e)));
    } finally {
      loading.current = false;
    }
  }, [api]);

  const params = useMemo(() => paramsFrom(config, summary), [summary]);

  const signedIn = port.authenticated && Boolean(port.trading);
  useEffect(() => {
    if (signedIn) void reload();
    else {
      setMe(null);
      setMeError(null);
    }
  }, [signedIn, reload]);

  // Refresh while a period runs: every 15 s, every 3 s while it closes.
  const status = me?.period?.status;
  useEffect(() => {
    if (!signedIn || (status !== 'active' && status !== 'closing')) return;
    const id = setInterval(() => void reload(), status === 'closing' ? 3000 : 15000);
    return () => clearInterval(id);
  }, [signedIn, status, reload]);

  if (port.error) return <Notice kind="danger">{t.app.loadFailed}</Notice>;
  if (!port.ready) return <Spinner label={t.app.loading} />;

  if (!port.authenticated) {
    return (
      <section className="card" aria-labelledby="connect-title">
        <h2 id="connect-title">{t.app.connect.title}</h2>
        <p>{t.app.connect.body}</p>
        <button type="button" className="btn btn-primary" onClick={() => port.login()}>
          {t.app.connect.button}
        </button>
        <p className="muted small">{t.app.connect.mobile}</p>
      </section>
    );
  }

  const header = (
    <div className="wallets">
      <dl>
        {port.phantom && (
          <div>
            <dt>{t.app.wallets.phantom}</dt>
            <dd>
              <Address value={port.phantom} href={explorerAccount(port.phantom)} />
            </dd>
          </div>
        )}
        <div>
          <dt>{t.app.wallets.trading}</dt>
          <dd>{port.trading ? <Address value={port.trading} /> : t.app.wallets.creating}</dd>
        </div>
      </dl>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => void port.logout()}>
        {t.app.logout}
      </button>
    </div>
  );

  if (!port.trading) return <>{header}<Spinner label={t.app.wallets.creating} /></>;


  if (meError && !me) {
    // The API is down. On the waitlist the sign-in itself is the record; otherwise nothing can start.
    if (params.mode === 'waitlist') return <>{header}<Waitlist api={api} params={params} me={null} apiDown /></>;
    return (
      <>
        {header}
        <Notice kind="warn">
          <p>{meError.unreachable ? t.app.apiDown : t.app.failed(meError.message)}</p>
          <button type="button" className="btn btn-small" onClick={() => void reload()}>
            {t.app.retry}
          </button>
        </Notice>
      </>
    );
  }
  if (!me) return <>{header}<Spinner label={t.app.loading} /></>;

  const period = me.period;
  const running = period && period.status !== 'settled';
  if (running || (period && !newPeriod)) {
    return (
      <>
        {header}
        <Dashboard api={api} me={me} reload={reload} onNewPeriod={() => setNewPeriod(true)} canStartNew={canStart(params, me)} />
      </>
    );
  }
  if (!canStart(params, me)) return <>{header}<Waitlist api={api} params={params} me={me} /></>;
  return (
    <>
      {header}
      <Setup api={api} params={params} me={me} onStarted={async () => { setNewPeriod(false); await reload(); }} />
    </>
  );
}
