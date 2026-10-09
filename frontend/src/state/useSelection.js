import { useMemo } from 'react';
import { useBooking } from './BookingContext.jsx';
import { useData } from './DataContext.jsx';
import { computeQuote } from '../lib/pricing.js';

/** Resolves the ids in the booking state into full objects + live price quote. */
export function useSelection() {
  const { booking } = useBooking();
  const data = useData();

  return useMemo(() => {
    if (data.status !== 'ready') return { ready: false };
    const spot = data.spotById[booking.spotId] || null;
    const tour = data.tourById[booking.tourId] || null;
    const tourSpot = tour ? data.spotById[tour.eclipseSpotId] : null;
    const accommodation = data.accommodationById[booking.options.accommodationId] || null;
    const startCity = data.startCityById[booking.startCityId] || null;
    const quote = computeQuote({ booking, tour, accommodation, startCity, pricing: data.pricing });
    return { ready: true, spot, tour, tourSpot, accommodation, startCity, quote, pricing: data.pricing };
  }, [booking, data]);
}
