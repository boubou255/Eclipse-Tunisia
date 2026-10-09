import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import { useSelection } from '../../state/useSelection.js';
import { formatDate, formatDuration, formatMoney, formatTimeRange } from '../../lib/format.js';
import { buildBookingPayload, buildWhatsappText, makeReference, whatsappUrl } from '../../lib/bookingSummary.js';
import { sendBookingRequest } from '../../api/client.js';
import StepLayout from '../StepLayout.jsx';
import Price from '../ui/Price.jsx';

function Row({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-white/5 py-2.5 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="text-slate-100">{children}</dd>
    </div>
  );
}

export default function CheckoutStep() {
  const { t, tx, lang } = useI18n();
  const { booking, dispatch } = useBooking();
  const sel = useSelection();
  const { goBack, goTo } = useFlow();
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [reference] = useState(() => booking.reference || makeReference());

  const { tour, tourSpot, accommodation, startCity, quote, pricing } = sel;
  if (!tour || !quote) {
    return (
      <StepLayout title={t('sum.title')} onBack={goBack} hideNext>
        <button type="button" className="btn-primary" onClick={() => goTo('tours')}>
          {t('tours.title')}
        </button>
      </StepLayout>
    );
  }

  const money = (v) => formatMoney(v, 'TND', lang);
  const waText = buildWhatsappText({ booking, sel, t, tx, reference });

  const send = async () => {
    setStatus('sending');
    try {
      const payload = buildBookingPayload({ booking, sel, lang, reference });
      await sendBookingRequest(payload);
      dispatch({ type: 'submitted', reference });
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const edit = (step) => (
    <button type="button" className="ml-2 text-xs text-corona-300 underline-offset-2 hover:underline" onClick={() => goTo(step)}>
      ✎
      <span className="sr-only"> {t(`steps.${step}`)}</span>
    </button>
  );

  const lines = [
    ['sum.base', quote.lines.baseTND, { n: quote.pax }],
    ['sum.accSupp', quote.lines.accTND],
    ['sum.roomSupp', quote.lines.roomTND],
    ['sum.transportCost', quote.lines.transportTND],
    ['sum.transferCost', quote.lines.transferTND],
  ];

  return (
    <StepLayout title={t('sum.title')} subtitle={t('sum.subtitle')} onBack={goBack} hideNext>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card p-5">
          <dl>
            <Row label={t('sum.style')}>
              {booking.style === 'explore' ? t('common.explore') : t('common.calm')}
              {edit('style')}
            </Row>
            {booking.pace && <Row label={t('sum.pace')}>{t(`pace.${booking.pace}.title`)}</Row>}
            <Row label={t('sum.spot')}>
              <span className="font-semibold">{tx(tourSpot.name)}</span>
              <span className="block text-sm text-corona-200">
                {t('spot.totality')} {formatTimeRange(tourSpot)} · {formatDuration(tourSpot.durationSec, t)}
              </span>
              {edit('spot')}
            </Row>
            <Row label={t('sum.tour')}>
              {tx(tour.title)} · {t('tours.days', { n: tour.days })}
              {edit('tours')}
            </Row>
            <Row label={t('sum.accommodation')}>
              {accommodation ? `${t(`acc.${accommodation.type}`)} – ${accommodation.name}` : '—'}
              {edit('details')}
            </Row>
            <Row label={t('sum.room')}>{t(`room.${booking.options.roomType}`)}</Row>
            <Row label={t('sum.transport')}>{booking.options.transport ? t(`transport.${booking.options.transport}`) : '—'}</Row>
            <Row label={t('sum.start')}>
              {startCity ? tx(startCity.name) : '—'}
              {startCity?.local && booking.localPlace && ` (${booking.localPlace})`}
              {quote.transfer && !quote.transfer.quoteOnly && (
                <span className="block text-sm text-slate-400">→ {quote.transfer.dest}</span>
              )}
              {edit('start')}
            </Row>
            <Row label={t('sum.travelers')}>
              {t('sum.adultsChildren', { a: booking.adults, c: booking.childAges.length })}
              <ul className="mt-1 text-sm text-slate-300">
                {booking.travelers.map((tr, i) => (
                  <li key={i}>
                    {tr.firstName} {tr.lastName} · {tr.nationality} · {formatDate(tr.dob, lang)}
                  </li>
                ))}
              </ul>
              {edit('travelers')}
            </Row>
            <Row label={t('sum.dates')}>
              {formatDate(booking.lead.arrival, lang)} → {formatDate(booking.lead.departure, lang)}
            </Row>
            <Row label={t('sum.lead')}>
              {booking.lead.email}
              <span className="block">{booking.lead.phone}</span>
            </Row>
            {booking.lead.requests && <Row label={t('sum.requests')}>{booking.lead.requests}</Row>}
          </dl>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5" aria-labelledby="price-title">
            <h2 id="price-title" className="text-lg font-semibold text-white">
              {t('sum.price')}
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {lines.map(([key, value, vars]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="text-slate-400">{t(key, vars)}</dt>
                  <dd className="tabular-nums text-slate-100">{money(value)}</dd>
                </div>
              ))}
              {quote.transfer?.quoteOnly && <p className="text-xs text-slate-400">{t('start.quote')}</p>}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="font-semibold text-white">{t('sum.total')}</span>
              <Price tnd={quote.totalTND} eurRate={pricing.eurRate} size="lg" />
            </div>
            <p className="mt-2 text-xs text-slate-500">{t('sum.notice')}</p>
          </section>

          <div className="card space-y-4 p-5">
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[#f5c043]"
                checked={booking.termsAccepted}
                onChange={(e) => dispatch({ type: 'setTerms', value: e.target.checked })}
              />
              <span>{t('sum.terms')}</span>
            </label>
            <button type="button" className="btn-primary w-full" disabled={!booking.termsAccepted || status === 'sending'} onClick={send}>
              {status === 'sending' ? t('sum.sending') : t('sum.send')}
            </button>
            <a
              href={booking.termsAccepted ? whatsappUrl(waText) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!booking.termsAccepted}
              onClick={(e) => !booking.termsAccepted && e.preventDefault()}
              className={`btn-whatsapp w-full ${booking.termsAccepted ? '' : 'pointer-events-none opacity-40'}`}
            >
              <span aria-hidden="true">💬</span> {t('sum.whatsapp')}
            </a>
            {status === 'error' && (
              <p role="alert" className="text-sm text-rose-300">
                {t('sum.error')}
              </p>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
