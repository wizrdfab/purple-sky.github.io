// Draws public/og.png, the image link previews show (1200×630). Run: node scripts/og.mjs
import { chromium } from '@playwright/test';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; width: 1200px; height: 630px; font-family: Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,.35), transparent 70%),
    radial-gradient(ellipse at bottom, #1b1435 0%, #0b0118 70%); color: #f3f4f6; display: flex; flex-direction: column;
    justify-content: center; padding: 0 90px; box-sizing: border-box; }
  .logo { font-size: 40px; font-weight: 800; letter-spacing: -1px; background: linear-gradient(to right, #8b5cf6, #d946ef);
    -webkit-background-clip: text; color: transparent; margin-bottom: 36px; }
  h1 { font-size: 64px; line-height: 1.1; margin: 0 0 22px; background: linear-gradient(to bottom, #fff, #a78bfa);
    -webkit-background-clip: text; color: transparent; max-width: 980px; }
  p { font-size: 30px; color: #b4b8c5; margin: 0; }
  .moon { position: absolute; right: 90px; top: 70px; width: 70px; height: 70px; border-radius: 50%;
    box-shadow: -16px 10px 0 0 #f3f4f6; transform: rotate(-20deg); }
</style></head><body><div class="moon"></div><div class="logo">PURPLESKY</div>
<h1>Tu billetera, operada por un periodo que tú eliges.</h1>
<p>Your wallet, traded for a period you choose · Solana</p></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
