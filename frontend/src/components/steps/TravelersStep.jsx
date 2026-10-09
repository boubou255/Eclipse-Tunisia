import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { useSelection } from '../../state/useSelection.js';
import { addDays } from '../../lib/format.js';
import { eclipse } from '../../data/site.js';
import StepLayout from '../StepLayout.jsx';
import TravelerCounts from '../TravelerCounts.jsx';
import PriceSummaryBox from '../PriceSummaryBox.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && ' *'}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function validateTravelers(booking) {
  const errors = {};
  booking.travelers.forEach((tr, i) => {
    ['firstName', 'lastName', 'nationality', 'dob'].forEach((k) => {
      if (!String(tr[k] || '').trim()) errors[`t${i}.${k}`] = true;
    });
  });
  const { email, phone, arrival, departure } = booking.lead;
  if (!EMAIL_RE.test(email.trim())) errors.email = 'trav.errEmail';
  if (phone.replace(/\D/g, '').length < 8) errors.phone = true;
  if (!arrival) errors.arrival = true;
  if (!departure) errors.departure = true;
  if (arrival && departure && departure <= arrival) errors.departure = 'trav.errDates';
  else if (arrival && departure && (arrival > eclipse.date || departure < eclipse.date)) errors.arrival = 'trav.errEclipse';
  return errors;
}

export default function TravelersStep() {
  const { t } = useI18n();
  const { booking, dispatch } = useBooking();
  const { tour } = useSelection();
  const { goNext, goBack } = useFlow();
  const [showErrors, setShowErrors] = useState(false);

  // Prefill dates from the tour so that day "eclipseDay" = 2 Aug 2027.
  useEffect(() => {
    if (tour && !booking.lead.arrival && !booking.lead.departure) {
      const arrival = addDays(eclipse.date, -(tour.eclipseDay - 1));
      dispatch({ type: 'setLead', key: 'arrival', value: arrival });
      dispatch({ type: 'setLead', key: 'departure', value: addDays(arrival, tour.days - 1) });
    }
  }, [tour, booking.lead.arrival, booking.lead.departure, dispatch]);

  const errors = validateTravelers(booking);
  const valid = Object.keys(errors).length === 0;
  const err = (key) => (showErrors && errors[key] ? (typeof errors[key] === 'string' ? t(errors[key]) : t('trav.required')) : null);
  const aria = (key) => (showErrors && errors[key] ? { 'aria-invalid': true, 'aria-describedby': `${key.replace('.', '-')}-err` } : {});

  const next = () => {
    if (valid) goNext();
    else {
      setShowErrors(true);
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
    }
  };

  const setLead = (key) => (e) => dispatch({ type: 'setLead', key, value: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <StepLayout title={t('trav.title')} subtitle={t('trav.subtitle')} onBack={goBack} onNext={next} canNext>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="card p-5">
            <TravelerCounts idPrefix="trav" />
          </div>

          {booking.travelers.map((tr, i) => {
            const isChild = i >= booking.adults;
            const n = isChild ? i - booking.adults + 1 : i + 1;
            const heading = isChild ? `${t('trav.child', { n })} (${t('trav.years', { n: booking.childAges[i - booking.adults] })})` : t('trav.adult', { n });
            return (
              <fieldset key={i} className="card p-5">
                <legend className="px-1 font-display text-lg font-semibold text-white">
                  {heading} {i === 0 && <span className="chip ml-2 !text-corona-200">{t('trav.lead')}</span>}
                </legend>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {[
                    ['firstName', 'text', 'given-name'],
                    ['lastName', 'text', 'family-name'],
                    ['nationality', 'text', 'off'],
                    ['dob', 'date', 'bday'],
                  ].map(([k, type, ac]) => {
                    const id = `t${i}-${k}`;
                    return (
                      <Field key={k} id={id} label={t(`trav.${k}`)} required error={err(`t${i}.${k}`)}>
                        <input
                          id={id}
                          type={type}
                          className="input"
                          value={tr[k]}
                          max={type === 'date' ? today : undefined}
                          autoComplete={i === 0 ? ac : 'off'}
                          onChange={(e) => dispatch({ type: 'setTraveler', index: i, key: k, value: e.target.value })}
                          {...aria(`t${i}.${k}`)}
                        />
                      </Field>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <fieldset className="card p-5">
            <legend className="px-1 font-display text-lg font-semibold text-white">{t('trav.lead')}</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field id="email" label={t('trav.email')} required error={err('email')}>
                <input id="email" type="email" className="input" autoComplete="email" value={booking.lead.email} onChange={setLead('email')} {...aria('email')} />
              </Field>
              <Field id="phone" label={t('trav.phone')} required error={err('phone')}>
                <input id="phone" type="tel" className="input" autoComplete="tel" placeholder="+49 …" value={booking.lead.phone} onChange={setLead('phone')} {...aria('phone')} />
              </Field>
              <Field id="arrival" label={t('trav.arrival')} required error={err('arrival')}>
                <input id="arrival" type="date" className="input" min="2027-07-01" max="2027-08-02" value={booking.lead.arrival} onChange={setLead('arrival')} {...aria('arrival')} />
              </Field>
              <Field id="departure" label={t('trav.departure')} required error={err('departure')}>
                <input id="departure" type="date" className="input" min="2027-08-02" max="2027-09-30" value={booking.lead.departure} onChange={setLead('departure')} {...aria('departure')} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="requests" label={t('trav.requests')}>
                  <textarea id="requests" rows={3} className="input" placeholder={t('trav.requestsPh')} value={booking.lead.requests} onChange={setLead('requests')} />
                </Field>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">{t('trav.required')}</p>
          </fieldset>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceSummaryBox />
        </div>
      </div>
    </StepLayout>
  );
}
