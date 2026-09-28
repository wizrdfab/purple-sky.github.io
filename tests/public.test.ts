import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// This repository is public. Two guards over every tracked file:
// 1. nothing shaped like a key;
// 2. none of the terms listed outside this repository (private/internal-terms.txt, git-ignored, or the
//    PUBLIC_GUARD_TERMS secret in CI).
const ROOT = join(__dirname, '..');
const SELF = join('tests', 'public.test.ts');

// A Solana secret key (base58, or the 64-number array of a keypair file), a PEM private key, a seed phrase or secret
// assigned in code, an API key in a URL, a Jupiter or Stripe-style key.
const KEYS: RegExp[] = [
  /(?<![1-9A-HJ-NP-Za-km-z])[1-9A-HJ-NP-Za-km-z]{85,90}(?![1-9A-HJ-NP-Za-km-z])/,
  /\[\s*(\d{1,3}\s*,\s*){63}\d{1,3}\s*\]/,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /(seed|mnemonic|secret)[ _-]?(phrase|key)?\s*[:=]\s*['"`][^'"`]{20,}/i,
  /api[-_]?key=(?!FAKE)[A-Za-z0-9]{8,}/i,
  /\bjup_[A-Za-z0-9]{8,}/,
  /\bsk_(live|test)_[A-Za-z0-9]/,
];

function privateTerms(): RegExp[] {
  const file = join(ROOT, 'private', 'internal-terms.txt');
  const raw = process.env.PUBLIC_GUARD_TERMS ?? (existsSync(file) ? readFileSync(file, 'utf8') : '');
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => new RegExp(l, 'i'));
}

function tracked(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(join(ROOT, dir))) {
      if (['node_modules', '.git', 'dist', 'private', 'test-results', 'playwright-report'].includes(f)) continue;
      const rel = dir ? join(dir, f) : f;
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (f !== 'package-lock.json' && !/\.(png|jpg|ico)$/.test(f)) out.push(rel);
    }
  };
  walk('');
  return out;
}

function scan(patterns: RegExp[]): string[] {
  const found: string[] = [];
  for (const rel of tracked()) {
    if (rel === SELF) continue;
    const text = readFileSync(join(ROOT, rel), 'utf8');
    for (const re of patterns) {
      const m = text.match(re);
      // Only the start of a match is shown: a real key must not end up in a test log.
      if (m) found.push(`${rel}: ${m[0].slice(0, 6)}…`);
    }
  }
  return found;
}

describe('the public repository', () => {
  it('holds nothing shaped like a key', () => {
    expect(scan(KEYS)).toEqual([]);
  });

  const terms = privateTerms();
  it.skipIf(terms.length === 0)('names none of the private internals', () => {
    expect(scan(terms)).toEqual([]);
  });
});
