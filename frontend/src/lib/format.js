/** Formatting helpers. */

export function formatDuration(sec, t) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} ${t('common.min')} ${String(s).padStart(2, '0')} ${t('common.sec')}`;
}

export function formatTimeRange(spot) {
  const prefix = spot.approximate ? '~' : '';
  return `${prefix}${spot.totalityStart} – ${spot.totalityEnd}`;
}

/** 'gold' | 'orange' | 'grey' from duration (5 min+ gold, 3–5 min orange, under 3 min grey). */
export function durationTier(sec) {
  if (sec >= 300) return 'gold';
  if (sec >= 180) return 'orange';
  return 'grey';
}

export const TIER_COLORS = {
  gold: '#f5c043',
  orange: '#f08a3c',
  grey: '#9aa0b4',
  partial: '#5b6076',
};

const LOCALES = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE' };

export function formatMoney(amount, currency, lang) {
  return new Intl.NumberFormat(LOCALES[lang] || 'fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatDate(iso, lang) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALES[lang] || 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function formatDriveTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, '0')}`;
}

/** Add days to an ISO date (YYYY-MM-DD) without timezone surprises. */
export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
