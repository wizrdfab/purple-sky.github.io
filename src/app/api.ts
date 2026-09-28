// The backend API the website calls. Fields marked "proposed" are optional: the site works without them, falling
// back to site.config.json.

import type { Mode } from '../config';

export interface Summary {
  updated_at?: string;
  /** proposed: who may start a period. The API is the gate; site.config.json's mode is the fallback. */
  mode?: Mode;
  /** proposed: the terms version the API expects in POST /v1/me/periods. */
  terms_version?: string;
  live?: { since: string; trades: number; mean_pct: number | null; won_pct?: number | null; pnl_sol?: number };
  caps?: {
    per_person_min_sol: number;
    per_person_max_sol: number;
    total_sol: number;
    total_used_sol?: number;
    total_left_sol?: number;
  };
  fee_min_pct?: number;
  period_days?: number[];
}

export type PeriodStatus = 'active' | 'closing' | 'settled';

export interface Settlement {
  final_sol: number;
  profit_sol: number;
  fee_sol: number;
  returned_sol: number;
  fee_tx?: string | null;
  return_tx?: string | null;
  settled_at: string;
}

export interface Period {
  period_id: string;
  status: PeriodStatus;
  starts_at: string;
  ends_at: string;
  days: number;
  fee_pct: number;
  initial_sol: number;
  ended_early?: boolean;
  settlement?: Settlement | null;
}

/** Open positions as a whole: how many, and what they are worth now. No token is ever named to the browser. */
export interface OpenPositions {
  count: number;
  value_sol: number | null;
}

/** This period's closed trades as a whole. */
export interface ClosedTrades {
  count: number;
  won: number;
  pnl_sol: number;
}

export interface Me {
  wallet: string | null;
  phantom?: string | null;
  /** proposed: false until POST /v1/me/register. */
  registered?: boolean;
  /** proposed: "open" lets this person through while the site is on the waitlist (the founder's test). */
  access?: Mode;
  /** proposed: true once the person has joined the waitlist. */
  waitlisted?: boolean;
  balance_sol: number | null;
  period: Period | null;
  open: OpenPositions;
  closed: ClosedTrades;
  pnl_sol: number | null;
}

export interface RegisterResponse {
  signer_id: string;
  policy_id: string;
}

export interface StartPeriodBody {
  days: number;
  fee_pct: number;
  terms_version: string;
  accepted_at: string;
}

export interface StartPeriodResponse {
  period_id: string;
  starts_at: string;
  ends_at: string;
  initial_sol: number;
}

export interface WaitlistBody {
  embedded_wallet: string | null;
  phantom: string | null;
  amount_sol: number;
  days: number;
  fee_pct: number;
  contact: string;
  accepted_risks_at: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  /** The server is down or unreachable, as opposed to refusing the request. */
  get unreachable(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

export interface Api {
  summary(): Promise<Summary>;
  me(): Promise<Me>;
  register(body: { embedded_wallet: string; phantom: string }): Promise<RegisterResponse>;
  startPeriod(body: StartPeriodBody): Promise<StartPeriodResponse>;
  endPeriod(): Promise<{ status: 'closing' }>;
  waitlist(body: WaitlistBody): Promise<{ ok: true }>;
}

type TokenSource = () => Promise<string | null>;

/** FastAPI answers errors as {"detail": "..."} or {"detail": {"code": "...", "message": "..."}}. */
export async function errorFrom(res: Response): Promise<ApiError> {
  let code = `http_${res.status}`;
  let message = res.statusText || `HTTP ${res.status}`;
  try {
    const body = await res.json();
    const detail = body?.detail ?? body;
    if (typeof detail === 'string') message = detail;
    else if (detail && typeof detail === 'object') {
      if (typeof detail.code === 'string') code = detail.code;
      if (typeof detail.message === 'string') message = detail.message;
    }
  } catch {
    // Not JSON: keep the status line.
  }
  return new ApiError(res.status, code, message);
}

export function httpApi(base: string, token: TokenSource, fetchImpl: typeof fetch = fetch): Api {
  const root = base.replace(/\/+$/, '');

  async function call<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
      const t = await token();
      if (!t) throw new ApiError(401, 'no_session', 'not signed in');
      headers.Authorization = `Bearer ${t}`;
    }
    let res: Response;
    try {
      res = await fetchImpl(`${root}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (e) {
      throw new ApiError(0, 'unreachable', e instanceof Error ? e.message : String(e));
    }
    if (!res.ok) throw await errorFrom(res);
    return (await res.json()) as T;
  }

  return {
    summary: () => call<Summary>('GET', '/v1/public/summary', undefined, false),
    me: async () => {
      try {
        return normalizeMe(await call<Partial<Me>>('GET', '/v1/me'));
      } catch (e) {
        // Before registering, an API may answer 404 instead of {"registered": false}.
        if (e instanceof ApiError && e.status === 404) return emptyMe();
        throw e;
      }
    },
    register: (body) => call('POST', '/v1/me/register', body),
    startPeriod: (body) => call('POST', '/v1/me/periods', body),
    endPeriod: () => call('POST', '/v1/me/periods/current/end', {}),
    waitlist: (body) => call('POST', '/v1/me/waitlist', body),
  };
}

export function emptyMe(): Me {
  return {
    wallet: null,
    registered: false,
    balance_sol: null,
    period: null,
    open: { count: 0, value_sol: null },
    closed: { count: 0, won: 0, pnl_sol: 0 },
    pnl_sol: null,
  };
}

/** Fills what the API leaves out, so the screens can rely on every field. */
export function normalizeMe(m: Partial<Me>): Me {
  return {
    ...emptyMe(),
    ...m,
    registered: m.registered ?? Boolean(m.wallet),
    open: m.open ?? { count: 0, value_sol: null },
    closed: m.closed ?? { count: 0, won: 0, pnl_sol: 0 },
    period: m.period ?? null,
  };
}
