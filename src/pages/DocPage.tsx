import { marked } from 'marked';
import { useEffect, useState } from 'react';
import { config } from '../config';
import { RISK } from '../content/facts';
import type { Lang } from '../format';
import { num } from '../format';
import { useLang } from '../i18n';
import { Link } from '../router';
import { Notice, Spinner } from '../components/ui';

export type DocName = 'risks' | 'terms' | 'privacy';

// The legal drafts live as Markdown in src/content/legal/, one file per language, so the lawyer can read and edit
// them on GitHub. {{name}} placeholders take their values from site.config.json and the research facts, so the
// texts and the button never disagree on a cap or a fee.
const loaders: Record<`${DocName}.${Lang}`, () => Promise<string>> = {
  'risks.es': () => import('../content/legal/risks.es.md?raw').then((m) => m.default),
  'risks.en': () => import('../content/legal/risks.en.md?raw').then((m) => m.default),
  'terms.es': () => import('../content/legal/terms.es.md?raw').then((m) => m.default),
  'terms.en': () => import('../content/legal/terms.en.md?raw').then((m) => m.default),
  'privacy.es': () => import('../content/legal/privacy.es.md?raw').then((m) => m.default),
  'privacy.en': () => import('../content/legal/privacy.en.md?raw').then((m) => m.default),
};

export function docVars(lang: Lang): Record<string, string> {
  const d = config.defaults;
  const c = config.company;
  const pending = lang === 'es' ? '[por completar]' : '[to be completed]';
  return {
    termsVersion: config.termsVersion,
    feeMinPct: String(d.feeMinPct),
    feeMaxPct: String(d.feeMaxPct),
    periodDays: d.periodDays.join(lang === 'es' ? ' o ' : ' or '),
    minSol: num(d.perPersonMinSol, lang),
    maxSol: num(d.perPersonMaxSol, lang),
    totalCapSol: num(d.totalCapSol, lang),
    lostPct: String(RISK.lostPct),
    bigLossPct: String(RISK.bigLossPct),
    bigLossOverPct: String(RISK.bigLossOverPct),
    researchDays: String(RISK.days),
    daysDown: String(RISK.daysDown),
    email: config.contact.email,
    companyName: c.name || pending,
    companyRut: c.rut || pending,
    companyAddress: c.address || pending,
    companyRepresentative: c.representative || pending,
    siteUrl: config.siteUrl,
  };
}

export function fillVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

export default function DocPage({ name }: { name: DocName }) {
  const { t, lang } = useLang();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    loaders[`${name}.${lang}`]().then((md) => {
      if (alive) setHtml(marked.parse(fillVars(md, docVars(lang)), { async: false }));
    });
    return () => {
      alive = false;
    };
  }, [name, lang]);

  return (
    <main id="main" className="page doc-page">
      <Notice kind="warn" role="note">
        <p>
          <strong>{t.doc.draft}</strong>
          {lang === 'en' && <> {t.doc.otherLang}</>}
        </p>
      </Notice>
      {/* Our own Markdown from the repository, not user input. */}
      {html === null ? <Spinner label={t.doc.loading} /> : <article className="doc" dangerouslySetInnerHTML={{ __html: html }} />}
      <p>
        <Link href="/">← {t.doc.back}</Link>
      </p>
    </main>
  );
}
