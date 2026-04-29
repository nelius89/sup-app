// ─────────────────────────────────────────
// STORAGE — localStorage management
// ─────────────────────────────────────────

const STORAGE_KEY = 'sup-app';

function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { spots: [], activeSpotId: null, cache: {} };
  } catch {
    return { spots: [], activeSpotId: null, cache: {} };
  }
}

function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getAllSpots() {
  return getStorage().spots;
}

function addUserSpot(spot) {
  const data = getStorage();
  if (data.spots.length >= 4) return false;
  data.spots.push(spot);
  saveStorage(data);
  return true;
}

function removeUserSpot(id) {
  const data = getStorage();
  data.spots = data.spots.filter(s => s.id !== id);
  if (data.activeSpotId === id) data.activeSpotId = null;
  saveStorage(data);
}

function setActiveSpot(id) {
  const data = getStorage();
  data.activeSpotId = id;
  saveStorage(data);
}

function getActiveSpotId() {
  return getStorage().activeSpotId;
}

// Cache — guarda la respuesta de la API con timestamp
function getCachedData(spotId) {
  const { cache } = getStorage();
  const entry = cache[spotId];
  if (!entry) return null;
  const ageMinutes = (Date.now() - entry.timestamp) / 60000;
  if (ageMinutes > 60) return null; // TTL: 60 min
  // Invalidar caché sin temperature_2m (campo añadido en v2)
  if (!entry.forecast?.hourly?.temperature_2m) return null;
  return entry;
}

function setCachedData(spotId, marine, forecast) {
  const data = getStorage();
  if (!data.cache) data.cache = {};
  data.cache[spotId] = { timestamp: Date.now(), marine, forecast };
  saveStorage(data);
}
