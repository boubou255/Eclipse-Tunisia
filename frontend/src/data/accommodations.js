/**
 * ACCOMMODATIONS – SAMPLE / PLACEHOLDER NAMES (not real properties).
 * Later: GET /api/spots/{spotId}/accommodations  (or GET /api/accommodations?spot=...)
 *
 * Final shape of each item (what the UI consumes):
 *  { id, spotId, type: 'hotel'|'airbnb'|'guesthouse'|'camp', level: '3'|'4'|'5'|'standard',
 *    name, supplementPerNightTND }
 *
 * supplementPerNightTND = extra per person per night on top of the tour base price
 * (tour base price assumes the cheapest option of the spot in a double room).
 *
 * To keep this file short, the list is generated from a "setting" per spot.
 * You can replace the generator with a plain hand-written array at any time.
 */
import { spots } from './spots.js';

const SETTING_BY_SPOT = {
  sfax: 'city',
  mahres: 'beach',
  thyna: 'city',
  kerkennah: 'island',
  'sidi-bouzid': 'steppe',
  gafsa: 'oasis',
  metlaoui: 'desert',
  'el-jem': 'heritage',
  mahdia: 'beach',
  kairouan: 'heritage',
  gabes: 'oasis',
  'djerba-houmt-souk': 'djerba',
  'djerba-midoun': 'beach',
  'djerba-erriadh': 'djerba',
  zarzis: 'beach',
  tozeur: 'desert',
};

const HOTEL_NAME = {
  city: 'Sample City Hotel',
  beach: 'Sample Beach Resort',
  island: 'Sample Island Hotel',
  steppe: 'Sample Steppe Hotel',
  oasis: 'Sample Oasis Hotel',
  desert: 'Sample Tozeur Desert Hotel',
  heritage: 'Sample Heritage Hotel',
  djerba: 'Sample Djerba Hotel',
};
const AIRBNB_NAME = {
  city: 'Sample Airbnb City Apartment',
  beach: 'Sample Airbnb Beach Villa',
  island: 'Sample Airbnb Island House',
  djerba: 'Sample Airbnb Djerbian Houch',
};
const CAMP_NAME = {
  beach: 'Sample Beach Glamping Camp',
  island: 'Sample Island Camp',
  steppe: 'Sample Steppe Glamping Camp',
  desert: 'Sample Sahara Camp',
};

/** Levels per type with their per-person-per-night supplement (TND). */
const LEVELS = {
  hotel: [
    { level: '3', supplement: 0 },
    { level: '4', supplement: 65 },
    { level: '5', supplement: 160 },
  ],
  airbnb: [{ level: 'standard', supplement: 35 }],
  guesthouse: [{ level: 'standard', supplement: 40 }],
  camp: [{ level: 'standard', supplement: 90 }],
};

function nameFor(type, level, setting) {
  switch (type) {
    case 'hotel':
      return `${HOTEL_NAME[setting] || 'Sample Hotel'} ${level}★`;
    case 'airbnb':
      return AIRBNB_NAME[setting] || 'Sample Airbnb House';
    case 'guesthouse':
      return setting === 'oasis' ? 'Sample Oasis Guesthouse' : 'Sample Dar Guesthouse';
    case 'camp':
      return CAMP_NAME[setting] || 'Sample Glamping Camp';
    default:
      return 'Sample accommodation';
  }
}

export const accommodations = spots.flatMap((spot) => {
  const setting = SETTING_BY_SPOT[spot.id] || 'city';
  return spot.accommodationTypes.flatMap((type) =>
    (LEVELS[type] || []).map(({ level, supplement }) => ({
      id: `${spot.id}-${type}-${level}`,
      spotId: spot.id,
      type,
      level,
      name: nameFor(type, level, setting),
      supplementPerNightTND: supplement,
    })),
  );
});
