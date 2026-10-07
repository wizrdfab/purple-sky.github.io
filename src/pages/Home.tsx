import { useEffect, useState } from 'react';
import { config } from '../config';
import { RESEARCH, type StrategyFacts } from '../content/facts';
import { dateTime, pct } from '../format';
import { useLang } from '../i18n';
import { Link } from '../router';
import { Icon } from '../components/ui';
import { httpApi, type Summary } from '../app/api';

function usePublicSummary(): Summary | null {
  const [s, setS] = useState<Summary | null>(null);
  useEffect(() => {
    let alive = true;
    httpApi(config.apiBase, async () => null)
      .summary()
      .then((x) => alive && setS(x), () => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return s;
}

function StrategyCard({ facts, label, details }: { facts: StrategyFacts; label: string; details: string }) {
  const { t, lang } = useLang();
  return (
    <article className="number-card number-main">
      <p className="number-label">{label}</p>
      <p className="number-big">{pct(facts.meanPct, lang)}</p>
      <p className="number-sub">{t.numbers.perTrade}</p>
      <p className="number-range">{t.numbers.range(facts.ci95Pct[0], facts.ci95Pct[1])}</p>
      <p className="number-details">{details}</p>
    </article>
  );
}

export default function Home() {
  const { t, lang } = useLang();
  const summary = usePublicSummary();
  const mode = summary?.mode ?? config.mode;
  const live = summary?.live;

  return (
    <main id="main">
      <header className="hero">
        <p className="kicker">{t.hero.kicker}</p>
        <h1>{t.hero.title}</h1>
        <p className="lead">{t.hero.lead}</p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-large" href="/app/">
            {mode === 'open' ? t.hero.cta : t.hero.ctaWaitlist}
          </Link>
          <Link className="btn btn-ghost btn-large" href="/#risks">
            {t.hero.ctaRisks}
          </Link>
        </div>
        <p className="hero-note">{mode === 'open' ? t.hero.openNote : t.hero.waitlistNote}</p>
      </header>

      <section id="risks" className="section risk-section" aria-labelledby="risks-title">
        <div className="risk-box">
          <h2 id="risks-title">
            <Icon name="alert" /> {t.risk.title}
          </h2>
          <ul>
            {t.risk.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <Link href="/risks/">{t.risk.more} →</Link>
        </div>
      </section>

      <section id="how" className="section" aria-labelledby="how-title">
        <h2 id="how-title">{t.how.title}</h2>
        <p className="section-lead">{t.how.lead}</p>
        <ol className="how-steps">
          {t.how.steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="two-col">
          <div className="panel">
            <h3>
              <Icon name="shield" /> {t.how.policyTitle}
            </h3>
            <ul className="ticks">
              {t.how.policyAllows.map((i) => (
                <li key={i} className="tick-yes">
                  <Icon name="check" /> {i}
                </li>
              ))}
              {t.how.policyDenies.map((i) => (
                <li key={i} className="tick-no">
                  <Icon name="x" /> {i}
                </li>
              ))}
            </ul>
            <p className="muted small">{t.how.policyNote}</p>
          </div>
          <div className="panel">
            <h3>
              <Icon name="wallet" /> {t.how.controlTitle}
            </h3>
            <ul className="ticks">
              {t.how.control.map((i) => (
                <li key={i} className="tick-yes">
                  <Icon name="check" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel">
          <h3>
            {t.how.strategyTitle}
          </h3>
          <ul className="bullets">
            {t.how.strategy.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="numbers" className="section" aria-labelledby="numbers-title">
        <h2 id="numbers-title">{t.numbers.title}</h2>
        <p className="section-lead">{t.numbers.lead}</p>
        <div className="numbers">
          <StrategyCard facts={RESEARCH.strategy} label={t.numbers.research.label} details={t.numbers.research.details} />
          <article className="number-card number-live" data-testid="live-record">
            <p className="number-label">{t.numbers.live.label}</p>
            {live && live.trades > 0 && live.mean_pct !== null ? (
              <>
                <p className="number-big">{pct(live.mean_pct, lang)}</p>
                <p className="number-sub">{t.numbers.perTrade}</p>
                <p className="number-details">{t.numbers.live.stats(live.trades, live.mean_pct, live.won_pct ?? null, live.since)}</p>
                {summary?.updated_at && <p className="muted small">{t.numbers.live.updated(dateTime(summary.updated_at, lang))}</p>}
              </>
            ) : (
              <p className="number-details">{t.numbers.live.empty}</p>
            )}
          </article>
        </div>
        <div className="panel">
          <h3>{t.numbers.caveatsTitle}</h3>
          <ul className="bullets">
            {t.numbers.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="fees" className="section" aria-labelledby="fees-title">
        <h2 id="fees-title">{t.fees.title}</h2>
        <div className="two-col">
          <div>
            <ul className="bullets">
              {t.fees.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="muted">{t.fees.costs}</p>
          </div>
          <div className="panel">
            <h3>{t.fees.exampleTitle}</h3>
            <p>{t.fees.exampleWin}</p>
            <p>{t.fees.exampleLoss}</p>
          </div>
        </div>
        <div className="panel panel-leaf">
          <h3>
            <Icon name="leaf" /> {t.fees.causesTitle}
          </h3>
          <p>{t.fees.causes}</p>
        </div>
      </section>

      <section id="ideas" className="section" aria-labelledby="ideas-title">
        <h2 id="ideas-title">{t.ideas.title}</h2>
        <ul className="bullets">
          {t.ideas.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="muted">{t.ideas.note}</p>
      </section>

      <section id="about" className="section" aria-labelledby="about-title">
        <h2 id="about-title">{t.about.title}</h2>
        <p>{t.about.founder}</p>
        <p className="contact-row">
          <a href={`mailto:${config.contact.email}`}>
            <Icon name="mail" /> {config.contact.email}
          </a>
          <a href={config.contact.telegram} target="_blank" rel="noreferrer">
            <Icon name="telegram" /> Telegram
          </a>
          <a href={config.contact.x} target="_blank" rel="noreferrer">
            <Icon name="x-logo" /> X
          </a>
        </p>
        <p>
          <a href={`/pitch.html#${lang}`}>
            {lang === 'es' ? 'Presentación para inversores y aliados' : 'Overview for investors and partners'}
          </a>
        </p>
        <h3>{t.about.builtTitle}</h3>
        <ul className="bullets">
          {t.about.built.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
