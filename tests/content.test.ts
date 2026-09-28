import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config, validateConfig } from '../src/config';
import { initialLang, DICTS } from '../src/i18n';
import { docVars, fillVars } from '../src/pages/DocPage';

const LEGAL = join(__dirname, '../src/content/legal');

/** Every string in a dictionary, with its functions called on sample arguments. */
function strings(v: unknown, path = ''): [string, string][] {
  if (typeof v === 'string') return [[path, v]];
  if (typeof v === 'function') {
    const args = Array.from({ length: v.length }, (_, i) => (i === 3 ? '2026-09-28' : i === 2 ? 60 : 0.1));
    return strings((v as (...a: unknown[]) => unknown)(...args), `${path}()`);
  }
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${path}[${i}]`));
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => strings(x, path ? `${path}.${k}` : k));
  return [];
}

function legal(lang: 'es' | 'en'): [string, string][] {
  return readdirSync(LEGAL)
    .filter((f) => f.endsWith(`.${lang}.md`))
    .map((f) => [f, fillVars(readFileSync(join(LEGAL, f), 'utf8'), docVars(lang))]);
}

describe('languages', () => {
  it('have the same keys and no empty text', () => {
    const es = strings(DICTS.es).map(([k]) => k);
    const en = strings(DICTS.en).map(([k]) => k);
    expect(en).toEqual(es);
    for (const lang of ['es', 'en'] as const) {
      for (const [k, s] of strings(DICTS[lang])) expect(s.trim(), `${lang}.${k}`).not.toBe('');
    }
  });

  it('pick the URL, then the visitor, then the browser, then Spanish', () => {
    expect(initialLang('?lang=en', 'es', ['es-CL'])).toBe('en');
    expect(initialLang('', 'en', ['es-CL'])).toBe('en');
    expect(initialLang('', null, ['en-GB', 'es'])).toBe('en');
    expect(initialLang('', null, ['fr-FR', 'es-AR'])).toBe('es');
    expect(initialLang('', null, ['de-DE'])).toBe('es');
    expect(initialLang('?lang=xx', 'zz', [])).toBe('es');
  });
});

// The site's words: "trading period", "end early", "your wallet"; never "deposit" or "lock"; no promised returns.
const FORBIDDEN: Record<'es' | 'en', RegExp[]> = {
  es: [/dep[oó]sit/i, /\bbloque(o|ar|ad[oa]s?)\b/i, /garantizad[oa]s?/i, /(rentabilidad|ganancias?|retornos?) asegurad/i, /sin riesgo/i],
  en: [/deposit/i, /\block(s|ed|ing|-up)?\b/i, /guaranteed/i, /risk[- ]free/i, /assured (return|profit)/i],
};

describe('the words', () => {
  for (const lang of ['es', 'en'] as const) {
    it(`never say deposit, lock or promise returns (${lang})`, () => {
      const texts = [...strings(DICTS[lang]), ...legal(lang)];
      for (const [where, text] of texts) {
        for (const re of FORBIDDEN[lang]) expect(text, `${where} matches ${re}`).not.toMatch(re);
      }
    });
  }

  it('keep the risks in the first things said', () => {
    expect(DICTS.es.risk.items[0]).toMatch(/perder parte o todo/);
    expect(DICTS.en.risk.items[0]).toMatch(/lose part or all/);
  });
});

describe('legal drafts', () => {
  it('have every placeholder filled, in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const [file, text] of legal(lang)) expect(text, file).not.toMatch(/\{\{/);
    }
  });

  it('exist in both languages', () => {
    const files = readdirSync(LEGAL);
    for (const doc of ['risks', 'terms', 'privacy']) {
      expect(files).toContain(`${doc}.es.md`);
      expect(files).toContain(`${doc}.en.md`);
    }
  });
});

describe('site.config.json', () => {
  it('is valid', () => {
    expect(validateConfig(config)).toEqual([]);
  });

  it('catches the mistakes that matter', () => {
    expect(validateConfig({ ...config, solanaRpc: 'https://rpc.example.test/?api-key=FAKE-FOR-TEST' })).toContain(
      'a key in a URL: this file is public',
    );
    expect(validateConfig({ ...config, apiBase: 'http://api.test' }).length).toBeGreaterThan(0);
    expect(validateConfig({ ...config, defaults: { ...config.defaults, feeMinPct: 0 } }).length).toBeGreaterThan(0);
  });
});
