import { useState } from 'react';
import { config } from '../config';
import { num } from '../format';
import { useLang } from '../i18n';
import { Link } from '../router';
import { Notice, Spinner } from '../components/ui';
import { ApiError, type Api, type Me } from './api';
import { usePort } from './port';
import type { Params } from './rules';

/**
 * Until the lawyer's OK: the same choices without funding, recorded by the API (POST /v1/me/waitlist, proposed).
 * If the API is not up, the Privy sign-in itself is the record: Privy's dashboard lists every user and wallet.
 */
export function Waitlist({ api, params, me, apiDown = false }: { api: Api; params: Params; me: Me | null; apiDown?: boolean }) {
  const port = usePort();
  const { t, lang } = useLang();
  const [amount, setAmount] = useState(num(params.minSol, lang, 9));
  const [days, setDays] = useState(params.periodDays[params.periodDays.length - 1]);
  const [fee, setFee] = useState(params.feeMinPct);
  const [contact, setContact] = useState('');
  const [risks, setRisks] = useState(false);
  const [state, setState] = useState<'form' | 'sending' | 'done' | 'fallback'>(
    me?.waitlisted ? 'done' : apiDown ? 'fallback' : 'form',
  );
  const [error, setError] = useState<string | null>(null);

  const value = Number(amount.replace(',', '.'));
  const valid = risks && value >= params.minSol && value <= params.maxSol && fee >= params.feeMinPct && fee <= params.feeMaxPct;

  const submit = async () => {
    setState('sending');
    setError(null);
    try {
      await api.waitlist({
        embedded_wallet: port.trading,
        phantom: port.phantom,
        amount_sol: value,
        days,
        fee_pct: fee,
        contact: contact.trim().slice(0, 200),
        accepted_risks_at: new Date().toISOString(),
      });
      setState('done');
    } catch (e) {
      // No waitlist endpoint yet, or no API: the sign-in is already on Privy's list.
      if (e instanceof ApiError && (e.status === 404 || e.status === 405 || e.unreachable)) setState('fallback');
      else {
        setError(t.app.failed(e instanceof Error ? e.message : String(e)));
        setState('form');
      }
    }
  };

  return (
    <section className="card" aria-labelledby="waitlist-title">
      <h2 id="waitlist-title">{t.app.waitlist.title}</h2>
      <p>{t.app.waitlist.body}</p>
      {state === 'done' && <Notice kind="ok" role="status">{t.app.waitlist.done}</Notice>}
      {state === 'fallback' && <Notice kind="ok" role="status">{t.app.waitlist.doneFallback}</Notice>}
      {(state === 'form' || state === 'sending') && (
        <form
          className="waitlist-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) void submit();
          }}
        >
          <label htmlFor="wl-amount">{t.app.waitlist.amount}</label>
          <div className="input-row">
            <input
              id="wl-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
            />
            <span className="unit">
              {num(params.minSol, lang)}–{num(params.maxSol, lang)} SOL
            </span>
          </div>
          <fieldset className="choice">
            <legend>{t.app.waitlist.days}</legend>
            {params.periodDays.map((n) => (
              <label key={n} className={n === days ? 'selected' : ''}>
                <input type="radio" name="wl-days" checked={n === days} onChange={() => setDays(n)} />
                {t.app.period.days(n)}
              </label>
            ))}
          </fieldset>
          <label htmlFor="wl-fee">{t.app.waitlist.fee}</label>
          <div className="input-row">
            <input
              id="wl-fee"
              type="range"
              min={params.feeMinPct}
              max={params.feeMaxPct}
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
            />
            <output htmlFor="wl-fee">{fee} %</output>
          </div>
          <label htmlFor="wl-contact">{t.app.waitlist.contact}</label>
          <input id="wl-contact" value={contact} maxLength={200} autoComplete="email" onChange={(e) => setContact(e.target.value)} />
          <label className="check">
            <input type="checkbox" checked={risks} onChange={(e) => setRisks(e.target.checked)} />
            <span>
              {t.app.waitlist.risks} <Link href="/risks/" target="_blank" rel="noreferrer">{t.app.terms.readRisks}</Link>
            </span>
          </label>
          {error && <Notice kind="danger">{error}</Notice>}
          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={!valid || state === 'sending'}>
              {t.app.waitlist.submit}
            </button>
          </div>
          {state === 'sending' && <Spinner label={t.app.loading} />}
        </form>
      )}
      {config.allowDemo && (
        <p>
          <a href="/app/?demo=1">{t.app.waitlist.demo}</a>
        </p>
      )}
    </section>
  );
}
