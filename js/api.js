// ─────────────────────────────────────────
// API — Open-Meteo
// ─────────────────────────────────────────

const FORECAST_DAYS = 7;

async function fetchSpotData(spot) {
  const cached = getCachedData(spot.id);
  if (cached) return cached;

  const params = `latitude=${spot.lat}&longitude=${spot.lon}&timezone=Europe/Madrid&forecast_days=${FORECAST_DAYS}`;

  const [marineRes, forecastRes] = await Promise.all([
    fetch(`https://marine-api.open-meteo.com/v1/marine?${params}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,wind_wave_height,wind_wave_period`),
    fetch(`https://api.open-meteo.com/v1/forecast?${params}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,weathercode,cloudcover,temperature_2m,precipitation_probability`)
  ]);

  if (!marineRes.ok || !forecastRes.ok) throw new Error('Error al obtener datos del mar');

  const marine   = await marineRes.json();
  const forecast = await forecastRes.json();

  setCachedData(spot.id, marine, forecast);
  return { marine, forecast };
}

// ── Geocoding — Nominatim (OpenStreetMap) ──
async function searchSpots(query) {
  if (!query || query.length < 2) return [];

  const BEACH_WORDS = ['playa', 'platja', 'plage', 'beach', 'praia', 'cala'];
  const queryLower = query.toLowerCase();
  const hasBeachWord = BEACH_WORDS.some(p => queryLower.includes(p));

  async function nominatim(q, { limit = 8, countrycodes = '' } = {}) {
    try {
      const cc = countrycodes ? `&countrycodes=${countrycodes}` : '';
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1&accept-language=es${cc}`,
        { headers: { 'User-Agent': 'Cocodrift App (sup-app.pages.dev)' } }
      );
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  try {
    // Request 1: query principal
    const mainResults = await nominatim(query, { limit: 8 });

    // Request 2: solo si la query no incluye palabra de playa y el resultado principal no tiene playas
    // Usa "platja" + countrycodes=es para encontrar playas españolas sin interferir con resultados globales
    const mainHasBeach = mainResults.some(r => r.type === 'beach');
    let beachResults = [];
    if (!hasBeachWord && !mainHasBeach && query.length >= 4) {
      beachResults = await nominatim(`platja ${query}`, { limit: 5, countrycodes: 'es' });
    }

    const beachOnly = beachResults.filter(r => r.type === 'beach');
    const seen = new Set();

    return [...mainResults, ...beachOnly]
      .sort((a, b) => {
        const aIsBeach = a.type === 'beach';
        const bIsBeach = b.type === 'beach';
        if (aIsBeach !== bIsBeach) return (bIsBeach ? 1 : 0) - (aIsBeach ? 1 : 0);
        return (b.importance || 0) - (a.importance || 0);
      })
      .filter(r => {
        if (seen.has(r.osm_id)) return false;
        seen.add(r.osm_id);
        return true;
      })
      .slice(0, 8)
      .map(r => {
        const addr = r.address || {};
        const name = addr.beach || addr.bay || r.display_name.split(',')[0].trim();
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const country = addr.country || '';
        return { name, location: [city, country].filter(Boolean).join(', '), city,
                 latitude: parseFloat(r.lat), longitude: parseFloat(r.lon) };
      });
  } catch {
    return [];
  }
}

// ── Timeline horaria (v2.2) ──
const TIMELINE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23]; // 8 slots por día, cada ~3h
const SLOTS_PER_DAY  = TIMELINE_HOURS.length;
const TOTAL_SLOTS    = FORECAST_DAYS * SLOTS_PER_DAY; // 56

function getDayForSlot(slotIndex) {
  return Math.floor(slotIndex / SLOTS_PER_DAY);
}

function getHourForSlot(slotIndex) {
  return TIMELINE_HOURS[slotIndex % SLOTS_PER_DAY];
}

// Slot activo más cercano a la hora actual (en día 0)
function getCurrentSlotIndex() {
  const h = new Date().getHours();
  let closest = 0, minDiff = Infinity;
  TIMELINE_HOURS.forEach((th, i) => {
    const diff = Math.abs(th - h);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

// Etiqueta legible del slot
function slotLabel(slotIndex) {
  const day  = getDayForSlot(slotIndex);
  const hour = getHourForSlot(slotIndex);
  return `${dayLabelFromOffset(day)} · ${String(hour).padStart(2, '0')}:00`;
}

function dayLabelFromOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Extrae los datos de un slot horario exacto (sin promediar)
function getDataForHour(slotIndex, marine, forecast) {
  const day  = getDayForSlot(slotIndex);
  const hour = getHourForSlot(slotIndex);
  const i    = day * 24 + hour;

  const h = forecast.hourly;
  const m = marine.hourly;

  return {
    windKn:      kmhToKnots(h.wind_speed_10m?.[i]         || 0),
    windKmh:     Math.round(h.wind_speed_10m?.[i]         || 0),
    gustKn:      kmhToKnots(h.wind_gusts_10m?.[i]         || 0),
    gustKmh:     Math.round(h.wind_gusts_10m?.[i]         || 0),
    windDir:     h.wind_direction_10m?.[i]                || 0,
    waveH:       m.wave_height?.[i]                       || 0,
    wavePer:     m.wave_period?.[i]                       || 0,
    waveDir:     m.wave_direction?.[i]                    ?? null,
    swellH:      m.swell_wave_height?.[i]                 || 0,
    windWaveH:   m.wind_wave_height?.[i]                  || 0,
    cloudPct:    h.cloudcover?.[i]                        || 0,
    weathercode: h.weathercode?.[i]                       || 0,
    tempC:       h.temperature_2m?.[i]                    || 0,
    precipPct:   h.precipitation_probability?.[i]         || 0,
  };
}
