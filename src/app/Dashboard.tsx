import { useEffect, useState } from 'react';
import { dateTime, pct, signedSol, sol } from '../format';
import { useLang } from '../i18n';
import { Notice, Spinner } from '../components/ui';
import { ApiError, type Api, type Me } from './api';
import { explorerTx } from './solana';
import { WalletTools } from './WalletTools';
import { messageOf } from './wallet';

export function Dashboard({
  api,
  me,
  reload,
  onNewPeriod,
  canStartNew,
}: {
  api: Api;
  me: Me;
  reload: () => Promise<void>;
  onNewPeriod: () => void;
  canStartNew: boolean;
}) {
  const { t, lang } = useLang();
  const period = me.period!;
  const [confirming, setConfirming] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => setUpdatedAt(new Date()), [me]);

  const endEarly = async () => {
    setEnding(true);
    setError(null);
    try {
      await api.endPeriod();
      setConfirming(false);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError && e.unreachable ? t.app.apiDown : t.app.failed(messageOf(e)));
    } finally {
      setEnding(false);
    }
  };

  const openValue = me.open.value_sol ?? 0;
  const nowSol = me.balance_sol === null ? null : me.balance_sol + openValue;
  // The result counts the open positions at their current value; pnl_sol (closed trades only) is the fallback.
  const resultSol = nowSol !== null ? nowSol - period.initial_sol : me.pnl_sol;
  const resultPct = resultSol === null || !period.initial_sol ? null : (resultSol / period.initial_sol) * 100;
  const s = period.settlement;

  return (
    <section className="card" aria-labelledby="dash-title">
      <div className="dash-head">
        <h2 id="dash-title">{t.app.dash.periodOf(period.days)}</h2>
        <span className={`chip chip-${period.status}`} data-testid="period-status">
          {t.app.dash.status[period.status]}
        </span>
      </div>
      <p className="muted">
        {period.status === 'settled' && s ? t.app.dash.endedAt(dateTime(s.settled_at, lang)) : t.app.dash.ends(dateTime(period.ends_at, lang))}
        {' · '}
        {t.app.dash.hours}
      </p>

      <dl className="stats">
        <div>
          <dt>{t.app.dash.started}</dt>
          <dd>{sol(period.initial_sol, lang)}</dd>
        </div>
        <div>
          <dt>{t.app.dash.now}</dt>
          <dd>{period.status === 'settled' && s ? sol(s.final_sol, lang) : nowSol === null ? '—' : sol(nowSol, lang)}</dd>
        </div>
        <div>
          <dt>{t.app.dash.result}</dt>
          <dd className={resultSol !== null && resultSol < 0 ? 'neg' : resultSol ? 'pos' : ''} data-testid="period-result">
            {resultSol === null ? '—' : signedSol(resultSol, lang)}
            {resultPct !== null && <small> ({pct(resultPct, lang)})</small>}
          </dd>
        </div>
        <div>
          <dt>{t.app.dash.fee}</dt>
          <dd>{period.fee_pct} %</dd>
        </div>
      </dl>

      {period.status === 'closing' && <Spinner label={t.app.dash.status.closing} />}

      {s && (
        <div className="settlement" data-testid="settlement">
          <h3>{t.app.dash.settlement}</h3>
          <dl className="stats">
            <div>
              <dt>{t.app.dash.final}</dt>
              <dd>{sol(s.final_sol, lang)}</dd>
            </div>
            <div>
              <dt>{t.app.dash.profit}</dt>
              <dd>{signedSol(s.profit_sol, lang)}</dd>
            </div>
            <div>
              <dt>{t.app.dash.feePaid}</dt>
              <dd>
                {sol(s.fee_sol, lang)}
                {s.fee_tx && <TxLink sig={s.fee_tx} />}
              </dd>
            </div>
            <div>
              <dt>{t.app.dash.returned}</dt>
              <dd>
                {sol(s.returned_sol, lang)}
                {s.return_tx && <TxLink sig={s.return_tx} />}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {period.status === 'active' && (
        <div className="end-early">
          {!confirming ? (
            <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
              {t.app.dash.endEarly}
            </button>
          ) : (
            <Notice kind="warn" role="alertdialog">
              <p>{t.app.dash.endConfirm}</p>
              <div className="actions">
                <button type="button" className="btn btn-ghost" disabled={ending} onClick={() => setConfirming(false)}>
                  {t.app.dash.endNo}
                </button>
                <button type="button" className="btn btn-danger" disabled={ending} onClick={() => void endEarly()}>
                  {t.app.dash.endYes}
                </button>
              </div>
            </Notice>
          )}
        </div>
      )}
      {error && <Notice kind="danger">{error}</Notice>}

      {period.status !== 'settled' && (
        <dl className="stats" data-testid="positions">
          <div>
            <dt>{t.app.dash.open}</dt>
            <dd>
              {me.open.count === 0 ? t.app.dash.none : t.app.dash.openCount(me.open.count)}
              {me.open.count > 0 && me.open.value_sol !== null && <small> · {sol(me.open.value_sol, lang)}</small>}
            </dd>
          </div>
          <div>
            <dt>{t.app.dash.closed}</dt>
            <dd>{me.closed.count === 0 ? t.app.dash.noClosed : t.app.dash.closedCount(me.closed.count, me.closed.won)}</dd>
          </div>
        </dl>
      )}

      <div className="actions">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => void reload()}>
          {t.app.dash.refresh}
        </button>
        <span className="muted small">{t.app.dash.updated(updatedAt.toLocaleTimeString(lang === 'es' ? 'es-CL' : 'en-US'))}</span>
      </div>

      {period.status === 'settled' && canStartNew && (
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={onNewPeriod}>
            {t.app.dash.newPeriod}
          </button>
        </div>
      )}

      <WalletTools running={period.status !== 'settled'} onChange={reload} />
    </section>
  );
}

function TxLink({ sig }: { sig: string }) {
  const { t } = useLang();
  return (
    <>
      {' '}
      <a className="small" href={explorerTx(sig)} target="_blank" rel="noreferrer">
        {t.app.dash.tx}
      </a>
    </>
  );
}
