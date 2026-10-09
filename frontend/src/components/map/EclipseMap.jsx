import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { durationTier, formatDuration, TIER_COLORS } from '../../lib/format.js';
import { totalityPathUrl } from '../../api/client.js';

const CENTER = [34.4, 9.8];
const ZOOM = 6;

/**
 * Leaflet + OpenStreetMap map with:
 *  - the path of totality (from /public/totality-path.geojson – PLACEHOLDER, see that file)
 *  - one coloured marker per viewing spot (keyboard focusable, Enter = click)
 *  - grey dashed markers for partial-only cities (not selectable)
 */
export default function EclipseMap({ spots, partialSpots, activeId, selectedId, onSpotClick, flyHomeSignal }) {
  const { t, tx } = useI18n();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const onClickRef = useRef(onSpotClick);
  const [loaded, setLoaded] = useState(false);
  onClickRef.current = onSpotClick;

  // 1) Create the map once
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: ZOOM,
      minZoom: 5,
      maxZoom: 16,
      scrollWheelZoom: false, // avoid hijacking page scroll; use +/- or pinch
      zoomSnap: 0.5,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.whenReady(() => setLoaded(true));
    mapRef.current = map;

    // Path of totality.
    // ⚠️ totality-path.geojson is a PLACEHOLDER polygon – replace it with official NASA path data.
    let pathLayer;
    let cancelled = false;
    fetch(totalityPathUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((geo) => {
        if (cancelled) return;
        pathLayer = L.geoJSON(geo, {
          interactive: false,
          style: { color: '#f5c043', weight: 1.5, dashArray: '6 6', fillColor: '#000000', fillOpacity: 0.45 },
        }).addTo(map);
        pathLayer.bringToBack();
      })
      .catch((err) => console.warn('[map] totality path not loaded', err));

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2) (Re)build markers when data or language changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    const layer = L.layerGroup().addTo(map);
    markersRef.current = {};

    spots.forEach((spot) => {
      const tier = durationTier(spot.durationSec);
      const color = TIER_COLORS[tier];
      const label = `${tx(spot.name)} – ${formatDuration(spot.durationSec, t)}`;
      const marker = L.marker([spot.lat, spot.lng], {
        keyboard: true,
        title: label,
        riseOnHover: true,
        icon: L.divIcon({
          className: `spot-marker tier-${tier}`,
          html: `<span class="dot" style="--color:${color};--glow:${color}88"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      })
        .bindTooltip(label, { className: 'spot-tooltip', direction: 'top', offset: [0, -12] })
        .on('click', () => onClickRef.current?.(spot))
        .addTo(layer);
      const el = marker.getElement();
      if (el) {
        el.setAttribute('aria-label', label);
        // Leaflet makes markers focusable but does not trigger "click" on Enter/Space.
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClickRef.current?.(spot);
          }
        });
      }
      markersRef.current[spot.id] = marker;
    });

    partialSpots.forEach((p) => {
      const label = `${p.name} – ${t('map.partialOnly')} (${p.coverage})`;
      const marker = L.marker([p.lat, p.lng], {
        keyboard: true,
        title: label,
        icon: L.divIcon({ className: 'spot-marker partial', html: '<span class="dot"></span>', iconSize: [14, 14], iconAnchor: [7, 7] }),
      })
        .bindPopup(
          `<strong>${p.name}</strong><br/>${t('map.partialOnly')}<br/><small>${t('map.coverage', { value: p.coverage })}</small>`,
          { closeButton: true },
        )
        .addTo(layer);
      const el = marker.getElement();
      if (el) {
        el.setAttribute('aria-label', label);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            marker.openPopup();
          }
        });
      }
    });

    return () => {
      layer.remove();
    };
  }, [spots, partialSpots, t, tx]);

  // 3) Highlight active / selected marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      el.classList.toggle('is-active', id === activeId || (!activeId && id === selectedId));
    });
  }, [activeId, selectedId, spots, t]);

  // 4) Zoom in on the active spot (marker click or list below the map) and "fly home"
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeId) return;
    const spot = spots.find((s) => s.id === activeId);
    if (spot) map.flyTo([spot.lat, spot.lng], 11, { duration: 1.2 });
  }, [activeId, spots]);

  useEffect(() => {
    if (flyHomeSignal && mapRef.current) mapRef.current.flyTo(CENTER, ZOOM, { duration: 1 });
  }, [flyHomeSignal]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" role="region" aria-label={t('map.title')} />
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-night-900 text-slate-400" aria-live="polite">
          {t('map.loading')}
        </div>
      )}
    </div>
  );
}
