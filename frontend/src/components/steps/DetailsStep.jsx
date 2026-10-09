import { useEffect, useMemo } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useData } from '../../state/DataContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { useSelection } from '../../state/useSelection.js';
import { formatDuration, formatMoney } from '../../lib/format.js';
import { eclipse } from '../../data/site.js';
import StepLayout from '../StepLayout.jsx';
import PhotoPlaceholder from '../ui/PhotoPlaceholder.jsx';
import PaceBadge from '../ui/PaceBadge.jsx';
import TravelerCounts from '../TravelerCounts.jsx';
import PriceSummaryBox from '../PriceSummaryBox.jsx';

const TYPE_ORDER = ['hotel', 'airbnb', 'guesthouse', 'camp'];

function RadioRow({ name, value, checked, onChange, title, hint }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked ? 'border-corona-300 bg-corona-400/10' : 'border-white/10 hover:border-white/30'
      }`}
    >
      <span className="flex items-center gap-3">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#f5c043]" />
        <span className="text-slate-100">{title}</span>
      </span>
      {hint && <span className="shrink-0 text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export default function DetailsStep() {
  const { t, tx, lang } = useI18n();
  const { booking, dispatch } = useBooking();
  const { accommodations, pricing } = useData();
  const { tour, tourSpot } = useSelection();
  const { goNext, goBack } = useFlow();

  const spotAccommodations = useMemo(
    () =>
      accommodations
        .filter((a) => a.spotId === tourSpot?.id)
        .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.supplementPerNightTND - b.supplementPerNightTND),
    [accommodations, tourSpot],
  );
  const transportChoices = useMemo(
    () => pricing.transportOptions.filter((o) => tour?.transportOptions.includes(o.id) && (!o.offroadOnly || tour.transportOptions.includes('4x4'))),
    [pricing, tour],
  );

  // Sensible defaults: cheapest accommodation + first transport option.
  useEffect(() => {
    if (!tour) return;
    if (!spotAccommodations.some((a) => a.id === booking.options.accommodationId) && spotAccommodations[0]) {
      const cheapest = [...spotAccommodations].sort((a, b) => a.supplementPerNightTND - b.supplementPerNightTND)[0];
      dispatch({ type: 'setOption', key: 'accommodationId', value: cheapest.id });
    }
    if (!transportChoices.some((o) => o.id === booking.options.transport) && transportChoices[0]) {
      dispatch({ type: 'setOption', key: 'transport', value: transportChoices[0].id });
    }
  }, [tour, spotAccommodations, transportChoices, booking.options.accommodationId, booking.options.transport, dispatch]);

  if (!tour || !tourSpot) {
    return (
      <StepLayout title={t('tours.title')} onBack={goBack} onNext={goNext} canNext={false}>
        <p className="text-slate-300">{t('tours.none')}</p>
      </StepLayout>
    );
  }

  const money = (v) => formatMoney(v, 'TND', lang);
  const groupedAcc = TYPE_ORDER.map((type) => [type, spotAccommodations.filter((a) => a.type === type)]).filter(([, list]) => list.length);

  const transportHint = (o) => {
    if (o.priceTND === 0) return '';
    return t(o.mode === 'perVehicleDay' ? 'details.perVehicleDay' : 'details.perPersonDay', { amount: money(o.priceTND) });
  };

  return (
    <StepLayout
      wide
      title={tx(tour.title)}
      subtitle={`${t('tours.days', { n: tour.days })} · ${t('tours.eclipseAt', { spot: tx(tourSpot.name) })}`}
      onBack={goBack}
      onNext={goNext}
      canNext={!!booking.options.accommodationId && !!booking.options.transport}
      aside={
        <div className="hidden sm:block">
          <PriceSummaryBox compact />
        </div>
      }
    >
      {/* Gallery placeholders */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label={t('details.gallery')} role="group">
        <PhotoPlaceholder hue={tour.hue} label={`${t('details.gallery')} 1`} className="col-span-3 h-48 rounded-2xl sm:col-span-2 sm:row-span-2 sm:h-full sm:min-h-[260px]" />
        <PhotoPlaceholder hue={(tour.hue + 40) % 360} label={`${t('details.gallery')} 2`} className="h-24 rounded-xl sm:h-32" />
        <PhotoPlaceholder hue={(tour.hue + 80) % 360} label={`${t('details.gallery')} 3`} className="h-24 rounded-xl sm:h-32" />
        <PhotoPlaceholder hue={(tour.hue + 120) % 360} label={`${t('details.gallery')} 4`} className="h-24 rounded-xl sm:hidden" />
      </div>
      <p className="mt-2 text-xs text-slate-500">{t('details.gallery')}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PaceBadge pace={tour.pace} />
        {tour.sample && <span className="chip !border-amber-500/40 !text-amber-200">⚠️ {t('tours.sample')}</span>}
      </div>
      {tour.stops?.length > 1 && (
        <p className="mt-3 text-sm text-slate-300">
          <strong className="text-slate-100">{t('details.stops')} :</strong> {tour.stops.join(' → ')}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* LEFT: content */}
        <div className="space-y-8">
          <section aria-labelledby="eclipse-plan" className="rounded-2xl border border-corona-400/40 bg-gradient-to-br from-corona-400/15 to-transparent p-5">
            <h2 id="eclipse-plan" className="text-xl font-semibold text-corona-200">
              🌑 {t('details.eclipsePlan')}
            </h2>
            <ul className="mt-3 space-y-2 text-slate-200">
              <li>📍 {t('details.plan.arrive', { time: eclipse.meetingTime })}</li>
              <li>🕶️ {t('details.plan.glasses')}</li>
              <li>🌗 {t('details.plan.partial', { start: eclipse.partialStart, end: eclipse.partialEnd })}</li>
              <li className="font-semibold text-white">
                ⭐{' '}
                {t('details.plan.totality', {
                  spot: tx(tourSpot.name),
                  start: `${tourSpot.approximate ? '~' : ''}${tourSpot.totalityStart}`,
                  end: tourSpot.totalityEnd,
                  duration: formatDuration(tourSpot.durationSec, t),
                })}
              </li>
            </ul>
          </section>

          <section aria-labelledby="itinerary">
            <h2 id="itinerary" className="text-xl font-semibold text-white">
              {t('details.itinerary')}
            </h2>
            <ol className="mt-4 space-y-3 border-l border-white/10 pl-5">
              {tour.itinerary.map((d, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ${d.eclipse ? 'bg-corona-400 shadow-corona' : 'bg-white/30'}`}
                  />
                  <p className="text-xs uppercase tracking-wider text-slate-400">{t('details.day', { n: i + 1 })}</p>
                  <p className={`font-semibold ${d.eclipse ? 'text-corona-200' : 'text-white'}`}>{tx(d.title)}</p>
                  <p className="text-sm text-slate-300">{tx(d.text)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h2 className="font-semibold text-emerald-200">✓ {t('details.included')}</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {tour.included.map((k) => (
                  <li key={k}>• {t(`incl.${k}`)}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-rose-200">✗ {t('details.notIncluded')}</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {tour.notIncluded.map((k) => (
                  <li key={k}>• {t(`excl.${k}`)}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* RIGHT: options */}
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="options-title">
          <div className="card space-y-6 p-5">
            <h2 id="options-title" className="text-xl font-semibold text-white">
              {t('details.options')}
            </h2>

            <fieldset>
              <legend className="label">{t('details.accommodation')}</legend>
              <div className="space-y-3">
                {groupedAcc.map(([type, list]) => (
                  <div key={type}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{t(`acc.${type}`)}</p>
                    <div className="space-y-1.5">
                      {list.map((a) => (
                        <RadioRow
                          key={a.id}
                          name="accommodation"
                          value={a.id}
                          checked={booking.options.accommodationId === a.id}
                          onChange={() => dispatch({ type: 'setOption', key: 'accommodationId', value: a.id })}
                          title={a.name}
                          hint={a.supplementPerNightTND ? t('details.supplement', { amount: money(a.supplementPerNightTND) }) : ''}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">{t('details.room')}</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {pricing.roomTypes.map((r) => (
                  <RadioRow
                    key={r.id}
                    name="room"
                    value={r.id}
                    checked={booking.options.roomType === r.id}
                    onChange={() => dispatch({ type: 'setOption', key: 'roomType', value: r.id })}
                    title={t(`room.${r.id}`)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">{t('details.transport')}</legend>
              <div className="space-y-1.5">
                {transportChoices.map((o) => (
                  <RadioRow
                    key={o.id}
                    name="transport"
                    value={o.id}
                    checked={booking.options.transport === o.id}
                    onChange={() => dispatch({ type: 'setOption', key: 'transport', value: o.id })}
                    title={t(`transport.${o.id}`)}
                    hint={transportHint(o)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">{t('details.travelers')}</legend>
              <TravelerCounts idPrefix="opt" />
            </fieldset>

            <PriceSummaryBox />
          </div>
        </aside>
      </div>
    </StepLayout>
  );
}
