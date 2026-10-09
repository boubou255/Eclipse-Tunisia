import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { site } from '../../data/site.js';

export default function ThankYou() {
  const { t } = useI18n();
  const { booking, dispatch } = useBooking();
  const ref = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    ref.current?.focus();
  }, []);

  return (
    <section className="mx-auto max-w-2xl animate-fadeUp px-4 py-16 text-center" aria-labelledby="thanks-title">
      <div aria-hidden="true" className="eclipse-disc mx-auto h-28 w-28" />
      <h1 id="thanks-title" ref={ref} tabIndex={-1} className="mt-10 text-4xl font-bold text-white focus:outline-none">
        {t('thanks.title')}
      </h1>
      <p className="mt-4 text-lg text-slate-300">{t('thanks.text', { ref: booking.reference || '—' })}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a className="btn-whatsapp" href={`https://wa.me/${site.bookingWhatsapp}?text=${encodeURIComponent(`Ref: ${booking.reference}`)}`} target="_blank" rel="noopener noreferrer">
          💬 {t('thanks.whatsapp')}
        </a>
        <button type="button" className="btn-ghost" onClick={() => dispatch({ type: 'reset' })}>
          {t('thanks.new')}
        </button>
      </div>
      <p className="mt-6 text-sm text-slate-400">{site.whatsappNumbers.map((n) => n.display).join(' · ')}</p>
    </section>
  );
}
