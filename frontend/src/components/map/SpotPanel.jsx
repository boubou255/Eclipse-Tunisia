import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { durationTier, formatDuration, formatTimeRange, TIER_COLORS } from '../../lib/format.js';

/**
 * Spot details. Desktop: floating side panel over the map. Mobile: bottom sheet.
 */
export default function SpotPanel({ spot, selected, onChoose, onClose }) {
  const { t, tx } = useI18n();
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spot.id, onClose]);

  const tier = durationTier(spot.durationSec);

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-[1055] bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="spot-panel-title"
        className="fixed inset-x-0 bottom-0 z-[1060] max-h-[78vh] animate-slideUp overflow-y-auto rounded-t-3xl border border-white/10 bg-night-800/95 px-5 pt-5 shadow-card backdrop-blur
          lg:absolute lg:inset-auto lg:bottom-4 lg:right-4 lg:top-4 lg:max-h-none lg:w-96 lg:animate-fadeUp lg:rounded-2xl"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20 lg:hidden" />
        <div className="flex items-start justify-between gap-3">
          <h2 id="spot-panel-title" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-white focus:outline-none">
            {tx(spot.name)}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost h-9 w-9 shrink-0 !p-0" aria-label={t('spot.close')}>
            ✕
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-xl border border-white/10 bg-night-950/60 p-3">
            <dt className="text-xs uppercase tracking-wider text-slate-400">{t('spot.duration')}</dt>
            <dd className="mt-1 flex items-center gap-2 font-display text-3xl font-bold" style={{ color: TIER_COLORS[tier] }}>
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: TIER_COLORS[tier] }} />
              {formatDuration(spot.durationSec, t)}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-night-950/60 p-3">
            <dt className="text-xs uppercase tracking-wider text-slate-400">{t('spot.totality')}</dt>
            <dd className="mt-1 font-semibold tabular-nums text-white">{formatTimeRange(spot)}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-night-950/60 p-3">
            <dt className="text-xs uppercase tracking-wider text-slate-400">{t('spot.sunAltitude')}</dt>
            <dd className="mt-1 font-semibold text-white">{spot.sunAltitude}°</dd>
          </div>
        </dl>

        <p className="mt-4 text-slate-300">{tx(spot.description)}</p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-slate-400">{t('spot.stay')}</h3>
        <p className="mt-1 text-slate-200">{tx(spot.stayInfo)}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {spot.accommodationTypes.map((type) => (
            <li key={type} className="chip">
              {t(`acc.${type}`)}
            </li>
          ))}
        </ul>

        {spot.note && (
          <div className="mt-4 rounded-xl border border-corona-400/40 bg-corona-400/10 p-3 text-sm text-corona-100">
            <strong className="text-corona-200">{t('spot.note')} : </strong>
            {tx(spot.note)}
          </div>
        )}

        <div className="sticky -bottom-5 -mx-5 mt-5 border-t border-white/10 bg-night-800/95 px-5 pb-5 pt-3">
          <button type="button" className="btn-primary w-full" onClick={() => onChoose(spot)}>
            {selected ? t('spot.chosen') : t('spot.choose')}
          </button>
        </div>
      </div>
    </>
  );
}
