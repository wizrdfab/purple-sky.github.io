import { describe, expect, it } from 'vitest';
import { config } from '../src/config';
import type { Me, Summary } from '../src/app/api';
import { emptyMe } from '../src/app/api';
import { balanceState, canStart, checkFee, checkTopUp, paramsFrom, settlementOf, suggestedTopUp, targetMax } from '../src/app/rules';

const summary: Summary = {
  mode: 'open',
  terms_version: 'v-test',
  caps: { per_person_min_sol: 0.1, per_person_max_sol: 0.5, total_sol: 5, total_used_sol: 4.7 },
  fee_min_pct: 15,
  period_days: [3, 7],
};

describe('params', () => {
  it('falls back to site.config.json without a summary', () => {
    const p = paramsFrom(config, null);
    expect(p.mode).toBe(config.mode);
    expect(p.minSol).toBe(config.defaults.perPersonMinSol);
    expect(p.maxSol).toBe(config.defaults.perPersonMaxSol);
    expect(p.totalLeftSol).toBeNull();
    expect(p.termsVersion).toBe(config.termsVersion);
  });

  it("takes the API's values when it gives them", () => {
    const p = paramsFrom(config, summary);
    expect(p.mode).toBe('open');
    expect(p.feeMinPct).toBe(15);
    expect(p.termsVersion).toBe('v-test');
    expect(p.totalLeftSol).toBeCloseTo(0.3);
    expect(targetMax(p)).toBeCloseTo(0.3);
  });

  it('lets the founder through the waitlist when the API says so', () => {
    const p = paramsFrom(config, { ...summary, mode: 'waitlist' });
    const me: Me = { ...emptyMe(), access: 'open' };
    expect(canStart(p, null)).toBe(false);
    expect(canStart(p, emptyMe())).toBe(false);
    expect(canStart(p, me)).toBe(true);
  });
});

describe('caps', () => {
  const p = paramsFrom(config, { ...summary, caps: { ...summary.caps!, total_used_sol: 0 } });

  it('keeps the trading wallet within the per-person caps', () => {
    expect(checkTopUp(p, 0, 2, 0.1)).toBeNull();
    expect(checkTopUp(p, 0, 2, 0.5)).toBeNull();
    expect(checkTopUp(p, 0, 2, 0.05)).toBe('low');
    expect(checkTopUp(p, 0, 2, 0.6)).toBe('high');
    expect(checkTopUp(p, 0.3, 2, 0.25)).toBe('high');
    expect(checkTopUp(p, 0.3, 2, 0.2)).toBeNull();
    expect(checkTopUp(p, 0, 2, 0)).toBe('invalid');
    expect(checkTopUp(p, 0, 2, Number.NaN)).toBe('invalid');
  });

  it("leaves Phantom enough for the transfer's fee", () => {
    expect(checkTopUp(p, 0, 0.2, 0.2)).toBe('phantom');
    expect(checkTopUp(p, 0, 0.2, 0.15)).toBeNull();
  });

  it('respects the room left across everyone', () => {
    const tight = paramsFrom(config, summary); // 0.3 SOL left
    expect(checkTopUp(tight, 0, 2, 0.4)).toBe('high');
    expect(checkTopUp(tight, 0, 2, 0.3)).toBeNull();
    const full = paramsFrom(config, { ...summary, caps: { ...summary.caps!, total_used_sol: 4.95 } });
    expect(checkTopUp(full, 0, 2, 0.1)).toBe('full');
    expect(balanceState(full, 0.2)).toBe('full');
  });

  it('says where the balance stands', () => {
    expect(balanceState(p, 0)).toBe('low');
    expect(balanceState(p, 0.1)).toBe('ok');
    expect(balanceState(p, 0.5)).toBe('ok');
    expect(balanceState(p, 0.51)).toBe('high');
    expect(suggestedTopUp(p, 0)).toBe(0.1);
    expect(suggestedTopUp(p, 0.04)).toBe(0.06);
    expect(suggestedTopUp(p, 0.3)).toBe(0);
  });
});

describe('fee', () => {
  const p = paramsFrom(config, null);

  it('accepts whole percentages from the minimum up', () => {
    expect(checkFee(p, p.feeMinPct)).toBe(true);
    expect(checkFee(p, p.feeMaxPct)).toBe(true);
    expect(checkFee(p, p.feeMinPct - 1)).toBe(false);
    expect(checkFee(p, p.feeMaxPct + 1)).toBe(false);
    expect(checkFee(p, p.feeMinPct + 0.5)).toBe(false);
  });

  it('charges only on a profit, and never on the loss', () => {
    expect(settlementOf(0.3, 0.36, 10)).toEqual({ profit: 0.06, fee: 0.006, returned: 0.354 });
    expect(settlementOf(0.3, 0.25, 10)).toEqual({ profit: -0.05, fee: 0, returned: 0.25 });
    expect(settlementOf(0.3, 0.3, 10)).toEqual({ profit: 0, fee: 0, returned: 0.3 });
  });
});
