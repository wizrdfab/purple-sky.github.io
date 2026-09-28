import { describe, expect, it } from 'vitest';
import { lamportsToSol, pct, shortAddress, signedSol, sol, solToLamports } from '../src/format';

describe('format', () => {
  it('writes percentages the way each language does', () => {
    expect(pct(10.9, 'es')).toBe('+10,9 %');
    expect(pct(10.9, 'en')).toBe('+10.9%');
    expect(pct(-10.2, 'en')).toBe('−10.2%');
    expect(pct(0, 'en')).toBe('0.0%');
  });

  it('writes SOL amounts without trailing zeros', () => {
    expect(sol(0.1, 'es')).toBe('0,1 SOL');
    expect(sol(0.354, 'en')).toBe('0.354 SOL');
    expect(signedSol(-0.0082, 'en')).toBe('−0.0082 SOL');
    expect(signedSol(0.006, 'es')).toBe('+0,006 SOL');
  });

  it('converts SOL to lamports without floating-point drift', () => {
    expect(solToLamports(0.3)).toBe(300_000_000n);
    expect(solToLamports(0.1 + 0.2)).toBe(300_000_000n);
    expect(solToLamports(0.123456789)).toBe(123_456_789n);
    expect(solToLamports(2)).toBe(2_000_000_000n);
    expect(lamportsToSol(250_000_000n)).toBe(0.25);
    expect(() => solToLamports(-1)).toThrow();
    expect(() => solToLamports(Number.NaN)).toThrow();
  });

  it('shortens addresses', () => {
    expect(shortAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBe('7xKX…gAsU');
    expect(shortAddress('short')).toBe('short');
  });
});
