import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import Countdown from '../Countdown.jsx';

export default function Landing() {
  const { t } = useI18n();
  const { dispatch } = useBooking();
  const facts = [
    ['🌑', 'facts.first'],
    ['⏱️', 'facts.duration'],
    ['✨', 'facts.century'],
    ['🕙', 'facts.time'],
  ];

  const start = () => dispatch({ type: 'goto', step: 'style' });

  return (
    <div className="animate-fadeUp">
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 md:grid-cols-[1.3fr_1fr] md:pt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-corona-300">{t('hero.kicker')}</p>
            <h1 id="hero-title" className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              {t('hero.title')}
              <span className="block bg-gradient-to-r from-corona-200 via-corona-400 to-ember bg-clip-text text-transparent">{t('hero.subtitle')}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">{t('hero.lead')}</p>
            <div className="mt-8">
              <Countdown />
            </div>
            <button type="button" className="btn-primary mt-8 px-8 py-4 text-base" onClick={start}>
              {t('hero.cta')} <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Decorative eclipse */}
          <div aria-hidden="true" className="relative mx-auto hidden aspect-square w-72 place-items-center sm:grid lg:w-96">
            <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(245,192,67,0.25),transparent_65%)] blur-2xl" />
            <div className="eclipse-disc h-48 w-48 lg:h-64 lg:w-64" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4" aria-labelledby="facts-title">
        <h2 id="facts-title" className="sr-only">
          {t('facts.title')}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([icon, key]) => (
            <li key={key} className="card flex items-start gap-3 p-5">
              <span aria-hidden="true" className="text-2xl">
                {icon}
              </span>
              <span className="font-medium text-slate-100">{t(key)}</span>
            </li>
          ))}
        </ul>

        <aside className="mt-6 flex gap-4 rounded-2xl border border-corona-400/40 bg-corona-400/10 p-5" role="note" aria-labelledby="safety-title">
          <span aria-hidden="true" className="text-3xl">
            🕶️
          </span>
          <div>
            <h2 id="safety-title" className="font-display text-lg font-semibold text-corona-200">
              {t('safety.title')}
            </h2>
            <p className="mt-1 text-slate-200">{t('safety.text')}</p>
          </div>
        </aside>

        <div className="mt-10 text-center">
          <button type="button" className="btn-primary px-8 py-4 text-base" onClick={start}>
            {t('hero.cta')} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
