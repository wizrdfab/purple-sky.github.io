// The research numbers the site shows. Change them only from the trader's own research documents.
// Research results over 17–27 September 2026, net of fees; the 95% interval redraws the days.

export interface StrategyFacts {
  meanPct: number;
  ci95Pct: [number, number];
  trades: number;
  wonPct: number;
  sessions: number;
  sessionsPositive: number;
}

export const RESEARCH = {
  dataFrom: '2026-09-17',
  dataTo: '2026-09-27',
  strategy: {
    meanPct: 10.9,
    ci95Pct: [7.1, 19.4],
    trades: 79,
    wonPct: 75,
    sessions: 10,
    sessionsPositive: 9,
  } satisfies StrategyFacts,
  /** Research trades that lost more than 30% of what they put in: 6 of 63 (about 1 in 10). */
  bigLossShare: { lost: 6, of: 63, overPct: 30 },
  /** The day the founder's own wallet started trading. */
  liveSince: '2026-09-28',
} as const;

/** The research's risk figures, derived from the numbers above. */
export const RISK = {
  lostPct: 100 - RESEARCH.strategy.wonPct,
  bigLossPct: Math.round((RESEARCH.bigLossShare.lost / RESEARCH.bigLossShare.of) * 100),
  bigLossOverPct: RESEARCH.bigLossShare.overPct,
  days: RESEARCH.strategy.sessions,
  daysDown: RESEARCH.strategy.sessions - RESEARCH.strategy.sessionsPositive,
};
