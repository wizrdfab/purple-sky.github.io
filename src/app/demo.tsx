import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { config, type Mode } from '../config';
import { lamportsToSol, solToLamports } from '../format';
import {
  ApiError,
  type Api,
  type ClosedTrades,
  type Me,
  type OpenPositions,
  type Period,
  type Summary,
} from './api';
import { PortContext } from './port';
import { paramsFrom, round9, settlementOf, targetMax } from './rules';
import type { WalletPort } from './wallet';

// The demo: nothing real. A made-up Phantom, a made-up trading wallet and a made-up API that follows the contract
// the backend follows, so the flow can be walked through, tested, and shown before the backend exists.
// Its trades are invented, with a loss among them on purpose: they illustrate the screens, not the strategy.

const FEE = 5000n;
const PHANTOM = 'DEMoPhantomWa11etNotRea1111111111111111111';
const TRADING = 'DEMoTradingWa11etNotRea1111111111111111111';

export interface DemoOptions {
  mode: Mode;
  /** Milliseconds each fake network step takes. The tests set 0. */
  delay: number;
}

export class DemoWorld {
  authenticated = false;
  delegated = false;
  registered = false;
  waitlisted = false;
  balances = new Map<string, bigint>([
    [PHANTOM, solToLamports(2)],
    [TRADING, 0n],
  ]);
  period: Period | null = null;
  open: OpenPositions = { count: 0, value_sol: null };
  closed: ClosedTrades = { count: 0, won: 0, pnl_sol: 0 };
  private listeners = new Set<() => void>();
  private sigs = 0;

  constructor(readonly opts: DemoOptions) {}

  subscribe(l: () => void): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }

  wait(): Promise<void> {
    return new Promise((r) => setTimeout(r, this.opts.delay));
  }

  sig(): string {
    this.sigs += 1;
    return `DEMoSignature${this.sigs}NotRea1`;
  }

  move(from: string, to: string, amount: bigint) {
    const have = this.balances.get(from) ?? 0n;
    if (amount + FEE > have) throw new Error('insufficient funds');
    this.balances.set(from, have - amount - FEE);
    this.balances.set(to, (this.balances.get(to) ?? 0n) + amount);
  }

  sol(addr: string): number {
    return lamportsToSol(this.balances.get(addr) ?? 0n);
  }

  /** Two closed trades (a win and a loss) and one open position, once a period runs. Totals only, as the API. */
  simulateTrades() {
    if (!this.period) return;
    // Arbitrary made-up figures: a small loss so far, and one position worth a little more than it cost.
    const pnl = round9(this.period.initial_sol * -0.014);
    this.closed = { count: 2, won: 1, pnl_sol: pnl };
    const cost = round9(this.period.initial_sol * 0.3);
    this.open = { count: 1, value_sol: round9(cost * 1.05) };
    // The wallet's free SOL: the start, the closed trades' result, less what the open position cost.
    this.balances.set(TRADING, solToLamports(Math.max(0, round9(this.period.initial_sol + pnl - cost))));
  }

  finalSol(): number {
    return round9(this.sol(TRADING) + (this.open.value_sol ?? 0));
  }
}

