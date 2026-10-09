/**
 * START / ARRIVAL POINTS. Later: GET /api/start-cities (same shape).
 * `local: true` = "I'm already in Tunisia" (no automatic transfer price; quoted separately).
 */
export const startCities = [
  { id: 'DJE', code: 'DJE', name: { fr: 'Aéroport Djerba-Zarzis', en: 'Djerba-Zarzis airport', de: 'Flughafen Djerba-Zarzis' }, lat: 33.875, lng: 10.7755 },
  { id: 'TUN', code: 'TUN', name: { fr: 'Aéroport Tunis-Carthage', en: 'Tunis-Carthage airport', de: 'Flughafen Tunis-Karthago' }, lat: 36.851, lng: 10.227 },
  { id: 'NBE', code: 'NBE', name: { fr: 'Aéroport Enfidha-Hammamet', en: 'Enfidha-Hammamet airport', de: 'Flughafen Enfidha-Hammamet' }, lat: 36.0758, lng: 10.4386 },
  { id: 'MIR', code: 'MIR', name: { fr: 'Aéroport Monastir', en: 'Monastir airport', de: 'Flughafen Monastir' }, lat: 35.758, lng: 10.7547 },
  { id: 'SFA', code: 'SFA', name: { fr: 'Aéroport Sfax-Thyna', en: 'Sfax-Thyna airport', de: 'Flughafen Sfax-Thyna' }, lat: 34.718, lng: 10.691 },
  { id: 'LOCAL', code: null, local: true, name: { fr: 'Je suis déjà en Tunisie', en: "I'm already in Tunisia", de: 'Ich bin bereits in Tunesien' } },
];
