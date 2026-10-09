import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useData } from '../../state/DataContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { useSelection } from '../../state/useSelection.js';
import { computeTransfer } from '../../lib/pricing.js';
import { formatDriveTime, formatMoney } from '../../lib/format.js';
import StepLayout from '../StepLayout.jsx';
import PriceSummaryBox from '../PriceSummaryBox.jsx';

function TransferInfo({ transfer }) {
  const { t, lang } = useI18n();
  if (!transfer) return null;
  if (transfer.quoteOnly) {
    return (
      <p className="text-sm text-slate-300">
        🚐 {t('start.transfer', { dest: transfer.dest })} — {t('start.quote')}
      </p>
    );
  }
  return (
    <div className="space-y-0.5 text-sm text-slate-300">
      <p>🚐 {t('start.transfer', { dest: transfer.dest })}</p>
      <p>⏱️ {t('start.drive', { time: formatDriveTime(transfer.driveMin), km: transfer.km })}</p>
      {transfer.ferry && <p>⛴️ {t('start.ferry', { min: transfer.ferryMin })}</p>}
      <p>
        💶 {t('start.transferCost')} : <strong className="text-corona-200">{formatMoney(transfer.costTND, 'TND', lang)}</strong>{' '}
        <span className="text-xs text-slate-500">({t('start.estimate')})</span>
      </p>
    </div>
  );
}

export default function StartStep() {
  const { t, tx } = useI18n();
  const { booking, dispatch } = useBooking();
  const { startCities, pricing } = useData();
  const { tour, quote } = useSelection();
  const { goNext, goBack } = useFlow();

  const pax = quote?.pax || booking.adults + booking.childAges.length;
  const selected = startCities.find((c) => c.id === booking.startCityId);
  const canNext = !!selected && (!selected.local || booking.localPlace.trim().length > 1);

  return (
    <StepLayout title={t('start.title')} subtitle={t('start.subtitle')} onBack={goBack} onNext={goNext} canNext={canNext}>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <fieldset>
          <legend className="sr-only">{t('start.title')}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {startCities.map((c) => {
              const checked = booking.startCityId === c.id;
              const transfer = computeTransfer({ startCity: c, tour, pax, pricing });
              return (
                <label
                  key={c.id}
                  className={`card flex cursor-pointer flex-col gap-2 p-4 transition hover:border-corona-300/60 ${
                    checked ? 'border-corona-300 ring-2 ring-corona-300/60' : ''
                  } ${c.local ? 'sm:col-span-2' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="start"
                      value={c.id}
                      checked={checked}
                      onChange={() => dispatch({ type: 'setStart', id: c.id })}
                      className="h-4 w-4 accent-[#f5c043]"
                    />
                    <span className="font-semibold text-white">
                      {c.local ? '🏨' : '✈️'} {tx(c.name)} {c.code && <span className="text-slate-400">({c.code})</span>}
                    </span>
                  </span>
                  <TransferInfo transfer={transfer} />
                </label>
              );
            })}
          </div>
          {selected?.local && (
            <div className="mt-4">
              <label htmlFor="local-place" className="label">
                {t('start.localLabel')} *
              </label>
              <input
                id="local-place"
                className="input"
                placeholder={t('start.localPlaceholder')}
                value={booking.localPlace}
                onChange={(e) => dispatch({ type: 'setLocalPlace', value: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
          )}
        </fieldset>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceSummaryBox />
        </div>
      </div>
    </StepLayout>
  );
}
