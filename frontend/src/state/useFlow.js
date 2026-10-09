import { useCallback, useMemo } from 'react';
import { getSteps, useBooking } from './BookingContext.jsx';

/** Step navigation helpers (next / back respecting the optional pace step). */
export function useFlow() {
  const { booking, dispatch } = useBooking();
  const steps = useMemo(() => getSteps(booking.style), [booking.style]);
  const index = steps.indexOf(booking.step);

  const goNext = useCallback(() => {
    const i = steps.indexOf(booking.step);
    if (i >= 0 && i < steps.length - 1) dispatch({ type: 'goto', step: steps[i + 1] });
  }, [steps, booking.step, dispatch]);

  const goBack = useCallback(() => {
    const i = steps.indexOf(booking.step);
    dispatch({ type: 'goto', step: i <= 0 ? 'landing' : steps[i - 1] });
  }, [steps, booking.step, dispatch]);

  const goTo = useCallback((step) => dispatch({ type: 'goto', step }), [dispatch]);

  return { steps, index, goNext, goBack, goTo };
}
