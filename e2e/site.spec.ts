import { expect, test, type Page } from '@playwright/test';

const API = 'https://api.purple-sky.online';

/** Fails the test on any console error or CSP refusal. The API is faked per test (down unless told otherwise). */
async function watch(page: Page, summary: unknown = null) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /Refused to|Content Security Policy/i.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.route(`${API}/**`, (route) =>
    summary && route.request().url().endsWith('/v1/public/summary')
      ? route.fulfill({ json: summary, headers: { 'Access-Control-Allow-Origin': '*' } })
      : route.fulfill({ status: 503, json: { detail: 'down' }, headers: { 'Access-Control-Allow-Origin': '*' } }),
  );
  return problems;
}

/** Console errors other than the faked API's 503s. */
function real(problems: string[]) {
  return problems.filter((p) => !/503|Failed to load resource/.test(p));
}

test.describe('home', () => {
  test.use({ locale: 'es-CL' });

  test('speaks Spanish to a Spanish browser, with the risks second', async ({ page }) => {
    const problems = await watch(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu billetera, operada por un periodo que tú eliges.');
    await expect(page.getByRole('heading', { name: 'Antes de nada: los riesgos' })).toBeVisible();
    await expect(page.locator('.number-main .number-big')).toHaveText('+10,9 %');
    await expect(page.getByRole('link', { name: 'Inscribirme en la lista' })).toBeVisible();
    await expect(page.getByTestId('live-record')).toContainText('Empezó el 28 de septiembre de 2026');
    // The risks come before how it works.
    const risks = await page.locator('#risks').boundingBox();
    const how = await page.locator('#how').boundingBox();
    expect(risks!.y).toBeLessThan(how!.y);
    expect(real(problems)).toEqual([]);
  });

  test('switches to English and remembers it', async ({ page }) => {
    await watch(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Read in English' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your wallet, traded for a period you choose.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your wallet, traded for a period you choose.');
    await page.getByRole('button', { name: 'Leer en castellano' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu billetera, operada por un periodo que tú eliges.');
  });

  test("shows the live record and opens when the API says so", async ({ page }) => {
    await watch(page, {
      mode: 'open',
      updated_at: '2026-10-02T12:00:00Z',
      live: { since: '2026-09-28T01:00:00Z', trades: 12, mean_pct: 4.2, won_pct: 66.7 },
    });
    await page.goto('/?lang=en');
    await expect(page.getByTestId('live-record')).toContainText('12 trades since');
    await expect(page.getByTestId('live-record')).toContainText('+4.2%');
    await expect(page.getByRole('link', { name: 'Start', exact: true }).first()).toBeVisible();
  });

  test('links to sections from another page', async ({ page }) => {
    await watch(page);
    await page.goto('/terms/');
    await page.getByRole('link', { name: 'Resultados' }).click();
    await expect(page).toHaveURL(/\/#numbers$/);
    await expect(page.getByRole('heading', { name: 'Lo que ha mostrado la estrategia' })).toBeInViewport();
  });
});

test.describe('pages', () => {
  for (const [path, es, en] of [
    ['/risks/', 'Divulgación de riesgos', 'Risk disclosure'],
    ['/terms/', 'Términos y condiciones', 'Terms and conditions'],
    ['/privacy/', 'Aviso de privacidad', 'Privacy notice'],
  ]) {
    test(`${path} loads directly, as a draft, in both languages`, async ({ page }) => {
      const problems = await watch(page);
      await page.goto(`${path}?lang=es`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(es);
      await expect(page.getByText('BORRADOR para revisión legal')).toBeVisible();
      await expect(page.locator('article.doc')).not.toContainText('{{');
      await page.getByRole('button', { name: 'Read in English' }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(en);
      await expect(page.getByText('The Spanish version governs.').first()).toBeVisible();
      expect(real(problems)).toEqual([]);
    });
  }

  test('an unknown address says so', async ({ page }) => {
    await watch(page);
    await page.goto('/nowhere/?lang=en');
    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  });

  test('the button explains itself until Privy is configured', async ({ page }) => {
    await watch(page);
    await page.goto('/app/?lang=en');
    await expect(page.getByText('The button is not connected yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'contact@purple-sky.online' })).toBeVisible();
    await page.getByRole('link', { name: 'Open the demo' }).click();
    await expect(page.getByText('DEMO: nothing here is real.')).toBeVisible();
  });
});

test.describe('the button, in the demo', () => {
  test.use({ locale: 'es-CL' });

  test('the whole period: terms, funding, period, start, end early, settlement', async ({ page }) => {
    const problems = await watch(page);
    await page.goto('/app/?demo=1&delay=0');
    await expect(page.getByText('DEMO: nada aquí es real.')).toBeVisible();
    await page.getByRole('button', { name: 'Conectar Phantom' }).click();

    // 1. Risks and terms: all three boxes, or no way forward.
    const next = page.getByRole('button', { name: 'Continuar' });
    await expect(next).toBeDisabled();
    await page.getByLabel(/Entiendo que puedo perder/).check();
    await page.getByLabel(/Leí y acepto los términos/).check();
    await expect(next).toBeDisabled();
    await page.getByLabel('Tengo 18 años o más.').check();
    await next.click();

    // 2. Funding: the caps hold, then 0.25 SOL moves in.
    await expect(page.getByTestId('trading-balance')).toHaveText('0 SOL');
    const amount = page.getByLabel('SOL a mover desde Phantom');
    await amount.fill('0,7');
    await expect(page.getByText('Con esto pasarías el máximo de 0,5 SOL.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mover desde Phantom' })).toBeDisabled();
    await amount.fill('0.05');
    await expect(page.getByText('Con esto quedarías bajo el mínimo de 0,1 SOL.')).toBeVisible();
    await amount.fill('0,25');
    await expect(page.getByText('Tu billetera de trading quedará con 0,25 SOL.')).toBeVisible();
    await page.getByRole('button', { name: 'Mover desde Phantom' }).click();
    await expect(page.getByTestId('trading-balance')).toHaveText('0,25 SOL');
    await expect(page.getByText('Tu billetera de trading está dentro de los límites.')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // 3. Period and fee.
    await page.getByLabel('3 días').check();
    await page.getByLabel('Tu comisión sobre la ganancia').fill('20');
    await expect(page.getByTestId('fee-value')).toHaveText('20 %');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // 4. Authorize and start.
    await expect(page.getByText('0,25 SOL').first()).toBeVisible();
    await page.getByRole('button', { name: 'Autorizar y empezar' }).click();

    // The dashboard.
    await expect(page.getByTestId('period-status')).toHaveText('En curso');
    await expect(page.getByRole('heading', { name: 'Periodo de 3 días' })).toBeVisible();
    // Totals only: no token is named, linked or timed anywhere on the dashboard.
    await expect(page.getByTestId('positions')).toContainText('1 posición');
    await expect(page.getByTestId('positions')).toContainText('2 · 1 con ganancia');
    await expect(page.locator('a[href*="/token/"]')).toHaveCount(0);
    await expect(page.locator('table')).toHaveCount(0);
    await expect(page.getByText('20 %', { exact: true })).toBeVisible();

    // End early: asked twice, then settled.
    await page.getByRole('button', { name: 'Terminar antes' }).click();
    await page.getByRole('button', { name: 'Seguir' }).click();
    await expect(page.getByTestId('period-status')).toHaveText('En curso');
    await page.getByRole('button', { name: 'Terminar antes' }).click();
    await page.getByRole('button', { name: 'Sí, terminar' }).click();
    await expect(page.getByTestId('settlement')).toBeVisible();
    await expect(page.getByTestId('period-status')).toHaveText('Terminado');

    // Afterwards the person can remove our access, and start again.
    await page.getByRole('button', { name: 'Quitar el permiso de PurpleSky' }).click();
    await expect(page.getByText('Permiso quitado.')).toBeVisible();
    await page.getByRole('button', { name: 'Empezar otro periodo' }).click();
    await expect(page.getByRole('heading', { name: 'Tu billetera de trading' })).toBeVisible();
    expect(real(problems)).toEqual([]);
  });

  test('the waitlist, until the service opens', async ({ page }) => {
    await watch(page);
    await page.goto('/app/?demo=1&mode=waitlist&delay=0&lang=en');
    await page.getByRole('button', { name: 'Connect Phantom' }).click();
    await expect(page.getByRole('heading', { name: 'We are not open to other people yet' })).toBeVisible();
    const submit = page.getByRole('button', { name: 'Sign me up' });
    await expect(submit).toBeDisabled();
    await page.getByLabel('Email or Telegram username (optional)').fill('@someone');
    await page.getByLabel(/I have read the risks/).check();
    await submit.click();
    await expect(page.getByText('Done: you are on the list.')).toBeVisible();
  });

  test('sending everything back when no period runs', async ({ page }) => {
    await watch(page);
    await page.goto('/app/?demo=1&delay=0&lang=en');
    await page.getByRole('button', { name: 'Connect Phantom' }).click();
    await page.getByLabel(/I understand I can lose/).check();
    await page.getByLabel(/I have read and accept the terms/).check();
    await page.getByLabel('I am 18 or older.').check();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Nothing to send back yet.
    await expect(page.getByRole('button', { name: /Send the whole balance/ })).toHaveCount(0);
    await page.getByLabel('SOL to move from Phantom').fill('0.3');
    await page.getByRole('button', { name: 'Move from Phantom' }).click();
    await expect(page.getByTestId('trading-balance')).toHaveText('0.3 SOL');
    await page.getByRole('button', { name: /Send the whole balance to Phantom/ }).click();
    await expect(page.getByText('Sent.')).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, locale: 'en-US' });

  for (const path of ['/', '/app/?demo=1', '/terms/', '/risks/']) {
    test(`${path} never scrolls sideways`, async ({ page }) => {
      await watch(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(360);
    });
  }

  test('the menu opens and navigates', async ({ page }) => {
    await watch(page);
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Results' })).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL(/#numbers$/);
    await expect(page.getByRole('link', { name: 'Results' })).toBeHidden();
  });
});
