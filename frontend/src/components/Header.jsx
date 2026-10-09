import { useI18n } from '../i18n/I18nContext.jsx';
import { useBooking } from '../state/BookingContext.jsx';
import { site } from '../data/site.js';

export default function Header() {
  const { lang, setLang, languages, t } = useI18n();
  const { dispatch } = useBooking();

  return (
    <header className="sticky top-0 z-[1100] border-b border-white/10 bg-night-950/80 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-corona-400 focus:px-3 focus:py-1 focus:text-night-950">
        {t('meta.skip')}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'goto', step: 'landing' })}
          className="flex items-center gap-2 rounded-full"
          aria-label={`${site.agency} – ${t('nav.home')}`}
        >
          <span aria-hidden="true" className="relative h-7 w-7 rounded-full bg-corona-400 shadow-corona">
            <span className="absolute inset-[3px] rounded-full bg-night-950" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Vibes <span className="text-corona-300">Trip</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${site.bookingWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 sm:inline-flex"
          >
            <span aria-hidden="true">💬</span> {site.whatsappNumbers[0].display}
          </a>
          <div role="group" aria-label={t('nav.language')} className="flex rounded-full border border-white/15 p-0.5">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                lang={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                aria-label={l.name}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  lang === l.code ? 'bg-corona-400 text-night-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
