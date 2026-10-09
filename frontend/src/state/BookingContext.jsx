import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadJSON, removeKey, saveJSON } from '../lib/storage.js';

const STORAGE_KEY = 'vibes-eclipse-booking-v1';

export const emptyTraveler = () => ({ firstName: '', lastName: '', nationality: '', dob: '' });

export const initialBooking = {
  step: 'landing',
  style: null, // 'calm' | 'explore'
  pace: null, // 'slow' | 'medium' | 'fast'
  spotId: null,
  tourId: null,
  options: { accommodationId: null, roomType: 'double', transport: null },
  adults: 2,
  childAges: [],
  startCityId: null,
  localPlace: '',
  travelers: [emptyTraveler(), emptyTraveler()],
  lead: { email: '', phone: '', arrival: '', departure: '', requests: '' },
  termsAccepted: false,
  reference: null,
};

/** Ordered step ids. The pace step only exists for "Explore Tunisia". */
export function getSteps(style) {
  return ['style', ...(style === 'explore' ? ['pace'] : []), 'spot', 'tours', 'details', 'start', 'travelers', 'checkout'];
}

function syncTravelers(travelers, count) {
  const next = travelers.slice(0, count);
  while (next.length < count) next.push(emptyTraveler());
  return next;
}

function reducer(state, action) {
  switch (action.type) {
    case 'goto':
      return { ...state, step: action.step };
    case 'setStyle': {
      if (state.style === action.style) return state;
      return { ...state, style: action.style, pace: action.style === 'calm' ? null : state.pace, tourId: null };
    }
    case 'setPace':
      return state.pace === action.pace ? state : { ...state, pace: action.pace, tourId: null };
    case 'setSpot':
      return state.spotId === action.spotId ? state : { ...state, spotId: action.spotId, tourId: null };
    case 'setTour':
      if (state.tourId === action.tourId) return state;
      return {
        ...state,
        tourId: action.tourId,
        options: { ...state.options, accommodationId: null, transport: null },
        lead: { ...state.lead, arrival: '', departure: '' },
      };
    case 'setOption':
      return { ...state, options: { ...state.options, [action.key]: action.value } };
    case 'setAdults': {
      const adults = Math.min(12, Math.max(1, action.value));
      return { ...state, adults, travelers: syncTravelers(state.travelers, adults + state.childAges.length) };
    }
    case 'setChildCount': {
      const count = Math.min(8, Math.max(0, action.value));
      const childAges = state.childAges.slice(0, count);
      while (childAges.length < count) childAges.push(6);
      return { ...state, childAges, travelers: syncTravelers(state.travelers, state.adults + count) };
    }
    case 'setChildAge': {
      const childAges = [...state.childAges];
      childAges[action.index] = action.value;
      return { ...state, childAges };
    }
    case 'setStart':
      return { ...state, startCityId: action.id };
    case 'setLocalPlace':
      return { ...state, localPlace: action.value };
    case 'setTraveler': {
      const travelers = [...state.travelers];
      travelers[action.index] = { ...travelers[action.index], [action.key]: action.value };
      return { ...state, travelers };
    }
    case 'setLead':
      return { ...state, lead: { ...state.lead, [action.key]: action.value } };
    case 'setTerms':
      return { ...state, termsAccepted: action.value };
    case 'submitted':
      return { ...state, reference: action.reference, step: 'thanks' };
    case 'reset':
      return { ...initialBooking, step: action.step || 'landing' };
    default:
      return state;
  }
}

function init() {
  const saved = loadJSON(STORAGE_KEY, null);
  if (!saved || typeof saved !== 'object') return initialBooking;
  // Merge to tolerate older saved shapes; never restore the thank-you screen.
  const merged = {
    ...initialBooking,
    ...saved,
    options: { ...initialBooking.options, ...(saved.options || {}) },
    lead: { ...initialBooking.lead, ...(saved.lead || {}) },
  };
  if (merged.step === 'thanks') return initialBooking;
  if (!Array.isArray(merged.childAges)) merged.childAges = [];
  merged.travelers = syncTravelers(Array.isArray(merged.travelers) ? merged.travelers : [], merged.adults + merged.childAges.length);
  return merged;
}

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [booking, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (booking.step === 'thanks') removeKey(STORAGE_KEY);
    else saveJSON(STORAGE_KEY, booking);
  }, [booking]);

  const value = useMemo(() => ({ booking, dispatch }), [booking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}
