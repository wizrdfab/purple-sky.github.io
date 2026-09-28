// Screenshots of the built site (npm run preview first): node scripts/screens.mjs <folder>
import { chromium } from '@playwright/test';
const out = process.argv[2];
const base = 'http://localhost:4173';
const browser = await chromium.launch();
const errors = [];
async function page(w, h, lang) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang === 'en' ? 'en-US' : 'es-CL', deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  return p;
}
// Home, desktop, Spanish: the first screen and the full page.
let p = await page(1280, 800, 'es');
await p.goto(base + '/');
await p.waitForSelector('.risk-box');
await p.screenshot({ path: `${out}/01-home-es.jpg`, type: 'jpeg', quality: 80 });
await p.screenshot({ path: `${out}/02-home-es-full.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
// Home, phone, English
p = await page(390, 844, 'en');
await p.goto(base + '/?lang=en');
await p.waitForSelector('.risk-box');
await p.screenshot({ path: `${out}/03-home-en-phone.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
const sw = await p.evaluate(() => document.documentElement.scrollWidth);
console.log('phone scrollWidth', sw);
// The demo flow, desktop, Spanish
p = await page(1100, 900, 'es');
await p.goto(base + '/app/?demo=1&delay=100');
await p.getByRole('button', { name: 'Conectar Phantom' }).click();
await p.waitForSelector('.steps');
await p.screenshot({ path: `${out}/04-app-terms.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
for (const cb of await p.locator('.checks input').all()) await cb.check();
await p.getByRole('button', { name: 'Continuar' }).click();
await p.waitForSelector('[data-testid=trading-balance]');
await p.screenshot({ path: `${out}/05-app-fund.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
await p.getByRole('button', { name: 'Mover desde Phantom' }).click();
await p.getByText('dentro de los límites').waitFor();
await p.getByRole('button', { name: 'Continuar' }).click();
await p.waitForSelector('#fee');
await p.screenshot({ path: `${out}/06-app-period.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByRole('button', { name: 'Autorizar y empezar' }).click();
await p.waitForSelector('[data-testid=period-status]');
await p.screenshot({ path: `${out}/07-app-dashboard.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
await p.getByRole('button', { name: 'Terminar antes' }).click();
await p.getByRole('button', { name: 'Sí, terminar' }).click();
await p.waitForSelector('[data-testid=settlement]');
await p.screenshot({ path: `${out}/08-app-settled.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
// The waitlist
p = await page(1100, 900, 'es');
await p.goto(base + '/app/?demo=1&mode=waitlist&delay=100');
await p.getByRole('button', { name: 'Conectar Phantom' }).click();
await p.waitForSelector('.waitlist-form');
await p.screenshot({ path: `${out}/09-app-waitlist.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
await browser.close();
console.log('errors:', JSON.stringify(errors));
