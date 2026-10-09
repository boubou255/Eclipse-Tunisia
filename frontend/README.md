# Vibes Trip – Total Solar Eclipse Tunisia 2027 (front-end)

Landing page + 7-step booking flow for the total solar eclipse of **Monday 2 August 2027** in Tunisia.
React 18 + Vite + Tailwind CSS + Leaflet/OpenStreetMap. FR (default) / EN / DE.

> ⚠️ Tours, accommodation names and prices are **sample data**. The path of totality in
> `public/totality-path.geojson` is a **hand-drawn placeholder**. Replace it with official NASA data before launch.

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in frontend/dist
npm run preview    # serve the build locally
```

Node 18+ is required.

## Project structure

```
frontend/
├─ public/
│  └─ totality-path.geojson      ← PLACEHOLDER path of totality (replace with NASA data)
├─ src/
│  ├─ api/client.js              ← the ONLY place that knows where data comes from (local or Laravel)
│  ├─ data/                      ← editable data files (sample data)
│  │  ├─ spots.js                  16 viewing spots + 5 "partial only" cities
│  │  ├─ tours.js                  "Stay calm" tours (2–3 per spot) + "Explore" circuits (2 per pace)
│  │  ├─ accommodations.js         placeholder accommodations per spot (types/levels/supplements)
│  │  ├─ startCities.js            DJE, TUN, NBE, MIR, SFA + "already in Tunisia"
│  │  ├─ pricing.js                room types, transport, child policy, transfer rates, EUR rate
│  │  └─ site.js                   WhatsApp numbers, countdown target, partial-phase times
│  ├─ i18n/
│  │  ├─ translations.js           ALL UI texts (fr / en / de)
│  │  └─ I18nContext.jsx           t('key', vars) and tx({fr,en,de})
│  ├─ state/
│  │  ├─ BookingContext.jsx        booking state (useReducer) + localStorage (try/catch)
│  │  ├─ DataContext.jsx           loads all data once through api/client.js
│  │  ├─ useSelection.js           resolves ids → objects + live price quote
│  │  ├─ useFlow.js                next / back / goto (pace step only for "Explore")
│  │  └─ completion.js             which steps are complete / reachable
│  ├─ lib/
│  │  ├─ pricing.js                price engine + transfer estimate (drive time, km, cost)
│  │  ├─ filterTours.js            filter by style / pace / spot
│  │  ├─ bookingSummary.js         booking JSON payload + WhatsApp text
│  │  ├─ format.js, geo.js, storage.js
│  └─ components/
│     ├─ Header, Footer, ProgressBar, StepLayout, Countdown, PriceSummaryBox, TravelerCounts
│     ├─ map/EclipseMap.jsx        Leaflet map, totality band, coloured markers
│     ├─ map/SpotPanel.jsx         side panel (desktop) / bottom sheet (mobile)
│     ├─ steps/                    Landing, Style, Pace, Spot, Tours, Details, Start, Travelers, Checkout, ThankYou
│     └─ ui/                       ChoiceCard, Counter, PaceBadge, PhotoPlaceholder, Price
```

## The flow

| # | Step | Notes |
|---|------|-------|
| – | Landing | Live countdown to 2 Aug 2027 10:08 (UTC+1), key facts, safety note, CTA |
| 1 | Style | "Stay calm" / "Explore Tunisia" |
| 1b | Pace | Only for "Explore": slow / medium / fast |
| 2 | Spot | Leaflet map, totality band, gold ≥ 5 min / orange 3–5 min / grey < 3 min, grey dashed = partial only (not selectable). Click / Enter on a marker → flyTo zoom 11 + panel. An accessible list sits below the map. |
| 3 | Tours | Filtered by style + pace + spot. Explore: if no circuit of that pace sees the eclipse at the chosen spot, the circuits of that pace are shown sorted by distance, with a notice. |
| 4 | Details | Gallery placeholders, itinerary, eclipse morning plan, included / not included, accommodation (only types available at the spot), room, transport (4x4 only for desert/steppe), travelers. Live price. |
| 5 | Start | Airport or "already in Tunisia" (+ hotel/city). Estimated drive time, km and transfer cost (one way, to the first stop of the trip). |
| 6 | Travelers | Adults / children (with ages), details for each traveler, lead traveler contact + dates (prefilled so the eclipse day is 2 Aug). |
| 7 | Checkout | Full summary + price breakdown, terms checkbox, **Send booking request** (logs the JSON / POSTs to the API) and **Confirm on WhatsApp** (wa.me/21693306933 with the summary). Then the thank-you screen. |

State is saved in `localStorage` (`vibes-eclipse-booking-v1`, wrapped in try/catch) so a reload keeps the selections.

## Pricing (sample model, see `src/data/pricing.js`)

```
paying units = adults + Σ child factor (0–1 y: 0, 2–11 y: 0.5, 12–17 y: 1)
nights       = tour.days − 1
total = tour.priceFromTND × units
      + accommodation.supplementPerNightTND × nights × units
      + roomType.perPersonNightTND × nights × units
      + transport (per person/day or per vehicle/day × tour.transportDays)
      + arrival transfer (base + per km × road km, per vehicle of 7; + ferry for Kerkennah)
