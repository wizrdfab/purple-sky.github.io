/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import site from './site.config.json' with { type: 'json' };

// The origins the page may talk to, from the Privy docs' CSP guidance plus our API and the configured RPC.
// https://docs.privy.io/security/implementation-guide/content-security-policy
function origin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy(cfg: { apiBase: string; solanaRpc: string }): string {
  // Privy's and WalletConnect's own domains, whole: a missing entry would break the login, and the script-src rule
  // (no outside scripts) is the part that protects the page.
  const connect = new Set([
    "'self'",
    'https://auth.privy.io',
    'https://*.privy.io',
    'wss://*.privy.io',
    'https://*.rpc.privy.systems',
    'wss://*.rpc.privy.systems',
    'https://*.walletconnect.com',
    'https://*.walletconnect.org',
    'wss://relay.walletconnect.com',
    'wss://relay.walletconnect.org',
    'wss://www.walletlink.org',
  ]);
  for (const url of [cfg.apiBase, cfg.solanaRpc]) {
    const o = origin(url);
    if (o) {
      connect.add(o);
      if (o.startsWith('https://')) connect.add(o.replace('https://', 'wss://'));
    }
  }
  const frames = 'https://auth.privy.io https://*.privy.io https://verify.walletconnect.com https://verify.walletconnect.org';
  return [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `child-src ${frames}`,
    `frame-src ${frames} https://challenges.cloudflare.com`,
    `connect-src ${[...connect].join(' ')}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');
}

// The CSP goes in only at build time: the dev server injects inline scripts of its own.
function cspPlugin(): Plugin {
  return {
    name: 'purple-sky-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(site)}" />`;
      return html.replace('<!-- CSP -->', meta);
    },
  };
}

// Every route is a real page on GitHub Pages: the built index.html is copied to each route's folder, so /terms/ and
// /app/ load directly and in-page anchors (/#numbers) work. 404.html is the same page, which shows "not found".
export const ROUTES = ['risks', 'terms', 'privacy', 'app'] as const;

function routesPlugin(): Plugin {
  return {
    name: 'purple-sky-routes',
    apply: 'build',
    writeBundle(options) {
      const out = options.dir ?? 'dist';
      const index = join(out, 'index.html');
      for (const route of ROUTES) {
        mkdirSync(join(out, route), { recursive: true });
        copyFileSync(index, join(out, route, 'index.html'));
      }
      copyFileSync(index, join(out, '404.html'));
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), cspPlugin(), routesPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
  },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
  },
});