export function demoApi(w: DemoWorld): Api {
  const summary = (): Summary => ({
    updated_at: new Date().toISOString(),
    mode: w.opts.mode,
    terms_version: config.termsVersion,
    caps: {
      per_person_min_sol: config.defaults.perPersonMinSol,
      per_person_max_sol: config.defaults.perPersonMaxSol,
      total_sol: config.defaults.totalCapSol,
      total_used_sol: 1.2,
    },
    fee_min_pct: config.defaults.feeMinPct,
    period_days: config.defaults.periodDays,
  });
  const auth = () => {
    if (!w.authenticated) throw new ApiError(401, 'no_session', 'not signed in');
  };
  return {
    async summary() {
      await w.wait();
      return summary();
    },
    async me(): Promise<Me> {
      await w.wait();
      auth();
      const pnl = w.period ? w.closed.pnl_sol : null;
      return {
        wallet: TRADING,
        phantom: PHANTOM,
        registered: w.registered,
        access: w.opts.mode,
        waitlisted: w.waitlisted,
        balance_sol: w.sol(TRADING),
        period: w.period,
        open: w.period?.status === 'active' ? w.open : { count: 0, value_sol: null },
        closed: w.closed,
        pnl_sol: pnl,
      };
    },
    async register() {
      await w.wait();
      auth();
      w.registered = true;
      return { signer_id: 'demo-key-quorum', policy_id: 'demo-policy' };
    },
    async startPeriod(body) {
      await w.wait();
      auth();
      const p = paramsFrom(config, summary());
      if (!w.delegated) throw new ApiError(409, 'signer_missing', "PurpleSky's signer is not on the wallet");
      if (w.period && w.period.status !== 'settled') throw new ApiError(409, 'period_exists', 'a period is already running');
      const bal = w.sol(TRADING);
      if (bal < p.minSol || bal > targetMax(p)) throw new ApiError(400, 'balance_out_of_caps', 'the balance is outside the caps');
      if (body.fee_pct < p.feeMinPct) throw new ApiError(400, 'fee_below_minimum', 'the fee is below the minimum');
      const now = Date.now();
      w.period = {
        period_id: `demo-${now}`,
        status: 'active',
        starts_at: new Date(now).toISOString(),
        ends_at: new Date(now + body.days * 86_400_000).toISOString(),
        days: body.days,
        fee_pct: body.fee_pct,
        initial_sol: bal,
        settlement: null,
      };
      w.closed = { count: 0, won: 0, pnl_sol: 0 };
      w.open = { count: 0, value_sol: null };
      w.simulateTrades();
      w.emit();
      return { period_id: w.period.period_id, starts_at: w.period.starts_at, ends_at: w.period.ends_at, initial_sol: bal };
    },
    async endPeriod() {
      await w.wait();
      auth();
      const period = w.period;
      if (!period || period.status !== 'active') throw new ApiError(409, 'no_active_period', 'no period is running');
      period.status = 'closing';
      period.ended_early = true;
      w.emit();
      // Settlement lands a moment later, as the real one would after the sales.
      setTimeout(() => {
        const final = w.finalSol();
        const { profit, fee, returned } = settlementOf(period.initial_sol, final, period.fee_pct);
        w.open = { count: 0, value_sol: null };
        w.balances.set(TRADING, 0n);
        w.balances.set(PHANTOM, (w.balances.get(PHANTOM) ?? 0n) + solToLamports(returned));
        period.status = 'settled';
        period.settlement = {
          final_sol: final,
          profit_sol: profit,
          fee_sol: fee,
          returned_sol: returned,
          fee_tx: fee > 0 ? w.sig() : null,
          return_tx: w.sig(),
          settled_at: new Date().toISOString(),
        };
        w.emit();
      }, Math.max(w.opts.delay * 3, 50));
      return { status: 'closing' as const };
    },
    async waitlist() {
      await w.wait();
      auth();
      w.waitlisted = true;
      return { ok: true as const };
    },
  };
}

export function demoPort(w: DemoWorld): WalletPort {
  return {
    kind: 'demo',
    ready: true,
    error: null,
    authenticated: w.authenticated,
    userId: w.authenticated ? 'did:privy:demo' : null,
    phantom: w.authenticated ? PHANTOM : null,
    trading: w.authenticated ? TRADING : null,
    delegated: w.delegated,
    login: () => {
      void w.wait().then(() => {
        w.authenticated = true;
        w.emit();
      });
    },
    logout: async () => {
      w.authenticated = false;
      w.emit();
    },
    getAccessToken: async () => (w.authenticated ? 'demo-token' : null),
    addSigner: async () => {
      await w.wait();
      w.delegated = true;
      w.emit();
    },
    removeSigners: async () => {
      await w.wait();
      w.delegated = false;
      w.emit();
    },
    sendFromPhantom: async (amount) => {
      await w.wait();
      w.move(PHANTOM, TRADING, amount);
      w.emit();
      return w.sig();
    },
    sendFromTrading: async (amount) => {
      await w.wait();
      w.move(TRADING, PHANTOM, amount);
      w.emit();
      return w.sig();
    },
    exportKey: async () => {
      await w.wait();
    },
    balance: async (addr) => {
      await w.wait();
      return w.balances.get(addr) ?? 0n;
    },
    confirm: async () => {
      await w.wait();
    },
  };
}

/** Provides the demo's wallet to the screens, and hands its API to the page. */
export function DemoWallet({ world, children }: { world: DemoWorld; children: ReactNode }) {
  const [tick, setTick] = useState(0);
  useEffect(() => world.subscribe(() => setTick((n) => n + 1)), [world]);
  // A new port object on every change, so the screens re-render.
  const port = useMemo(() => demoPort(world), [world, tick]);
  return <PortContext.Provider value={port}>{children}</PortContext.Provider>;
}
