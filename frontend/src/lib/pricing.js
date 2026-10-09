/**
 * Price engine (client-side estimate). Your Laravel API should recompute the
 * final price server-side when it receives the booking request.
 */
import { haversineKm } from './geo.js';

export function childFactor(age, pricing) {
  const rule = pricing.childPolicy.find((r) => age <= r.maxAge);
  return rule ? rule.factor : 1;
}

/** Transfer from the start city to the tour's first stop (one way). */
export function computeTransfer({ startCity, tour, pax, pricing }) {
  if (!startCity || !tour) return null;
  const cfg = pricing.transfer;
  const dest = tour.firstStop;
  if (startCity.local || startCity.lat == null) {
    return { quoteOnly: true, dest: dest.name, ferry: !!tour.ferry, costTND: 0 };
  }
  const km = Math.max(1, haversineKm(startCity, dest) * cfg.roadFactor);
  const driveMin = (km / cfg.avgSpeedKmh) * 60 + 10; // +10 min pick-up / luggage
  const vehicles = Math.max(1, Math.ceil(pax / cfg.vehicleCapacity));
  let costTND = vehicles * (cfg.baseTND + cfg.perKmTND * km);
  if (tour.ferry) costTND += cfg.ferryPerPersonTND * pax;
  return {
    quoteOnly: false,
    dest: dest.name,
    km: Math.round(km),
    driveMin: Math.round(driveMin),
    ferry: !!tour.ferry,
    ferryMin: tour.ferry ? cfg.ferryMinutes : 0,
    vehicles,
    costTND: Math.round(costTND),
  };
}

/**
 * Full quote for the current booking state.
 * Returns null until a tour is chosen.
 */
export function computeQuote({ booking, tour, accommodation, startCity, pricing }) {
  if (!tour || !pricing) return null;
  const adults = Math.max(1, booking.adults || 1);
  const childAges = booking.childAges || [];
  const pax = adults + childAges.length;
  const payingUnits = adults + childAges.reduce((sum, age) => sum + childFactor(age, pricing), 0);
  const nights = Math.max(0, tour.days - 1);

  const room = pricing.roomTypes.find((r) => r.id === booking.options.roomType) || pricing.roomTypes.find((r) => r.id === 'double');
  const transport = pricing.transportOptions.find((o) => o.id === booking.options.transport);

  const baseTND = tour.priceFromTND * payingUnits;
  const accTND = (accommodation?.supplementPerNightTND || 0) * nights * payingUnits;
  const roomTND = (room?.perPersonNightTND || 0) * nights * payingUnits;

  let transportTND = 0;
  if (transport) {
    const days = tour.transportDays || tour.days;
    if (transport.mode === 'perVehicleDay') {
      transportTND = Math.ceil(pax / (transport.capacity || 4)) * transport.priceTND * days;
    } else {
      transportTND = transport.priceTND * pax * days;
    }
  }

  const transfer = computeTransfer({ startCity, tour, pax, pricing });
  const transferTND = transfer?.costTND || 0;

  const totalTND = Math.round(baseTND + accTND + roomTND + transportTND + transferTND);
  return {
    pax,
    adults,
    children: childAges.length,
    nights,
    lines: {
      baseTND: Math.round(baseTND),
      accTND: Math.round(accTND),
      roomTND: Math.round(roomTND),
      transportTND: Math.round(transportTND),
      transferTND,
    },
    transfer,
    totalTND,
    totalEUR: Math.round(totalTND / pricing.eurRate),
  };
}
