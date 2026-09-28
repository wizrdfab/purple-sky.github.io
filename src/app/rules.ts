import type { Mode, SiteConfig } from '../config';
import type { Me, Summary } from './api';

/** The limits the button applies, from the API's summary when it gives them, else from site.config.json. */
export interface Params {
  mode: Mode;
  termsVersion: string;
  feeMinPct: number;
  feeMaxPct: number;
  periodDays: number[];
  minSol: number;
  maxSol: number;
  totalCapSol: number;
  /** Room left across everyone; null when the API does not say. */
  totalLeftSol: number | null;
}

export function paramsFrom(cfg: SiteConfig, s: Summary | null): Params {
  const d = cfg.defaults;
  const caps = s?.caps;
  const feeMin = s?.fee_min_pct ?? d.feeMinPct;
  // Rounded: 5 − 4.7 is 0.29999… in floating point, which would refuse a valid 0.3.
  const left =
    caps?.total_left_sol ??
    (caps && caps.total_used_sol !== undefined ? Math.max(0, round9(caps.total_sol - caps.total_used_sol)) : null);
  return {
    mode: s?.mode ?? cfg.mode,
    termsVersion: s?.terms_version ?? cfg.termsVersion,
    feeMinPct: feeMin,
    feeMaxPct: Math.max(feeMin, d.feeMaxPct),
    periodDays: s?.period_days?.length ? s.period_days : d.periodDays,
    minSol: caps?.per_person_min_sol ?? d.perPersonMinSol,
    maxSol: caps?.per_person_max_sol ?? d.perPersonMaxSol,
    totalCapSol: caps?.total_sol ?? d.totalCapSol,
    totalLeftSol: left,
  };
}

/** May this person start a period? The site's mode, unless the API lets them through (the founder's test). */
export function canStart(p: Params, me: Me | null): boolean {
  return p.mode === 'open' || me?.access === 'open';
}

/** The most the trading wallet may hold when the period starts. */
export function targetMax(p: Params): number {
  return p.totalLeftSol === null ? p.maxSol : Math.min(p.maxSol, p.totalLeftSol);
}

/** Phantom keeps this much for the transfer's network fee (5,000 lamports) with room to spare. */
export const PHANTOM_RESERVE_SOL = 0.001;

export type AmountProblem = 'low' | 'high' | 'phantom' | 'full' | 'invalid' | null;

/** Checks a top-up from Phantom: the trading wallet must end up within the caps. */
export function checkTopUp(p: Params, tradingSol: number, phantomSol: number | null, amount: number): AmountProblem {
  if (!Number.isFinite(amount) || amount <= 0) return 'invalid';
  const max = targetMax(p);
  if (max < p.minSol) return 'full';
  const after = round9(tradingSol + amount);
  if (after < p.minSol) return 'low';
  if (after > max) return 'high';
  if (phantomSol !== null && amount > phantomSol - PHANTOM_RESERVE_SOL) return 'phantom';
  return null;
}

/** Where the trading wallet stands against the caps before starting. */
export function balanceState(p: Params, tradingSol: number): 'low' | 'ok' | 'high' | 'full' {
  const max = targetMax(p);
  if (max < p.minSol) return 'full';
  if (tradingSol < p.minSol) return 'low';
  if (tradingSol > max) return 'high';
  return 'ok';
}

/** The amount to suggest first: what reaches the minimum, or nothing when the wallet is already within. */
export function suggestedTopUp(p: Params, tradingSol: number): number {
  return round9(Math.max(0, p.minSol - tradingSol));
}

export function checkFee(p: Params, fee: number): boolean {
  return Number.isInteger(fee) && fee >= p.feeMinPct && fee <= p.feeMaxPct;
}

/** The fee on a period's result: the chosen share of a positive profit, nothing otherwise. */
export function settlementOf(initialSol: number, finalSol: number, feePct: number) {
  const profit = round9(finalSol - initialSol);
  const fee = profit > 0 ? round9((profit * feePct) / 100) : 0;
  return { profit, fee, returned: round9(finalSol - fee) };
}

export function round9(x: number): number {
  return Math.round(x * 1e9) / 1e9;
}
