/**
 * DATA / API LAYER — the only place that knows where data comes from.
 * ------------------------------------------------------------------
 * • No VITE_API_BASE_URL  → local sample data from src/data/*.js
 * • VITE_API_BASE_URL set → Laravel API (see README "Laravel API endpoints")
 *
 * Every function returns a Promise so the UI does not change when you switch.
 */
import * as local from '../data/index.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const usingApi = Boolean(API_BASE);

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

/** Laravel: GET /api/spots -> { spots: [...], partialSpots: [...] } */
export async function fetchSpots() {
  if (!usingApi) return { spots: local.spots, partialSpots: local.partialSpots };
  return getJson('/api/spots');
}

/** Laravel: GET /api/tours -> [...] (filtering is done client-side; you may add ?style=&pace=&spot=) */
export async function fetchTours() {
  if (!usingApi) return local.tours;
  return getJson('/api/tours');
}

/** Laravel: GET /api/accommodations -> [...] (each item has spotId) */
export async function fetchAccommodations() {
  if (!usingApi) return local.accommodations;
  return getJson('/api/accommodations');
}

/** Laravel: GET /api/start-cities -> [...] */
export async function fetchStartCities() {
  if (!usingApi) return local.startCities;
  return getJson('/api/start-cities');
}

/** Laravel: GET /api/pricing -> { eurRate, roomTypes, transportOptions, childPolicy, transfer } */
export async function fetchPricing() {
  if (!usingApi) return local.pricing;
  return getJson('/api/pricing');
}

/** Loads everything the booking flow needs. */
export async function fetchAll() {
  const [spotData, tours, accommodations, startCities, pricing] = await Promise.all([
    fetchSpots(),
    fetchTours(),
    fetchAccommodations(),
    fetchStartCities(),
    fetchPricing(),
  ]);
  return { ...spotData, tours, accommodations, startCities, pricing };
}

/**
 * Sends the booking request.
 * Laravel: POST /api/bookings  (JSON body = booking payload, see README)
 * Without an API it only logs the JSON (no real payment, no server).
 */
export async function sendBookingRequest(payload) {
  console.log('[Vibes Trip] Booking request JSON:\n', JSON.stringify(payload, null, 2));
  if (!usingApi) return { ok: true, reference: payload.reference, simulated: true };
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/bookings failed: ${res.status}`);
  return res.json();
}

/** URL of the totality path GeoJSON (in /public). Could also be served by Laravel. */
export const totalityPathUrl = `${import.meta.env.BASE_URL}totality-path.geojson`;
