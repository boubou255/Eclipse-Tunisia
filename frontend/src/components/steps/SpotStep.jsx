import { useCallback, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useData } from '../../state/DataContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { durationTier, formatDuration, formatTimeRange, TIER_COLORS } from '../../lib/format.js';
import StepLayout from '../StepLayout.jsx';
import EclipseMap from '../map/EclipseMap.jsx';
import SpotPanel from '../map/SpotPanel.jsx';

function Legend() {
  const { t } = useI18n();
  const items = [
    ['gold', 'map.legend.gold'],
    ['orange', 'map.legend.orange'],
    ['grey', 'map.legend.grey'],
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
      {items.map(([tier, key]) => (
        <li key={tier} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-full ring-1 ring-white/60" style={{ background: TIER_COLORS[tier] }} />
          {t(key)}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-dashed border-slate-400" />
        {t('map.legend.partial')}
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-5 rounded-sm border border-dashed border-corona-400 bg-black/60" />
        {t('map.legend.path')}
      </li>
    </ul>
  );
}

export default function SpotStep() {
  const { t, tx } = useI18n();
  const { booking, dispatch } = useBooking();
  const { spots, partialSpots, spotById } = useData();
  const { goNext, goBack } = useFlow();
  const [activeId, setActiveId] = useState(null);
  const [homeSignal, setHomeSignal] = useState(0);
  const mapWrapRef = useRef(null);

  const openFromList = (id) => {
    setActiveId(id);
    mapWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const sorted = useMemo(() => [...spots].sort((a, b) => b.durationSec - a.durationSec), [spots]);
  const active = activeId ? spotById[activeId] : null;

  const close = useCallback(() => {
    setActiveId(null);
    setHomeSignal((n) => n + 1);
  }, []);

  const choose = (spot) => {
    dispatch({ type: 'setSpot', spotId: spot.id });
    setActiveId(null);
    goNext();
  };

  const selected = booking.spotId ? spotById[booking.spotId] : null;

  return (
    <StepLayout
      wide
      title={t('map.title')}
      subtitle={t('map.subtitle')}
      onBack={goBack}
      onNext={goNext}
      canNext={!!booking.spotId}
      aside={
        selected && (
          <p className="hidden truncate text-sm text-slate-300 sm:block" aria-live="polite">
            {t('map.selected', { name: tx(selected.name) })}
          </p>
        )
      }
    >
      <Legend />
      <p className="mt-2 text-xs text-slate-400">⚠️ {t('map.pathWarning')}</p>

      <div ref={mapWrapRef} className="relative -mx-4 mt-4 h-[62vh] min-h-[380px] overflow-hidden border-y border-white/10 sm:mx-0 sm:rounded-2xl sm:border">
        <EclipseMap
          spots={spots}
          partialSpots={partialSpots}
          activeId={activeId}
          selectedId={booking.spotId}
          onSpotClick={(s) => setActiveId(s.id)}
          flyHomeSignal={homeSignal}
        />
        {active && <SpotPanel spot={active} selected={booking.spotId === active.id} onChoose={choose} onClose={close} />}
      </div>

      {/* Keyboard / screen-reader friendly list of all spots */}
      <h2 className="mt-8 text-xl font-semibold text-white">{t('map.listTitle')}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((s) => {
          const tier = durationTier(s.durationSec);
          const isSel = booking.spotId === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => openFromList(s.id)}
                aria-pressed={isSel}
                className={`card flex w-full items-center gap-3 p-3 text-left transition hover:border-corona-300/60 ${isSel ? 'border-corona-300 ring-1 ring-corona-300' : ''}`}
              >
                <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-white/60" style={{ background: TIER_COLORS[tier] }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white">{tx(s.name)}</span>
                  <span className="block text-xs text-slate-400">
                    {formatDuration(s.durationSec, t)} · {formatTimeRange(s)}
                  </span>
                </span>
                {isSel && <span className="text-corona-300">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        {partialSpots.map((p) => (
          <li key={p.id} className="chip !text-slate-400">
            {p.name} · {t('map.partialOnly')} ({p.coverage})
          </li>
        ))}
      </ul>
    </StepLayout>
  );
}
