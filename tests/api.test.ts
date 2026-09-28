import { describe, expect, it } from 'vitest';
import { ApiError, httpApi } from '../src/app/api';

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const f = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond(url, init);
  }) as unknown as typeof fetch;
  return { f, calls };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('httpApi', () => {
  it('sends the Privy token on private calls only', async () => {
    const { f, calls } = fakeFetch((url) =>
      url.endsWith('/summary') ? json(200, { mode: 'waitlist' }) : json(200, { wallet: 'W', balance_sol: 0.2 }),
    );
    const api = httpApi('https://api.example.test/', async () => 'tok', f);
    expect(await api.summary()).toEqual({ mode: 'waitlist' });
    const me = await api.me();
    expect(calls[0].url).toBe('https://api.example.test/v1/public/summary');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBeUndefined();
    expect((calls[1].init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    // Filled in for an API that leaves the totals out.
    expect(me.open).toEqual({ count: 0, value_sol: null });
    expect(me.closed).toEqual({ count: 0, won: 0, pnl_sol: 0 });
    expect(me.registered).toBe(true);
  });

  it('treats 404 on /v1/me as "not registered yet"', async () => {
    const { f } = fakeFetch(() => json(404, { detail: 'not registered' }));
    const me = await httpApi('https://a.test', async () => 't', f).me();
    expect(me.registered).toBe(false);
    expect(me.period).toBeNull();
  });

  it('reads FastAPI errors, plain or coded', async () => {
    const plain = fakeFetch(() => json(400, { detail: 'the balance is outside the caps' }));
    await expect(httpApi('https://a.test', async () => 't', plain.f).startPeriod({ days: 7, fee_pct: 10, terms_version: 'v', accepted_at: 'x' }))
      .rejects.toMatchObject({ status: 400, message: 'the balance is outside the caps' });
    const coded = fakeFetch(() => json(409, { detail: { code: 'period_exists', message: 'a period is running' } }));
    await expect(httpApi('https://a.test', async () => 't', coded.f).endPeriod()).rejects.toMatchObject({
      status: 409,
      code: 'period_exists',
    });
  });

  it('tells an unreachable server apart from a refusal', async () => {
    const down = fakeFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    const err = await httpApi('https://a.test', async () => 't', down.f).summary().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.unreachable).toBe(true);
    const bad = await httpApi('https://a.test', async () => 't', fakeFetch(() => json(503, {})).f).summary().catch((e) => e);
    expect(bad.unreachable).toBe(true);
    const refused = await httpApi('https://a.test', async () => 't', fakeFetch(() => json(403, {})).f).me().catch((e) => e);
    expect(refused.unreachable).toBe(false);
  });

  it('refuses private calls without a session, before any request', async () => {
    const { f, calls } = fakeFetch(() => json(200, {}));
    await expect(httpApi('https://a.test', async () => null, f).register({ embedded_wallet: 'a', phantom: 'b' })).rejects.toMatchObject({ status: 401 });
    expect(calls).toHaveLength(0);
  });
});
