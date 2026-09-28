import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../format';
import { en } from './en';
import { es, type Dict } from './es';

export const DICTS: Record<Lang, Dict> = { es, en };

const KEY = 'ps.lang';

/** ?lang= first, then the visitor's choice, then the browser's language; Spanish otherwise. */
export function initialLang(search: string, stored: string | null, browser: readonly string[]): Lang {
  const fromUrl = new URLSearchParams(search).get('lang');
  if (fromUrl === 'es' || fromUrl === 'en') return fromUrl;
  if (stored === 'es' || stored === 'en') return stored;
  for (const l of browser) {
    const p = l.toLowerCase().slice(0, 2);
    if (p === 'es') return 'es';
    if (p === 'en') return 'en';
  }
  return 'es';
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

interface LangCtx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    initialLang(window.location.search, readStored(), navigator.languages ?? [navigator.language]),
  );
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      // Private windows may refuse storage; the choice then lasts for this page only.
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(() => ({ lang, t: DICTS[lang], setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLang outside LangProvider');
  return v;
}
