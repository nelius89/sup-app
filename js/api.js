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

// ── Geocoding — Photon (komoot, full-text sobre OSM) ──
// Usa Elasticsearch internamente → "Barceloneta" encuentra "Platja de la Barceloneta"
async function searchSpots(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=es`
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || [])
      .sort((a, b) => {
        const aIsBeach = a.properties?.type === 'beach';
        const bIsBeach = b.properties?.type === 'beach';
        return (bIsBeach ? 1 : 0) - (aIsBeach ? 1 : 0);
      })
      .map(f => {
        const p = f.properties || {};
        const name = p.name || '';
        const city = p.city || p.town || p.village || p.county || '';
        const country = p.country || '';
        return {
          name,
          location: [city, country].filter(Boolean).join(', '),
          city,
          latitude:  f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        };
      });
  } catch {
    return [];
  }
}

// ── Franjas horarias (v2.1: 4 franjas) ──
const FRANJAS = [
  { id: 'amanecer', label: 'Amanecer', hours: [6, 7, 8],                                range: '6:00 – 9:00'  },
  { id: 'dia',      label: 'Día',      hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],      range: '9:00 – 18:00' },
  { id: 'tarde',    label: 'Tarde',    hours: [18, 19, 20],                              range: '18:00 – 21:00'},
  { id: 'noche',    label: 'Noche',    hours: [21, 22, 23],                              range: '21:00 – 0:00' },
];

// Devuelve el índice del slider (0..34) dado día (0-6) y franja (0-4)
function sliderIndex(day, franja) {
  return day * FRANJAS.length + franja;
}

// Franja activa según hora actual
function getCurrentFranjaIndex() {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return 0; // amanecer
  if (h >= 9  && h < 18) return 1; // día
  if (h >= 18 && h < 21) return 2; // tarde
  return 3;                         // noche
}

// Etiqueta legible del slider
function sliderLabel(index) {
  const day    = Math.floor(index / FRANJAS.length);
  const franja = index % FRANJAS.length;
  const dayLabel = dayLabelFromOffset(day);
  return `${dayLabel} · ${FRANJAS[franja].label}`;
}

function dayLabelFromOffset(offset) {
  if (offset === 0) return 'Hoy';
  if (offset === 1) return 'Mañana';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Extrae los datos promediados de una franja
function getDataForSlider(index, marine, forecast) {
  const day    = Math.floor(index / FRANJAS.length);
  const franja = FRANJAS[index % FRANJAS.length];

  // Los arrays de Open-Meteo tienen 24 entradas por día
  const hourIndices = franja.hours.map(h => day * 24 + h);

  function avg(arr) {
    const vals = hourIndices.map(i => arr[i]).filter(v => v != null);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const h = forecast.hourly;
  const m = marine.hourly;

  const windKmh   = avg(h.wind_speed_10m);
  const gustKmh   = avg(h.wind_gusts_10m);
  const windDir   = avg(h.wind_direction_10m);
  const waveH     = avg(m.wave_height);
  const wavePer   = avg(m.wave_period);
  const waveDir   = m.wave_direction   ? avg(m.wave_direction)   : null;
  const swellH    = m.swell_wave_height ? avg(m.swell_wave_height) : 0;
  const windWaveH = m.wind_wave_height  ? avg(m.wind_wave_height)  : 0;
  const cloudPct  = avg(h.cloudcover);
  // weathercode: usar el máximo del periodo (más pesimista)
  const weathercode = Math.max(...hourIndices.map(i => h.weathercode[i] || 0));

  const precipPct = h.precipitation_probability
    ? Math.round(Math.max(...hourIndices.map(i => h.precipitation_probability[i] || 0)))
    : 0;

  return {
    windKn:      kmhToKnots(windKmh),
    windKmh:     Math.round(windKmh),
    gustKn:      kmhToKnots(gustKmh),
    gustKmh:     Math.round(gustKmh),
    windDir,
    waveH,
    wavePer,
    waveDir,
    swellH,
    windWaveH,
    cloudPct,
    weathercode,
    tempC:       h.temperature_2m ? avg(h.temperature_2m) : 0,
    precipPct,
  };
}
