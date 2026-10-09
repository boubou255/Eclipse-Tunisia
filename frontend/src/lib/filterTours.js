import { haversineKm } from './geo.js';

/**
 * Filters tours by style, pace (explore only) and eclipse spot.
 * Explore: if no circuit of that pace sees the eclipse at the chosen spot,
 * returns all circuits of that pace sorted by distance (fallback = true).
 */
export function filterTours({ tours, spotById, style, pace, spotId }) {
  if (!style || !spotId) return { list: [], fallback: false };
  if (style === 'calm') {
    return { list: tours.filter((t) => t.style === 'calm' && t.eclipseSpotId === spotId), fallback: false };
  }
  const ofPace = tours.filter((t) => t.style === 'explore' && (!pace || t.pace === pace));
  const exact = ofPace.filter((t) => t.eclipseSpotId === spotId);
  if (exact.length) return { list: exact, fallback: false };
  const chosen = spotById[spotId];
  const dist = (t) => (chosen && spotById[t.eclipseSpotId] ? haversineKm(chosen, spotById[t.eclipseSpotId]) : 0);
  return { list: [...ofPace].sort((a, b) => dist(a) - dist(b)), fallback: ofPace.length > 0 };
}
