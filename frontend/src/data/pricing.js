/**
 * PRICING & OPTIONS CONFIG – SAMPLE VALUES, replace with your real rates.
 * Later: GET /api/pricing (same shape).
 *
 * All amounts are in TND. EUR is computed with `eurRate` (TND per 1 EUR).
 */
export const pricing = {
  currency: 'TND',
  eurRate: 3.4,

  /** Room types: supplement per person per night (negative = discount). */
  roomTypes: [
    { id: 'single', perPersonNightTND: 85, capacity: 1 },
    { id: 'double', perPersonNightTND: 0, capacity: 2 },
    { id: 'triple', perPersonNightTND: -15, capacity: 3 },
    { id: 'family', perPersonNightTND: -20, capacity: 5 },
  ],

  /**
   * Transport options.
   *  - mode 'perPersonDay': price × travelers × tour.transportDays
   *  - mode 'perVehicleDay': price × vehicles × tour.transportDays (vehicles = ceil(pax / capacity))
   *  - offroadOnly: only proposed when the eclipse spot / circuit is desert or steppe
   */
  transportOptions: [
    { id: 'private', mode: 'perVehicleDay', priceTND: 240, capacity: 4 },
    { id: 'minibus', mode: 'perPersonDay', priceTND: 45 },
    { id: '4x4', mode: 'perVehicleDay', priceTND: 390, capacity: 4, offroadOnly: true },
    { id: 'none', mode: 'perPersonDay', priceTND: 0 },
  ],

  /** Child price as a share of the adult price, by age (first matching rule wins). */
  childPolicy: [
    { maxAge: 1, factor: 0 },
    { maxAge: 11, factor: 0.5 },
    { maxAge: 17, factor: 1 },
  ],

  /** Airport / start-city transfer to the first stop of the trip (one way). */
  transfer: {
    baseTND: 60,
    perKmTND: 0.75,
    vehicleCapacity: 7,
    roadFactor: 1.3, // straight-line km × roadFactor ≈ road km
    avgSpeedKmh: 75,
    ferryMinutes: 75, // Sfax ↔ Kerkennah
    ferryPerPersonTND: 10,
  },
};
