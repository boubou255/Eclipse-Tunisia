/**
 * TOURS – ⚠️ SAMPLE DATA: names, itineraries and prices are placeholders.
 * Later: GET /api/tours?style=calm|explore&pace=slow|medium|fast&spot={spotId}
 *
 * Shape of each tour (what the UI consumes):
 * {
 *   id, sample: true,
 *   style: 'calm' | 'explore',
 *   pace: null | 'slow' | 'medium' | 'fast',
 *   eclipseSpotId,                 // must match an id in spots.js
 *   title: { fr, en, de },
 *   days, eclipseDay,              // eclipseDay = day number (1-based) that is 2 Aug 2027
 *   priceFromTND,                  // per adult, cheapest accommodation, double room, no transport
 *   transportDays,                 // days used for transport pricing
 *   transportOptions: ['private','minibus','4x4','none'],
 *   stops: [ 'Tunis', 'El Jem', ... ],
 *   firstStop: { name, lat, lng }, // where the arrival transfer goes
 *   ferry: boolean,                // Kerkennah ferry needed on arrival
 *   itinerary: [ { title:{fr,en,de}, text:{fr,en,de}, eclipse?: true } ],
 *   included: [keys], notIncluded: [keys]   // keys translated in i18n (incl.* / excl.*)
 *   hue: number                    // colour of the photo placeholder
 * }
 */
import { spots } from './spots.js';

const L = (fr, en, de) => ({ fr, en, de });
const spotById = Object.fromEntries(spots.map((s) => [s.id, s]));

/* ------------------------------------------------------------------ */
/* "STAY CALM" tours – generated from templates for every spot         */
/* ------------------------------------------------------------------ */

const CALM_TEMPLATES = [
  {
    key: 'escape',
    title: (n) => L(`Escapade Éclipse – ${n.fr}`, `Eclipse Escape – ${n.en}`, `Finsternis-Kurztrip – ${n.de}`),
    days: 4,
    eclipseDay: 3,
    basePrice: 1150,
  },
  {
    key: 'relax',
    title: (n) => L(`Éclipse & Détente – ${n.fr}`, `Eclipse & Relax – ${n.en}`, `Finsternis & Entspannung – ${n.de}`),
    days: 7,
    eclipseDay: 4,
    basePrice: 1890,
  },
  {
    key: 'premium',
    title: (n) => L(`Expérience Éclipse Premium – ${n.fr}`, `Premium Eclipse Experience – ${n.en}`, `Premium-Finsternis-Erlebnis – ${n.de}`),
    days: 5,
    eclipseDay: 3,
    basePrice: 2650,
    onlyFor: ['sfax', 'mahres', 'kerkennah', 'djerba-houmt-souk', 'djerba-midoun'],
    extraIncluded: ['astronomer', 'halfBoard'],
  },
];

/** Small price tweak per spot (sample). */
const SPOT_PRICE_FACTOR = {
  'djerba-midoun': 1.12,
  'djerba-houmt-souk': 1.05,
  kerkennah: 1.08,
  mahres: 1.05,
  tozeur: 1.0,
  metlaoui: 1.06,
  'sidi-bouzid': 1.04,
  mahdia: 0.95,
  zarzis: 0.93,
  kairouan: 0.92,
};

