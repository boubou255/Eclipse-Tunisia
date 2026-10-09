import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAll } from '../api/client.js';

const DataContext = createContext(null);

/** Loads spots / tours / accommodations / start cities / pricing once (local data or Laravel API). */
export function DataProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let alive = true;
    fetchAll()
      .then((data) => alive && setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        console.error(error);
        if (alive) setState({ status: 'error', data: null, error });
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => {
    if (!state.data) return state;
    const d = state.data;
    const index = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
    return {
      ...state,
      ...d,
      spotById: index(d.spots),
      tourById: index(d.tours),
      accommodationById: index(d.accommodations),
      startCityById: index(d.startCities),
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