EUR = TND / eurRate
```

The front-end price is an **estimate**. Your Laravel API should recompute it server-side.

## Plugging in the Laravel API

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL=https://your-laravel-app.tld`.
2. Implement the endpoints below. They must return **the same shapes as the files in `src/data/`**.
   Nothing in the UI changes: everything goes through `src/api/client.js`.
3. Enable CORS for the front-end origin (`config/cors.php`) if it is served from another domain.

| Method | Endpoint | Returns / expects | Replaces |
|--------|----------|-------------------|----------|
| GET | `/api/spots` | `{ "spots": [...], "partialSpots": [...] }` | `data/spots.js` |
| GET | `/api/tours` | `[ tour, ... ]` (optionally support `?style=&pace=&spot=`) | `data/tours.js` |
| GET | `/api/accommodations` | `[ { id, spotId, type, level, name, supplementPerNightTND }, ... ]` | `data/accommodations.js` |
| GET | `/api/start-cities` | `[ { id, code, name:{fr,en,de}, lat, lng, local? }, ... ]` | `data/startCities.js` |
| GET | `/api/pricing` | `{ eurRate, roomTypes, transportOptions, childPolicy, transfer }` | `data/pricing.js` |
| POST | `/api/bookings` | body = booking JSON below; respond `201 { "reference": "..." }` | `console.log` only |

Localized fields (`name`, `title`, `description`, itinerary `title`/`text`, …) are objects `{ "fr": "...", "en": "...", "de": "..." }`.
A Laravel resource can build them from translatable columns (e.g. `spatie/laravel-translatable`).

Example Laravel routes (`routes/api.php`):

```php
Route::get('/spots', [SpotController::class, 'index']);
Route::get('/tours', [TourController::class, 'index']);
Route::get('/accommodations', [AccommodationController::class, 'index']);
Route::get('/start-cities', [StartCityController::class, 'index']);
Route::get('/pricing', [PricingController::class, 'show']);
Route::post('/bookings', [BookingController::class, 'store']);
```

### Booking request JSON (`POST /api/bookings`)

```json
{
  "reference": "VT27-AB12CD34",
  "createdAt": "2026-10-09T20:00:00.000Z",
  "language": "fr",
  "style": "explore",
  "pace": "fast",
  "eclipseSpot": { "id": "sfax", "name": "Sfax – city & medina", "totalityStart": "10:08:49", "totalityEnd": "10:14:29", "durationSec": 339 },
  "selectedMapSpotId": "sfax",
  "tour": { "id": "explore-fast-classic", "title": "Southern Express: Tunis → Djerba", "days": 5, "sample": true },
  "accommodation": { "id": "sfax-hotel-5", "type": "hotel", "level": "5", "name": "Sample City Hotel 5★" },
  "roomType": "double",
  "transport": "private",
  "startPoint": { "id": "DJE", "code": "DJE" },
  "travelers": {
    "adults": 2,
    "childAges": [6],
    "list": [{ "firstName": "Anna", "lastName": "Muster", "nationality": "German", "dob": "1985-04-12", "kind": "adult" }]
  },
  "lead": { "email": "anna@example.com", "phone": "+49 170 1234567", "arrival": "2027-07-31", "departure": "2027-08-04", "requests": "" },
  "price": { "currency": "TND", "baseTND": 4225, "accTND": 1600, "roomTND": 0, "transportTND": 1200, "transferTND": 382, "totalTND": 7407, "totalEUR": 2179, "eurRate": 3.4, "transferQuotedSeparately": false },
  "termsAccepted": true
}
```

Validate it server-side (ids exist, eclipse date inside the stay, re-price from your own tables), save it, and send the confirmation e-mail / WhatsApp from Laravel.

### Serving the build from Laravel

`vite.config.js` uses `base: './'`, so `npm run build` output can be copied anywhere,
e.g. `public/eclipse/` of the Laravel app (then `totality-path.geojson` is served from the same folder).

## Replacing the totality path

`public/totality-path.geojson` is a rough placeholder band. Download the official 2027-08-02
path limits (NASA GSFC eclipse site, or Xavier Jubier's interactive map → KML/KMZ), convert to GeoJSON
(e.g. with `ogr2ogr -f GeoJSON totality-path.geojson path.kml` or mapshaper.org) and replace the file.
Keep a `Polygon` (or `MultiPolygon`) feature for the band; the map styles it automatically.

## Editing content

- **Texts**: `src/i18n/translations.js` (same keys in `fr`, `en`, `de`).
- **Spots / times**: `src/data/spots.js`.
- **Tours**: `src/data/tours.js` (calm tours are generated from templates; explore circuits are written by hand).
- **Prices & options**: `src/data/pricing.js`, `src/data/accommodations.js`.
- **Contact numbers**: `src/data/site.js`.

## Accessibility notes

Keyboard-reachable everything (map markers are focusable; Enter/Space opens the spot panel, Esc closes it),
a spot list below the map as an alternative to the map, visible focus rings, focus moved to each step title,
live-region announcements for the price, labelled form fields with inline errors, `prefers-reduced-motion` respected.