function calmItinerary(spot, days, eclipseDay) {
  const r = spot.region;
  const items = [];
  for (let d = 1; d <= days; d++) {
    if (d === 1) {
      items.push({
        title: L(`Arrivée à ${r}`, `Arrival in ${r}`, `Ankunft in ${r}`),
        text: L(
          'Accueil, transfert et installation. Dîner de bienvenue et premier briefing éclipse.',
          'Welcome, transfer and check-in. Welcome dinner and first eclipse briefing.',
          'Empfang, Transfer und Check-in. Willkommensabendessen und erstes Finsternis-Briefing.',
        ),
      });
    } else if (d === eclipseDay) {
      items.push({
        eclipse: true,
        title: L('☀️ Jour de l’éclipse – 2 août 2027', '☀️ Eclipse day – 2 August 2027', '☀️ Finsternistag – 2. August 2027'),
        text: L(
          'Départ matinal vers le site d’observation, phases partielles avec lunettes certifiées, totalité, puis déjeuner de célébration.',
          'Early departure to the viewing site, partial phases with certified glasses, totality, then a celebration lunch.',
          'Früher Aufbruch zum Beobachtungsort, partielle Phasen mit zertifizierten Brillen, Totalität, danach Festessen.',
        ),
      });
    } else if (d === eclipseDay - 1) {
      items.push({
        title: L('Veille de l’éclipse', 'Eclipse eve', 'Vorabend der Finsternis'),
        text: L(
          'Repérage du site, conférence d’astronomie, remise des lunettes. Coucher tôt !',
          'Site scouting, astronomy talk, eclipse glasses handed out. Early night!',
          'Besichtigung des Beobachtungsorts, Astronomie-Vortrag, Ausgabe der Brillen. Früh ins Bett!',
        ),
      });
    } else if (d === days) {
      items.push({
        title: L('Départ', 'Departure', 'Abreise'),
        text: L('Petit-déjeuner et transfert retour.', 'Breakfast and return transfer.', 'Frühstück und Rücktransfer.'),
      });
    } else {
      items.push({
        title: L('Journée libre', 'Free day', 'Freier Tag'),
        text: L(
          `Détente, plage ou découverte de ${r} à votre rythme (excursions optionnelles).`,
          `Relax, enjoy the beach or explore ${r} at your own pace (optional excursions).`,
          `Entspannen, Strand oder ${r} in Ihrem Tempo entdecken (optionale Ausflüge).`,
        ),
      });
    }
  }
  return items;
}

const calmTours = spots.flatMap((spot) =>
  CALM_TEMPLATES.filter((tpl) => !tpl.onlyFor || tpl.onlyFor.includes(spot.id)).map((tpl, i) => ({
    id: `calm-${tpl.key}-${spot.id}`,
    sample: true,
    style: 'calm',
    pace: null,
    eclipseSpotId: spot.id,
    title: tpl.title(spot.name),
    days: tpl.days,
    eclipseDay: tpl.eclipseDay,
    priceFromTND: Math.round((tpl.basePrice * (SPOT_PRICE_FACTOR[spot.id] || 1)) / 10) * 10,
    transportDays: 3,
    transportOptions: spot.offroad ? ['private', 'minibus', '4x4', 'none'] : ['private', 'minibus', 'none'],
    stops: [spot.region],
    firstStop: { name: spot.region, lat: spot.lat, lng: spot.lng },
    ferry: spot.id === 'kerkennah',
    itinerary: calmItinerary(spot, tpl.days, tpl.eclipseDay),
    included: ['accommodation', 'breakfast', 'glasses', 'briefing', 'eclipseTransfer', ...(tpl.extraIncluded || [])],
    notIncluded: ['flights', 'insurance', 'lunches', 'drinks', 'tips'],
    hue: (spots.indexOf(spot) * 23 + i * 40) % 360,
  })),
);

/* ------------------------------------------------------------------ */
/* "EXPLORE TUNISIA" circuits – 2 per pace (hand-written samples)      */
/* ------------------------------------------------------------------ */

const day = (titleFr, titleEn, titleDe, textFr, textEn, textDe, eclipse = false) => ({
  title: L(titleFr, titleEn, titleDe),
  text: L(textFr, textEn, textDe),
  ...(eclipse ? { eclipse: true } : {}),
});

