import { useI18n } from '../i18n/I18nContext.jsx';
import { useBooking } from '../state/BookingContext.jsx';
import Counter from './ui/Counter.jsx';

/** Adults / children counters + child ages (shared by the Options and Travelers steps). */
export default function TravelerCounts({ idPrefix = 'tc' }) {
  const { t } = useI18n();
  const { booking, dispatch } = useBooking();
  return (
    <div>
      <div className="flex flex-wrap gap-6">
        <Counter id={`${idPrefix}-adults`} label={t('details.adults')} value={booking.adults} min={1} max={12} onChange={(v) => dispatch({ type: 'setAdults', value: v })} />
        <Counter id={`${idPrefix}-children`} label={t('details.children')} value={booking.childAges.length} min={0} max={8} onChange={(v) => dispatch({ type: 'setChildCount', value: v })} />
      </div>
      {booking.childAges.length > 0 && (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
          {booking.childAges.map((age, i) => (
            <div key={i}>
              <label htmlFor={`${idPrefix}-age-${i}`} className="label">
                {t('trav.childAge', { n: i + 1 })}
              </label>
              <select
                id={`${idPrefix}-age-${i}`}
                className="input"
                value={age}
                onChange={(e) => dispatch({ type: 'setChildAge', index: i, value: Number(e.target.value) })}
              >
                {Array.from({ length: 18 }, (_, a) => (
                  <option key={a} value={a}>
                    {t('trav.years', { n: a })}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
