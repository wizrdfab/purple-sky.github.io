import { useCallback, useEffect, useState } from 'react';
import { date, dateTime, lamportsToSol, num, sol, solToLamports } from '../format';
import { useLang } from '../i18n';
import { Link } from '../router';
import { Notice, Spinner, Steps } from '../components/ui';
import { ApiError, type Api, type Me } from './api';
import { usePort } from './port';
import { balanceState, checkFee, checkTopUp, round9, suggestedTopUp, targetMax, type Params } from './rules';
import { isUserRejection, messageOf } from './wallet';
import { useTransfer, WalletTools } from './WalletTools';

// The setup before a period: the risks and the terms, the trading wallet's SOL, the period and the fee, then
// register → addSigners → start.

interface Progress {
  acceptedAt: string | null;
  termsVersion: string | null;
  days: number | null;
  fee: number | null;
}

const EMPTY: Progress = { acceptedAt: null, termsVersion: null, days: null, fee: null };

function storageKey(userId: string | null) {
  return `ps.setup.${userId ?? 'anon'}`;
}

function loadProgress(userId: string | null): Progress {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveProgress(userId: string | null, p: Progress) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(p));
  } catch {
    // Storage refused: the progress lasts until the page is closed.
  }
}

export function Setup({ api, params, me, onStarted }: { api: Api; params: Params; me: Me; onStarted: () => Promise<void> }) {
  const port = usePort();
  const { t } = useLang();
  const [progress, setProgressState] = useState<Progress>(() => {
    const p = loadProgress(port.userId);
    // An acceptance of other terms does not carry over.
    return p.termsVersion === params.termsVersion ? p : { ...p, acceptedAt: null, termsVersion: null };
  });
  const setProgress = (p: Progress) => {
    setProgressState(p);
    saveProgress(port.userId, p);
  };
  const [step, setStep] = useState(progress.acceptedAt ? 1 : 0);

  return (
    <section className="card" aria-labelledby="setup-title">
      <h2 id="setup-title" className="sr-only">
        {t.app.title}
      </h2>
      <Steps labels={t.app.steps} current={step} />
      {step === 0 && (
        <TermsStep
          params={params}
          onAccept={() => {
            setProgress({ ...progress, acceptedAt: new Date().toISOString(), termsVersion: params.termsVersion });
            setStep(1);
          }}
        />
      )}
      {step === 1 && <FundStep params={params} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && (
        <PeriodStep
          params={params}
          days={progress.days}
          fee={progress.fee}
          onBack={() => setStep(1)}
          onNext={(days, fee) => {
            setProgress({ ...progress, days, fee });
            setStep(3);
          }}
        />
      )}
      {step === 3 && progress.acceptedAt && progress.days && progress.fee && (
        <StartStep
          api={api}
          me={me}
          days={progress.days}
          fee={progress.fee}
          acceptedAt={progress.acceptedAt}
          termsVersion={params.termsVersion}
          onBack={() => setStep(2)}
          onStarted={onStarted}
        />
      )}
      <WalletTools running={false} onChange={async () => undefined} />
    </section>
  );
}

function TermsStep({ params, onAccept }: { params: Params; onAccept: () => void }) {
  const { t } = useLang();
  const [risk, setRisk] = useState(false);
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState(false);
  return (
    <div className="step">
      <h3>{t.app.terms.title}</h3>
      <ul className="bullets">
        {t.app.terms.summary.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="doc-links">
        <Link href="/risks/" target="_blank" rel="noreferrer">{t.app.terms.readRisks}</Link>
        <Link href="/terms/" target="_blank" rel="noreferrer">{t.app.terms.readTerms}</Link>
        <Link href="/privacy/" target="_blank" rel="noreferrer">{t.app.terms.readPrivacy}</Link>
      </p>
      <div className="checks">
        <label>
          <input type="checkbox" checked={risk} onChange={(e) => setRisk(e.target.checked)} />
          <span>{t.app.terms.checkRisk}</span>
        </label>
        <label>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>{t.app.terms.checkTerms(params.termsVersion)}</span>
        </label>
        <label>
          <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} />
          <span>{t.app.terms.checkAge}</span>
        </label>
      </div>
      <div className="actions">
        <button type="button" className="btn btn-primary" disabled={!(risk && terms && age)} onClick={onAccept}>
          {t.app.terms.continue}
        </button>
      </div>
    </div>
  );
}