const exploreTours = [
  {
    id: 'explore-fast-classic',
    pace: 'fast',
    eclipseSpotId: 'sfax',
    title: L('Grand Sud Express : Tunis → Djerba', 'Southern Express: Tunis → Djerba', 'Süd-Express: Tunis → Djerba'),
    days: 5,
    eclipseDay: 3,
    priceFromTND: 1690,
    stops: ['Tunis', 'El Jem', 'Sfax', 'Gabès', 'Matmata', 'Djerba'],
    firstStop: { name: 'Tunis', lat: 36.8065, lng: 10.1815 },
    transportOptions: ['private', 'minibus'],
    itinerary: [
      day('Tunis & Carthage', 'Tunis & Carthage', 'Tunis & Karthago',
        'Arrivée, médina de Tunis, ruines de Carthage et Sidi Bou Saïd au coucher du soleil.',
        'Arrival, Tunis medina, Carthage ruins and Sidi Bou Said at sunset.',
        'Ankunft, Medina von Tunis, Ruinen von Karthago und Sidi Bou Said bei Sonnenuntergang.'),
      day('Tunis → El Jem → Sfax', 'Tunis → El Jem → Sfax', 'Tunis → El Jem → Sfax',
        'Départ 7h, visite de l’amphithéâtre d’El Jem, nuit à Sfax. Briefing éclipse.',
        '7 am start, visit El Jem amphitheater, night in Sfax. Eclipse briefing.',
        'Start um 7 Uhr, Amphitheater von El Jem, Übernachtung in Sfax. Finsternis-Briefing.'),
      day('☀️ Éclipse à Sfax → Gabès', '☀️ Eclipse in Sfax → Gabès', '☀️ Finsternis in Sfax → Gabès',
        'Totalité depuis Sfax, puis route vers l’oasis maritime de Gabès.',
        'Totality in Sfax, then drive to the seaside oasis of Gabès.',
        'Totalität in Sfax, danach Fahrt zur Meeresoase Gabès.', true),
      day('Gabès → Matmata → Djerba', 'Gabès → Matmata → Djerba', 'Gabès → Matmata → Djerba',
        'Maisons troglodytes de Matmata, puis traversée vers Djerba.',
        'Matmata troglodyte houses, then on to Djerba island.',
        'Höhlenwohnungen von Matmata, dann weiter nach Djerba.'),
      day('Djerba & départ', 'Djerba & departure', 'Djerba & Abreise',
        'Matinée à Houmt Souk et transfert vers l’aéroport de Djerba.',
        'Morning in Houmt Souk and transfer to Djerba airport.',
        'Vormittag in Houmt Souk und Transfer zum Flughafen Djerba.'),
    ],
  },
  {
    id: 'explore-fast-sahara',
    pace: 'fast',
    eclipseSpotId: 'metlaoui',
    title: L('Éclipse Sahara Express', 'Sahara Eclipse Express', 'Sahara-Finsternis-Express'),
    days: 6,
    eclipseDay: 3,
    priceFromTND: 1940,
    stops: ['Tunis', 'Kairouan', 'Gafsa', 'Metlaoui', 'Tozeur', 'Douz', 'Matmata', 'Djerba'],
    firstStop: { name: 'Tunis', lat: 36.8065, lng: 10.1815 },
    transportOptions: ['private', 'minibus', '4x4'],
    itinerary: [
      day('Arrivée à Tunis', 'Arrival in Tunis', 'Ankunft in Tunis',
        'Accueil et nuit à Tunis.', 'Welcome and night in Tunis.', 'Empfang und Übernachtung in Tunis.'),
      day('Tunis → Kairouan → Gafsa', 'Tunis → Kairouan → Gafsa', 'Tunis → Kairouan → Gafsa',
        'Grande Mosquée de Kairouan, route vers Gafsa. Briefing éclipse.',
        'Great Mosque of Kairouan, drive to Gafsa. Eclipse briefing.',
        'Große Moschee von Kairouan, Fahrt nach Gafsa. Finsternis-Briefing.'),
      day('☀️ Éclipse aux gorges de Selja → Tozeur', '☀️ Eclipse at Selja gorge → Tozeur', '☀️ Finsternis in der Selja-Schlucht → Tozeur',
        'Départ 6h30, totalité au-dessus des canyons, puis Tozeur.',
        '6:30 am start, totality above the canyons, then on to Tozeur.',
        'Start um 6:30 Uhr, Totalität über den Schluchten, dann Tozeur.', true),
      day('Chott el Jerid → Douz', 'Chott el Jerid → Douz', 'Chott el Jerid → Douz',
        'Traversée du lac salé, dunes et nuit en camp saharien.',
        'Cross the salt lake, dunes and a night in a Sahara camp.',
        'Durchquerung des Salzsees, Dünen und Nacht im Sahara-Camp.'),
      day('Douz → Matmata → Djerba', 'Douz → Matmata → Djerba', 'Douz → Matmata → Djerba',
        'Villages troglodytes puis Djerba.', 'Troglodyte villages, then Djerba.', 'Höhlendörfer, dann Djerba.'),
      day('Départ de Djerba', 'Departure from Djerba', 'Abreise ab Djerba',
        'Transfert vers l’aéroport.', 'Transfer to the airport.', 'Transfer zum Flughafen.'),
    ],
  },
  {
    id: 'explore-medium-coast',
    pace: 'medium',
    eclipseSpotId: 'mahres',
    title: L('Côte & Éclipse : Monastir → Djerba', 'Coast & Eclipse: Monastir → Djerba', 'Küste & Finsternis: Monastir → Djerba'),
    days: 7,
    eclipseDay: 4,
    priceFromTND: 1980,
    stops: ['Monastir', 'El Jem', 'Mahrès', 'Djerba'],
    firstStop: { name: 'Monastir', lat: 35.7643, lng: 10.8113 },
    transportOptions: ['private', 'minibus'],
    itinerary: [
      day('Arrivée à Monastir', 'Arrival in Monastir', 'Ankunft in Monastir',
        'Accueil, installation, ribat au coucher du soleil.', 'Welcome, check-in, ribat at sunset.', 'Empfang, Check-in, Ribat bei Sonnenuntergang.'),
      day('Monastir & Mahdia', 'Monastir & Mahdia', 'Monastir & Mahdia',
        'Journée détente et visite de Mahdia.', 'Relaxed day and visit of Mahdia.', 'Entspannter Tag und Besuch von Mahdia.'),
      day('El Jem → Mahrès', 'El Jem → Mahrès', 'El Jem → Mahrès',
        'Amphithéâtre d’El Jem, puis installation au bord de la mer à Mahrès. Briefing.',
        'El Jem amphitheater, then check-in by the sea in Mahrès. Briefing.',
        'Amphitheater El Jem, dann Check-in am Meer in Mahrès. Briefing.'),
      day('☀️ Éclipse sur la plage de Mahrès', '☀️ Eclipse on Mahrès beach', '☀️ Finsternis am Strand von Mahrès',
        'L’une des plus longues totalités du pays, les pieds dans le sable.',
        'One of the longest totalities in the country, feet in the sand.',
        'Eine der längsten Totalitäten des Landes, Füße im Sand.', true),
      day('Mahrès → Djerba', 'Mahrès → Djerba', 'Mahrès → Djerba',
        'Route vers Djerba via Gabès.', 'Drive to Djerba via Gabès.', 'Fahrt nach Djerba über Gabès.'),
      day('Djerba libre', 'Free day in Djerba', 'Freier Tag auf Djerba',
        'Plage, Djerbahood, souks.', 'Beach, Djerbahood, souks.', 'Strand, Djerbahood, Souks.'),
      day('Départ', 'Departure', 'Abreise',
        'Transfert vers l’aéroport de Djerba.', 'Transfer to Djerba airport.', 'Transfer zum Flughafen Djerba.'),
    ],
  },
  {
    id: 'explore-medium-steppe',
    pace: 'medium',
    eclipseSpotId: 'sidi-bouzid',
    title: L('Steppe & Oasis', 'Steppe & Oases', 'Steppe & Oasen'),
    days: 6,
    eclipseDay: 3,
    priceFromTND: 1820,
    stops: ['Tunis', 'Kairouan', 'Sidi Bouzid', 'Tozeur'],
    firstStop: { name: 'Tunis', lat: 36.8065, lng: 10.1815 },
    transportOptions: ['private', 'minibus', '4x4'],
    itinerary: [
      day('Arrivée à Tunis', 'Arrival in Tunis', 'Ankunft in Tunis',
        'Accueil, médina et dîner.', 'Welcome, medina and dinner.', 'Empfang, Medina und Abendessen.'),
      day('Kairouan → camp de la steppe', 'Kairouan → steppe camp', 'Kairouan → Steppen-Camp',
        'Visite de Kairouan, nuit en camp glamping sous les étoiles.',
        'Visit Kairouan, night in a glamping camp under the stars.',
        'Besuch von Kairouan, Nacht im Glamping-Camp unter Sternen.'),
      day('☀️ Éclipse dans la steppe', '☀️ Eclipse in the steppe', '☀️ Finsternis in der Steppe',
        'Horizon à 360°, ombre de la Lune sur la plaine.', '360° horizon, the Moon’s shadow sweeping the plain.', '360°-Horizont, Mondschatten über der Ebene.', true),
      day('Route vers Tozeur', 'Drive to Tozeur', 'Fahrt nach Tozeur',
        'Via Gafsa, arrivée dans la palmeraie.', 'Via Gafsa, arrival in the palm grove.', 'Über Gafsa, Ankunft im Palmenhain.'),
      day('Oasis de montagne', 'Mountain oases', 'Bergoasen',
        'Chebika, Tamerza et Mides en 4x4 ou minibus.', 'Chebika, Tamerza and Mides by 4x4 or minibus.', 'Chebika, Tamerza und Mides per 4x4 oder Minibus.'),
      day('Départ', 'Departure', 'Abreise',
        'Vol depuis Tozeur ou retour vers Tunis.', 'Flight from Tozeur or drive back to Tunis.', 'Flug ab Tozeur oder Rückfahrt nach Tunis.'),
    ],
  },
  {
    id: 'explore-slow-islands',
    pace: 'slow',
    eclipseSpotId: 'kerkennah',
    title: L('Îles lentes : Kerkennah & Djerba', 'Slow Islands: Kerkennah & Djerba', 'Langsame Inseln: Kerkennah & Djerba'),
    days: 8,
    eclipseDay: 4,
    priceFromTND: 2150,
    stops: ['Kerkennah', 'Djerba'],
    firstStop: { name: 'Sfax (ferry)', lat: 34.739, lng: 10.76 },
    ferry: true,
    transportOptions: ['private', 'minibus'],
    itinerary: [
      day('Arrivée → ferry pour Kerkennah', 'Arrival → ferry to Kerkennah', 'Ankunft → Fähre nach Kerkennah',
        'Transfert à Sfax et traversée vers l’archipel.', 'Transfer to Sfax and ferry to the archipelago.', 'Transfer nach Sfax und Überfahrt zum Archipel.'),
      day('Kerkennah libre', 'Free day on Kerkennah', 'Freier Tag auf Kerkennah',
        'Vélo, plage, villages de pêcheurs.', 'Cycling, beach, fishing villages.', 'Radfahren, Strand, Fischerdörfer.'),
      day('Sortie en mer', 'Boat trip', 'Bootsausflug',
        'Pêche traditionnelle à la charfia et déjeuner de poisson. Briefing éclipse.',
        'Traditional charfia fishing and fish lunch. Eclipse briefing.',
        'Traditionelle Charfia-Fischerei und Fischessen. Finsternis-Briefing.'),
      day('☀️ Éclipse sur l’île', '☀️ Eclipse on the island', '☀️ Finsternis auf der Insel',
        'Totalité face à la mer, loin de la foule.', 'Totality facing the sea, far from the crowds.', 'Totalität mit Meerblick, fernab der Massen.', true),
      day('Kerkennah → Djerba', 'Kerkennah → Djerba', 'Kerkennah → Djerba',
        'Ferry puis route vers Djerba.', 'Ferry, then drive to Djerba.', 'Fähre, dann Fahrt nach Djerba.'),
      day('Djerba libre', 'Free day in Djerba', 'Freier Tag auf Djerba',
        'Plage et farniente.', 'Beach and relaxation.', 'Strand und Erholung.'),
      day('Erriadh & Houmt Souk', 'Erriadh & Houmt Souk', 'Erriadh & Houmt Souk',
        'Street art de Djerbahood et souks.', 'Djerbahood street art and souks.', 'Street Art von Djerbahood und Souks.'),
      day('Départ', 'Departure', 'Abreise',
        'Transfert vers l’aéroport de Djerba.', 'Transfer to Djerba airport.', 'Transfer zum Flughafen Djerba.'),
    ],
  },
  {
    id: 'explore-slow-oasis',
    pace: 'slow',
    eclipseSpotId: 'djerba-houmt-souk',
    title: L('Djerba & Oasis du désert', 'Djerba & Desert Oases', 'Djerba & Wüstenoasen'),
    days: 8,
    eclipseDay: 4,
    priceFromTND: 2240,
    stops: ['Djerba', 'Tozeur'],
    firstStop: { name: 'Djerba', lat: 33.876, lng: 10.857 },
    transportOptions: ['private', 'minibus', '4x4'],
    itinerary: [
      day('Arrivée à Djerba', 'Arrival in Djerba', 'Ankunft auf Djerba',
        'Accueil et installation.', 'Welcome and check-in.', 'Empfang und Check-in.'),
      day('Djerba libre', 'Free day in Djerba', 'Freier Tag auf Djerba',
        'Plage et piscine.', 'Beach and pool.', 'Strand und Pool.'),
      day('Veille de l’éclipse', 'Eclipse eve', 'Vorabend der Finsternis',
        'Conférence d’astronomie et remise des lunettes.', 'Astronomy talk and glasses handed out.', 'Astronomie-Vortrag und Ausgabe der Brillen.'),
      day('☀️ Éclipse à Houmt Souk', '☀️ Eclipse in Houmt Souk', '☀️ Finsternis in Houmt Souk',
        'Totalité près du fort Ghazi Mustapha.', 'Totality near Ghazi Mustapha fort.', 'Totalität nahe dem Fort Ghazi Mustapha.', true),
      day('Djerba → Tozeur', 'Djerba → Tozeur', 'Djerba → Tozeur',
        'Via Matmata et le Chott el Jerid.', 'Via Matmata and Chott el Jerid.', 'Über Matmata und den Chott el Jerid.'),
      day('Tozeur libre', 'Free day in Tozeur', 'Freier Tag in Tozeur',
        'Palmeraie, médina en briques.', 'Palm grove, brick medina.', 'Palmenhain, Ziegel-Medina.'),
      day('Oasis de montagne', 'Mountain oases', 'Bergoasen',
        'Chebika et Tamerza.', 'Chebika and Tamerza.', 'Chebika und Tamerza.'),
      day('Départ', 'Departure', 'Abreise',
        'Vol depuis Tozeur ou retour vers Djerba.', 'Flight from Tozeur or drive back to Djerba.', 'Flug ab Tozeur oder Rückfahrt nach Djerba.'),
    ],
  },
].map((t, i) => ({
  sample: true,
  style: 'explore',
  ferry: false,
  transportDays: t.days,
  included: ['accommodation', 'breakfast', 'glasses', 'briefing', 'guide', 'entranceFees'],
  notIncluded: ['flights', 'insurance', 'lunches', 'drinks', 'tips'],
  hue: (i * 57 + 20) % 360,
  ...t,
}));

export const tours = [...calmTours, ...exploreTours];

// Dev-time sanity check: every tour must point to an existing spot.
tours.forEach((t) => {
  if (!spotById[t.eclipseSpotId]) console.warn(`[tours] Unknown eclipseSpotId "${t.eclipseSpotId}" in tour ${t.id}`);
});
