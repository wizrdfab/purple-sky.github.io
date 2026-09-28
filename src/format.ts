export type Lang = 'es' | 'en';

const LOCALE: Record<Lang, string> = { es: 'es-CL', en: 'en-US' };

export function locale(lang: Lang): string {
  return LOCALE[lang];
}

/** 0.1 → "0,1" (es) or "0.1" (en). */
export function num(x: number, lang: Lang, maxDigits = 4, minDigits = 0): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: minDigits,
  }).format(x);
}

/** 10.9 → "+10,9 %" (es) or "+10.9%" (en). Signed unless told otherwise. */
export function pct(x: number, lang: Lang, opts: { signed?: boolean; digits?: number } = {}): string {
  const { signed = true, digits = 1 } = opts;
  const s = new Intl.NumberFormat(LOCALE[lang], {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  })
    .format(x)
    // A real minus sign reads better than a hyphen.
    .replace('-', '−');
  return lang === 'es' ? `${s} %` : `${s}%`;
}

/** SOL amounts: up to 4 decimals, trailing zeros dropped. */
export function sol(x: number, lang: Lang, digits = 4): string {
  return `${num(x, lang, digits)} SOL`;
}

export function signedSol(x: number, lang: Lang, digits = 4): string {
  const s = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: digits, signDisplay: 'exceptZero' })
    .format(x)
    .replace('-', '−');
  return `${s} SOL`;
}

export function date(iso: string, lang: Lang): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Local date and time, with the time zone's short name. */
export function dateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(iso));
}

export function shortAddress(a: string): string {
  return a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;
}

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function lamportsToSol(l: bigint | number): number {
  return Number(l) / LAMPORTS_PER_SOL;
}

/** SOL to lamports without floating-point drift (0.3 → 300000000n). */
export function solToLamports(x: number): bigint {
  if (!Number.isFinite(x) || x < 0) throw new Error(`not an amount: ${x}`);
  const [whole, frac = ''] = x.toFixed(9).split('.');
  return BigInt(whole) * 1_000_000_000n + BigInt(frac.padEnd(9, '0').slice(0, 9));
}