function FundStep({ params, onBack, onNext }: { params: Params; onBack: () => void; onNext: () => void }) {
  const port = usePort();
  const { t, lang } = useLang();
  const [trading, setTrading] = useState<number | null>(null);
  const [phantom, setPhantom] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [readError, setReadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!port.trading) return;
    try {
      const [tr, ph] = await Promise.all([
        port.balance(port.trading),
        port.phantom ? port.balance(port.phantom) : Promise.resolve(null),
      ]);
      const tSol = lamportsToSol(tr);
      setTrading(tSol);
      setPhantom(ph === null ? null : lamportsToSol(ph));
      setReadError(null);
      setAmount((a) => a || (suggestedTopUp(params, tSol) > 0 ? num(suggestedTopUp(params, tSol), lang, 9) : ''));
    } catch (e) {
      setReadError(messageOf(e));
    }
  }, [port, params, lang]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const transfer = useTransfer(() => {
    setAmount('');
    void refresh();
  });

  if (trading === null) {
    return readError ? (
      <Notice kind="warn">
        <p>{t.app.failed(readError)}</p>
        <button type="button" className="btn btn-small" onClick={() => void refresh()}>{t.app.retry}</button>
      </Notice>
    ) : (
      <Spinner label={t.app.loading} />
    );
  }

  const state = balanceState(params, trading);
  const value = Number(amount.replace(',', '.'));
  const problem = amount ? checkTopUp(params, trading, phantom, value) : null;
  const problemText =
    problem === 'low' ? t.app.fund.errLow(params.minSol)
    : problem === 'high' ? t.app.fund.errHigh(targetMax(params))
    : problem === 'phantom' ? t.app.fund.errPhantom
    : problem === 'full' ? t.app.fund.errFull
    : null;
  const excess = round9(trading - targetMax(params));

  return (
    <div className="step">
      <h3>{t.app.fund.title}</h3>
      <dl className="stats">
        <div>
          <dt>{t.app.fund.balance}</dt>
          <dd data-testid="trading-balance">{sol(trading, lang)}</dd>
        </div>
        <div>
          <dt>{t.app.fund.phantomBalance}</dt>
          <dd>{phantom === null ? '—' : sol(phantom, lang)}</dd>
        </div>
      </dl>
      <p>{t.app.fund.range(params.minSol, targetMax(params))}</p>
      {params.totalLeftSol !== null && <p className="muted small">{t.app.fund.totalLeft(params.totalLeftSol)}</p>}

      {state === 'full' && <Notice kind="warn">{t.app.fund.errFull}</Notice>}
      {state === 'ok' && <Notice kind="ok">{t.app.fund.ok}</Notice>}
      {state === 'high' && (
        <Notice kind="warn">
          <p>{t.app.fund.tooMuch(excess)}</p>
          <button type="button" className="btn btn-small" disabled={transfer.busy} onClick={() => void transfer.run('out', solToLamports(excess))}>
            {t.app.fund.returnExcess}
          </button>
        </Notice>
      )}

      {state !== 'full' && state !== 'high' && (
        <form
          className="fund-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!problem && value > 0) void transfer.run('in', solToLamports(value));
          }}
        >
          <label htmlFor="fund-amount">{t.app.fund.amount}</label>
          <div className="input-row">
            <input
              id="fund-amount"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
              aria-invalid={Boolean(problemText)}
              aria-describedby="fund-help"
            />
            <span className="unit">SOL</span>
            <button type="submit" className="btn" disabled={!amount || Boolean(problem) || transfer.busy}>
              {t.app.fund.send}
            </button>
          </div>
          <p id="fund-help" className={problemText ? 'field-error' : 'muted small'}>
            {problemText ?? (value > 0 ? t.app.fund.after(round9(trading + value)) : ' ')}
          </p>
        </form>
      )}

      {transfer.state.phase === 'signing' && <Spinner label={t.app.fund.signing} />}
      {transfer.state.phase === 'confirming' && <Spinner label={t.app.fund.confirming} />}
      {transfer.state.phase === 'error' && <Notice kind="danger">{transfer.state.message}</Notice>}

      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {t.app.fund.back}
        </button>
        <button type="button" className="btn btn-primary" disabled={state !== 'ok' || transfer.busy} onClick={onNext}>
          {t.app.fund.continue}
        </button>
      </div>
    </div>
  );
}

