/**
 * Builds the booking request JSON (sent to console / Laravel) and the WhatsApp text.
 */
import { site } from '../data/site.js';
import { formatDuration, formatTimeRange } from './format.js';

export function makeReference() {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `VT27-${ts}${rnd}`;
}

/** JSON payload for POST /api/bookings. Ids are kept so the API can re-price server-side. */
export function buildBookingPayload({ booking, sel, lang, reference }) {
  const { tour, tourSpot, accommodation, startCity, quote, pricing } = sel;
  return {
    reference,
    createdAt: new Date().toISOString(),
    language: lang,
    style: booking.style,
    pace: booking.pace,
    eclipseSpot: tourSpot && {
      id: tourSpot.id,
      name: tourSpot.name.en,
      totalityStart: tourSpot.totalityStart,
      totalityEnd: tourSpot.totalityEnd,
      durationSec: tourSpot.durationSec,
    },
    selectedMapSpotId: booking.spotId,
    tour: tour && { id: tour.id, title: tour.title.en, days: tour.days, sample: !!tour.sample },
    accommodation: accommodation && { id: accommodation.id, type: accommodation.type, level: accommodation.level, name: accommodation.name },
    roomType: booking.options.roomType,
    transport: booking.options.transport,
    startPoint: startCity && {
      id: startCity.id,
      code: startCity.code,
      localPlace: startCity.local ? booking.localPlace : undefined,
    },
    travelers: {
      adults: booking.adults,
      childAges: booking.childAges,
      list: booking.travelers.map((tr, i) => ({ ...tr, kind: i < booking.adults ? 'adult' : 'child' })),
    },
    lead: booking.lead,
    price: quote && {
      currency: 'TND',
      ...quote.lines,
      totalTND: quote.totalTND,
      totalEUR: quote.totalEUR,
      eurRate: pricing.eurRate,
      transferQuotedSeparately: !!quote.transfer?.quoteOnly,
    },
    termsAccepted: booking.termsAccepted,
  };
}

/** Human-readable text for WhatsApp (in the visitor's language). */
export function buildWhatsappText({ booking, sel, t, tx, reference }) {
  const { tour, tourSpot, accommodation, startCity, quote } = sel;
  const lines = [t('wa.greeting'), ''];
  if (reference) lines.push(`Ref: ${reference}`);
  lines.push(`• ${t('sum.style')}: ${booking.style === 'explore' ? t('common.explore') : t('common.calm')}`);
  if (booking.pace) lines.push(`• ${t('sum.pace')}: ${t(`pace.${booking.pace}.title`)}`);
  if (tourSpot) {
    lines.push(`• ${t('sum.spot')}: ${tx(tourSpot.name)} (${formatTimeRange(tourSpot)}, ${formatDuration(tourSpot.durationSec, t)})`);
  }
  if (tour) lines.push(`• ${t('sum.tour')}: ${tx(tour.title)} – ${t('tours.days', { n: tour.days })}`);
  if (accommodation) lines.push(`• ${t('sum.accommodation')}: ${t(`acc.${accommodation.type}`)} – ${accommodation.name}`);
  lines.push(`• ${t('sum.room')}: ${t(`room.${booking.options.roomType}`)}`);
  if (booking.options.transport) lines.push(`• ${t('sum.transport')}: ${t(`transport.${booking.options.transport}`)}`);
  if (startCity) lines.push(`• ${t('sum.start')}: ${tx(startCity.name)}${startCity.local && booking.localPlace ? ` (${booking.localPlace})` : ''}`);
  lines.push(`• ${t('sum.travelers')}: ${t('sum.adultsChildren', { a: booking.adults, c: booking.childAges.length })}`);
  const names = booking.travelers.map((tr) => `${tr.firstName} ${tr.lastName}`.trim()).filter(Boolean);
  if (names.length) lines.push(`  ${names.join(', ')}`);
  if (booking.lead.arrival) lines.push(`• ${t('sum.dates')}: ${booking.lead.arrival} → ${booking.lead.departure}`);
  if (booking.lead.email || booking.lead.phone) lines.push(`• ${t('sum.lead')}: ${[booking.lead.email, booking.lead.phone].filter(Boolean).join(' / ')}`);
  if (booking.lead.requests) lines.push(`• ${t('sum.requests')}: ${booking.lead.requests}`);
  if (quote) lines.push(`• ${t('sum.total')}: ${quote.totalTND} TND (≈ ${quote.totalEUR} EUR)`);
  return lines.join('\n');
}

export function whatsappUrl(text, number = site.bookingWhatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
