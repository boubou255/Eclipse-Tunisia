import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { eclipse } from '../data/site.js';

const TARGET = new Date(eclipse.countdownTarget).getTime();

function remaining() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const { t } = useI18n();
  const [r, setR] = useState(remaining);

  useEffect(() => {
    const id = setInterval(() => setR(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (r.done) return <p className="text-lg text-corona-200">{t('hero.passed')}</p>;

  const units = [
    ['days', r.days],
    ['hours', r.hours],
    ['minutes', r.minutes],
    ['seconds', r.seconds],
  ];

  return (
    <div>
      <p id="countdown-label" className="mb-3 text-sm uppercase tracking-widest text-slate-400">
        {t('hero.countdown')}
      </p>
      {/* Screen readers get a static sentence; the ticking digits are hidden to avoid noise. */}
      <p className="sr-only">
        {r.days} {t('hero.days')}, {r.hours} {t('hero.hours')}, {r.minutes} {t('hero.minutes')}
      </p>
      <div className="grid max-w-md grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
        {units.map(([k, v]) => (
          <div key={k} className="card flex flex-col items-center px-2 py-3">
            <span className="font-display text-2xl font-bold tabular-nums text-white sm:text-4xl">{String(v).padStart(k === 'days' ? 3 : 2, '0')}</span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 sm:text-xs">{t(`hero.${k}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
