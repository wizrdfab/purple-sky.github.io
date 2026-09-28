import { useEffect, useState } from 'react';
import { lamportsToSol, sol } from '../format';
import { useLang } from '../i18n';
import { Notice, Spinner } from '../components/ui';
import { usePort } from './port';
import { BASE_FEE_LAMPORTS } from './solana';
import { isUserRejection, messageOf } from './wallet';

type SendState = { phase: 'idle' } | { phase: 'signing' } | { phase: 'confirming' } | { phase: 'error'; message: string };

/** Moves SOL between Phantom and the trading wallet, and reports each phase. */
export function useTransfer(onDone: () => void) {
  const port = usePort();
  const { t } = useLang();
  const [state, setState] = useState<SendState>({ phase: 'idle' });
  const run = async (direction: 'in' | 'out', lamports: bigint) => {
    setState({ phase: 'signing' });
    try {
      const sig = direction === 'in' ? await port.sendFromPhantom(lamports) : await port.sendFromTrading(lamports);
      setState({ phase: 'confirming' });
      await port.confirm(sig);
      setState({ phase: 'idle' });
      onDone();
    } catch (e) {
      setState({ phase: 'error', message: isUserRejection(e) ? t.app.cancelled : t.app.failed(messageOf(e)) });
    }
  };
  return { state, run, busy: state.phase === 'signing' || state.phase === 'confirming' };
}

/** The person's own controls: export the key, take the SOL back, remove our access. */
export function WalletTools({ running, onChange }: { running: boolean; onChange: () => Promise<void> }) {
  const port = usePort();
  const { t, lang } = useLang();
  const [note, setNote] = useState<{ kind: 'ok' | 'danger'; text: string } | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [busy, setBusy] = useState(false);

  const readBalance = () => {
    if (port.trading) port.balance(port.trading).then(setBalance, () => setBalance(null));
  };
  useEffect(readBalance, [port]);

  const transfer = useTransfer(() => {
    setNote({ kind: 'ok', text: t.app.tools.sent });
    readBalance();
    void onChange();
  });

  const guard = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true);
    setNote(null);
    try {
      await fn();
      if (ok) setNote({ kind: 'ok', text: ok });
    } catch (e) {
      setNote({ kind: 'danger', text: isUserRejection(e) ? t.app.cancelled : t.app.failed(messageOf(e)) });
    } finally {
      setBusy(false);
    }
  };

  const sendable = balance !== null && balance > BASE_FEE_LAMPORTS ? balance - BASE_FEE_LAMPORTS : 0n;

  return (
    <div className="tools" aria-labelledby="tools-title">
      <h3 id="tools-title">{t.app.tools.title}</h3>
      <div className="tool">
        <button type="button" className="btn btn-small" disabled={busy} onClick={() => void guard(() => port.exportKey())}>
          {t.app.tools.export}
        </button>
        <p className="muted small">{t.app.tools.exportNote}</p>
      </div>
      {!running && (
        <>
          {sendable > 0n && (
            <div className="tool">
              <button
                type="button"
                className="btn btn-small"
                disabled={busy || transfer.busy}
                onClick={() => void transfer.run('out', sendable)}
              >
                {t.app.tools.returnAll} ({sol(lamportsToSol(sendable), lang)})
              </button>
              <p className="muted small">{t.app.tools.returnNote}</p>
            </div>
          )}
          {port.delegated && (
            <div className="tool">
              <button
                type="button"
                className="btn btn-small"
                disabled={busy}
                onClick={() => void guard(() => port.removeSigners(), t.app.tools.revoked)}
              >
                {t.app.tools.revoke}
              </button>
            </div>
          )}
        </>
      )}
      {running && <p className="muted small">{t.app.tools.revokeNote}</p>}
      {transfer.state.phase === 'signing' && <Spinner label={t.app.fund.signing} />}
      {transfer.state.phase === 'confirming' && <Spinner label={t.app.fund.confirming} />}
      {transfer.state.phase === 'error' && <Notice kind="danger">{transfer.state.message}</Notice>}
      {note && <Notice kind={note.kind}>{note.text}</Notice>}
    </div>
  );
}
