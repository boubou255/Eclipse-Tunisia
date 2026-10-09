import { useMemo } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useData } from '../../state/DataContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { filterTours } from '../../lib/filterTours.js';
import { formatDuration } from '../../lib/format.js';
import StepLayout from '../StepLayout.jsx';
import PhotoPlaceholder from '../ui/PhotoPlaceholder.jsx';
import PaceBadge from '../ui/PaceBadge.jsx';
import Price from '../ui/Price.jsx';

function TourCard({ tour, spot, selected, onOpen, eurRate }) {
  const { t, tx } = useI18n();
  return (
    <article className={`card flex flex-col overflow-hidden transition hover:-translate-y-0.5 ${selected ? 'border-corona-300 ring-2 ring-corona-300/60' : ''}`}>
      <PhotoPlaceholder hue={tour.hue} label={tx(tour.title)} className="h-40" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <PaceBadge pace={tour.pace} />
          <span className="chip">🗓️ {t('tours.days', { n: tour.days })}</span>
          {tour.sample && <span className="chip !border-amber-500/40 !text-amber-200">SAMPLE</span>}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-white">{tx(tour.title)}</h2>
        <p className="text-sm text-slate-300">
          🌑 {t('tours.eclipseAt', { spot: tx(spot?.name) })}
          {spot && <span className="text-slate-400"> · {formatDuration(spot.durationSec, t)}</span>}
        </p>
        {tour.stops?.length > 1 && <p className="text-xs text-slate-400">{tour.stops.join(' → ')}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-slate-400">
              {t('tours.from')} · {t('tours.perPerson')}
            </p>
            <Price tnd={tour.priceFromTND} eurRate={eurRate} />
          </div>
          <button type="button" className="btn-primary" onClick={onOpen}>
            {t('tours.details')}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ToursStep() {
  const { t, tx } = useI18n();
  const { booking, dispatch } = useBooking();
  const { tours, spotById, pricing } = useData();
  const { goNext, goBack, goTo } = useFlow();

  const { list, fallback } = useMemo(
    () => filterTours({ tours, spotById, style: booking.style, pace: booking.pace, spotId: booking.spotId }),
    [tours, spotById, booking.style, booking.pace, booking.spotId],
  );

  const spot = spotById[booking.spotId];
  const styleLabel = booking.style === 'explore' ? `${t('common.explore')} · ${t(`pace.${booking.pace}.title`)}` : t('common.calm');

  const open = (tour) => {
    dispatch({ type: 'setTour', tourId: tour.id });
    goNext();
  };

  return (
    <StepLayout
      wide
      title={t('tours.title')}
      subtitle={t('tours.subtitle', { style: styleLabel, spot: tx(spot?.name) })}
      onBack={goBack}
      onNext={goNext}
      canNext={!!booking.tourId && list.some((x) => x.id === booking.tourId)}
    >
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
        ⚠️ {t('tours.sample')}
      </p>
      {fallback && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300" role="status">
          {t('tours.noExact', { pace: t(`pace.${booking.pace}.title`) })}
        </p>
      )}
      {list.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-slate-300">{t('tours.none')}</p>
          <button type="button" className="btn-ghost mt-4" onClick={() => goTo('spot')}>
            {t('tours.changeSpot')}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              spot={spotById[tour.eclipseSpotId]}
              selected={booking.tourId === tour.id}
              onOpen={() => open(tour)}
              eurRate={pricing.eurRate}
            />
          ))}
        </div>
      )}
    </StepLayout>
  );
}