function PeriodStep({
  params,
  days,
  fee,
  onBack,
  onNext,
}: {
  params: Params;
  days: number | null;
  fee: number | null;
  onBack: () => void;
  onNext: (days: number, fee: number) => void;
}) {
  const { t } = useLang();
  const [d, setD] = useState(days && params.periodDays.includes(days) ? days : params.periodDays[params.periodDays.length - 1]);
  const [f, setF] = useState(fee && checkFee(params, fee) ? fee : params.feeMinPct);
  return (
    <div className="step">
      <h3>{t.app.period.title}</h3>
      <fieldset className="choice">
        <legend>{t.app.waitlist.days}</legend>
        {params.periodDays.map((n) => (
          <label key={n} className={n === d ? 'selected' : ''}>
            <input type="radio" name="days" value={n} checked={n === d} onChange={() => setD(n)} />
            {t.app.period.days(n)}
          </label>
        ))}
      </fieldset>
      <div className="fee">
        <label htmlFor="fee">{t.app.period.fee}</label>
        <div className="input-row">
          <input
            id="fee"
            type="range"
            min={params.feeMinPct}
            max={params.feeMaxPct}
            step={1}
            value={f}
            onChange={(e) => setF(Number(e.target.value))}
            aria-valuetext={`${f} %`}
          />
          <output htmlFor="fee" data-testid="fee-value">{f} %</output>
        </div>
        <p className="muted small">{t.app.period.feeHelp(params.feeMinPct)}</p>
      </div>
      <Notice kind="info">{t.app.period.hours}</Notice>
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {t.app.period.back}
        </button>
        <button type="button" className="btn btn-primary" disabled={!checkFee(params, f)} onClick={() => onNext(d, f)}>
          {t.app.period.continue}
        </button>
      </div>
    </div>
  );
}

type StartPhase = 'idle' | 'registering' | 'authorizing' | 'starting';

function StartStep({
  api,
  me,
  days,
  fee,
  acceptedAt,
  termsVersion,
  onBack,
  onStarted,
}: {
  api: Api;
  me: Me;
  days: number;
  fee: number;
  acceptedAt: string;
  termsVersion: string;
  onBack: () => void;
  onStarted: () => Promise<void>;
}) {
  const port = usePort();
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<StartPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(me.balance_sol);

  useEffect(() => {
    if (port.trading) port.balance(port.trading).then((l) => setBalance(lamportsToSol(l)), () => undefined);
  }, [port]);

  const start = async () => {
    if (!port.trading || !port.phantom) return;
    setError(null);
    try {
      setPhase('registering');
      const { signer_id, policy_id } = await api.register({ embedded_wallet: port.trading, phantom: port.phantom });
      if (!port.delegated) {
        setPhase('authorizing');
        try {
          await port.addSigner(signer_id, policy_id);
        } catch (e) {
          // Added a moment ago, before Privy's user record caught up: the API checks the signer anyway.
          if (!/already/i.test(messageOf(e))) throw e;
        }
      }
      setPhase('starting');
      await api.startPeriod({ days, fee_pct: fee, terms_version: termsVersion, accepted_at: acceptedAt });
      await onStarted();
    } catch (e) {
      setPhase('idle');
      if (isUserRejection(e)) setError(t.app.cancelled);
      else if (e instanceof ApiError && e.unreachable) setError(t.app.apiDown);
      else setError(t.app.failed(messageOf(e)));
    }
  };

  const ends = new Date(Date.now() + days * 86_400_000).toISOString();
  const busy = phase !== 'idle';
  return (
    <div className="step">
      <h3>{t.app.start.title}</h3>
      <p>{t.app.start.body}</p>
      <dl className="stats">
        <div>
          <dt>{t.app.start.amount}</dt>
          <dd>{balance === null ? '—' : sol(balance, lang)}</dd>
        </div>
        <div>
          <dt>{t.app.start.period}</dt>
          <dd>{t.app.period.days(days)}</dd>
        </div>
        <div>
          <dt>{t.app.start.fee}</dt>
          <dd>{fee} %</dd>
        </div>
        <div>
          <dt>{t.app.start.ends}</dt>
          <dd title={dateTime(ends, lang)}>{date(ends, lang)}</dd>
        </div>
      </dl>
      {phase === 'registering' && <Spinner label={t.app.start.registering} />}
      {phase === 'authorizing' && <Spinner label={t.app.start.authorizing} />}
      {phase === 'starting' && <Spinner label={t.app.start.starting} />}
      {error && <Notice kind="danger">{error}</Notice>}
      <div className="actions">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={onBack}>
          {t.app.start.back}
        </button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void start()}>
          {t.app.start.button}
        </button>
      </div>
    </div>
  );
}
