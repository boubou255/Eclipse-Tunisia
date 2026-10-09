import { validateTravelers } from '../components/steps/TravelersStep.jsx';

/** Is the given step complete (i.e. can the user move past it)? */
export function isStepComplete(step, booking, data) {
  switch (step) {
    case 'style':
      return !!booking.style;
    case 'pace':
      return !!booking.pace;
    case 'spot':
      return !!booking.spotId && !!data.spotById?.[booking.spotId];
    case 'tours':
      return !!booking.tourId && !!data.tourById?.[booking.tourId];
    case 'details':
      return !!booking.options.accommodationId && !!booking.options.transport;
    case 'start': {
      const c = data.startCityById?.[booking.startCityId];
      return !!c && (!c.local || booking.localPlace.trim().length > 1);
    }
    case 'travelers':
      return Object.keys(validateTravelers(booking)).length === 0;
    default:
      return false;
  }
}

/** Index of the furthest step the user may jump to. */
export function maxReachableIndex(steps, booking, data) {
  let i = 0;
  while (i < steps.length - 1 && isStepComplete(steps[i], booking, data)) i++;
  return i;
}
