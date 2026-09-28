import raw from '../site.config.json';

// The site's one config file is site.config.json at the repository's root. Everything in it is public: it ships in
// the page. Never put a key or a secret there.

export type Mode = 'waitlist' | 'open';

export interface SiteConfig {
  siteUrl: string;
  /** Privy's App ID (public). Empty: the button explains the app is not connected yet, and offers the demo. */
  privyAppId: string;
  privyClientId: string;
  /** The backend API, e.g. https://api.purple-sky.online. */
  apiBase: string;
  /** A Solana RPC the browser may call. Empty: Privy's hosted RPC for this app, which needs no key. */
  solanaRpc: string;
  /** "waitlist" until the service opens to everyone; the API's summary overrides it when it says. */
  mode: Mode;
  termsVersion: string;
  allowDemo: boolean;
  defaults: {
    feeMinPct: number;
    feeMaxPct: number;
    periodDays: number[];
    perPersonMinSol: number;
    perPersonMaxSol: number;
    totalCapSol: number;
  };
  contact: { email: string; telegram: string; x: string };
  company: { name: string; rut: string; address: string; representative: string };
}

export function validateConfig(c: SiteConfig): string[] {
  const errors: string[] = [];
  const d = c.defaults;
  if (c.mode !== 'waitlist' && c.mode !== 'open') errors.push(`mode must be "waitlist" or "open", not ${c.mode}`);
  if (!/^https:\/\//.test(c.apiBase)) errors.push('apiBase must be an https:// URL');
  if (c.solanaRpc && !/^https:\/\//.test(c.solanaRpc)) errors.push('solanaRpc must be empty or an https:// URL');
  if (/api[-_]?key=|jup_/i.test(c.solanaRpc + c.apiBase)) errors.push('a key in a URL: this file is public');
  if (!(d.feeMinPct > 0 && d.feeMinPct <= d.feeMaxPct && d.feeMaxPct < 100)) errors.push('fee bounds are wrong');
  if (!(d.perPersonMinSol > 0 && d.perPersonMinSol <= d.perPersonMaxSol)) errors.push('per-person caps are wrong');
  if (!(d.totalCapSol >= d.perPersonMaxSol)) errors.push('the total cap is below the per-person cap');
  if (!d.periodDays.length || d.periodDays.some((n) => !Number.isInteger(n) || n < 1)) errors.push('periodDays');
  if (!c.termsVersion) errors.push('termsVersion is empty');
  return errors;
}

export const config: SiteConfig = raw as SiteConfig;

/** The RPC the browser reads balances and blockhashes from. */
export function solanaRpcUrl(c: SiteConfig = config): string {
  if (c.solanaRpc) return c.solanaRpc;
  if (c.privyAppId) return `https://solana-mainnet.rpc.privy.systems?privyAppId=${encodeURIComponent(c.privyAppId)}`;
  return 'https://api.mainnet-beta.solana.com';
}

export function solanaRpcWsUrl(c: SiteConfig = config): string {
  return solanaRpcUrl(c).replace(/^https:/, 'wss:');
}
