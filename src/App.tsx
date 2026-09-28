import { lazy, Suspense, useEffect, useState } from 'react';
import { config } from './config';
import { useLang } from './i18n';
import { Link, useLocation } from './router';
import { Icon, Spinner } from './components/ui';
import Home from './pages/Home';

const DocPage = lazy(() => import('./pages/DocPage'));
const AppPage = lazy(() => import('./app/AppPage'));

const TITLES = {
  es: { home: 'PurpleSky: tu billetera, operada por un periodo que tú eliges', risks: 'Riesgos', terms: 'Términos', privacy: 'Privacidad', app: 'Empezar', notfound: 'No encontrada' },
  en: { home: 'PurpleSky: your wallet, traded for a period you choose', risks: 'Risks', terms: 'Terms', privacy: 'Privacy', app: 'Start', notfound: 'Not found' },
} as const;

function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <nav className="nav" aria-label="main">
      <Link className="logo" href="/" onClick={close}>
        PURPLESKY
      </Link>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
        {t.nav.menu}
      </button>
      <div id="nav-links" className={`nav-links ${open ? 'open' : ''}`}>
        <Link href="/#how" onClick={close}>{t.nav.how}</Link>
        <Link href="/#numbers" onClick={close}>{t.nav.numbers}</Link>
        <Link href="/#risks" onClick={close}>{t.nav.risks}</Link>
        <Link href="/#fees" onClick={close}>{t.nav.fees}</Link>
        <Link href="/#about" onClick={close}>{t.nav.about}</Link>
        <button
          type="button"
          className="lang-toggle"
          lang={lang === 'es' ? 'en' : 'es'}
          aria-label={t.lang.otherLabel}
          onClick={() => {
            setLang(lang === 'es' ? 'en' : 'es');
            close();
          }}
        >
          {t.lang.other}
        </button>
        <Link className="btn btn-primary btn-small" href="/app/" onClick={close}>
          {t.nav.app}
        </Link>
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useLang();
  const c = config.company;
  return (
    <footer className="footer">
      <div>
        <p className="footer-brand">{t.footer.rights}</p>
        {c.name && (
          <p className="small muted">
            {c.name}
            {c.rut && ` · RUT ${c.rut}`}
          </p>
        )}
        <p className="small muted">{t.footer.notAdvice}</p>
        <p className="small muted">{t.footer.draft}</p>
      </div>
      <div className="footer-links">
        <Link href="/risks/">{t.footer.risks}</Link>
        <Link href="/terms/">{t.footer.terms}</Link>
        <Link href="/privacy/">{t.footer.privacy}</Link>
        <a href={`mailto:${config.contact.email}`} aria-label="email">
          <Icon name="mail" />
        </a>
        <a href={config.contact.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
          <Icon name="telegram" />
        </a>
        <a href={config.contact.x} target="_blank" rel="noreferrer" aria-label="X">
          <Icon name="x-logo" />
        </a>
      </div>
    </footer>
  );
}

function NotFound() {
  const { t } = useLang();
  return (
    <main id="main" className="page">
      <h1>{t.notFound.title}</h1>
      <p>
        <Link href="/">{t.notFound.back}</Link>
      </p>
    </main>
  );
}

export default function App() {
  const { route, search } = useLocation();
  const { t, lang } = useLang();

  useEffect(() => {
    const title = TITLES[lang][route];
    document.title = route === 'home' ? title : `${title} · PurpleSky`;
  }, [route, lang]);

  // A page loaded at /#numbers scrolls to that section once it is drawn.
  useEffect(() => {
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  let page;
  switch (route) {
    case 'home':
      page = <Home />;
      break;
    case 'risks':
    case 'terms':
    case 'privacy':
      page = <DocPage name={route} />;
      break;
    case 'app':
      page = <AppPage search={search} />;
      break;
    default:
      page = <NotFound />;
  }

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <div className="sky" aria-hidden="true" />
      <Nav />
      <Suspense fallback={<main id="main" className="page"><Spinner label={t.app.loading} /></main>}>{page}</Suspense>
      <Footer />
    </>
  );
}
