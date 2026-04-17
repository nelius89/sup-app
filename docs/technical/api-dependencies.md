# API Dependencies — Coco

_Última actualización: 2026-04-17_

---

## APIs en uso

### 1. Open-Meteo (datos de mar y meteorología)

**URLs:**
- `https://marine-api.open-meteo.com/v1/marine` — altura de ola, dirección, período, swell
- `https://api.open-meteo.com/v1/forecast` — viento, rachas, dirección, temperatura, nubosidad, weathercode

**Datos que se piden:**
- Marine: `wave_height, wave_direction, wave_period, swell_wave_height, wind_wave_height, wind_wave_period`
- Forecast: `wind_speed_10m, wind_gusts_10m, wind_direction_10m, weathercode, cloudcover, temperature_2m`

**Licencia:** Creative Commons Attribution 4.0. Requiere atribución visible en la app.

---

#### Análisis de límites y riesgos

**Tier gratuito:**
- No hay límite publicado oficial
- Política de "fair use" — uso razonable para proyectos no comerciales
- Sin SLA ni garantías de uptime
- Estimación conservadora de fair use: ~10.000 req/día sin problemas

**Tier commercial:**
- ~14€/mes para hasta 10.000 req/día garantizadas con SLA
- Necesario legalmente cuando la app monetiza

**El problema real:**

Sin el Worker proxy, cada dispositivo genera sus propias llamadas.
Cada carga de un spot = 2 req (marine + forecast).

```
100 usuarios activos/día, cache miss 50% = ~100 req/día   → OK
500 usuarios activos/día, cache miss 50% = ~500 req/día   → OK
2.000 usuarios activos/día, cache miss 50% = ~2.000/día   → OK
10.000 usuarios activos/día, cache miss 50% = ~10.000/día → LÍMITE
```

Con el Worker proxy (cache compartido entre todos los usuarios):

```
100 spots distintos × 2 req/hora × 24h = ~4.800 req/día   → OK con cualquier número de usuarios
```

El Worker proxy resuelve el problema de escala de forma elegante.

---

#### Solución: Cloudflare Worker como proxy con KV cache

**Por qué:**
- Cloudflare Workers free: 100.000 req/día gratis
- Cloudflare KV free: 100.000 reads/día, 1.000 writes/día gratis
- 1 usuario o 10.000 usuarios consultando el mismo spot → 1 sola llamada a Open-Meteo/hora
- La app ya está en Cloudflare Pages — coherencia de stack

**Arquitectura:**

```
[App (dispositivo)]
        ↓
[Cloudflare Worker — coco-proxy]
        ↓ (si cache miss)
[Cloudflare KV — marine-cache]     ← cache hit: devuelve en <10ms
        ↓ (si no está en KV)
[Open-Meteo API]                   ← solo cuando hay cache miss
```

**Lógica del Worker:**

```javascript
// workers/coco-proxy/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const spotId = url.searchParams.get('spot_id');

    if (!lat || !lon || !spotId) {
      return new Response('Missing params', { status: 400 });
    }

    // Check cache
    const cacheKey = `spot-${spotId}`;
    const cached = await env.MARINE_CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Fetch from Open-Meteo
    const params = `latitude=${lat}&longitude=${lon}&timezone=Europe/Madrid&forecast_days=7`;
    const [marineRes, forecastRes] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?${params}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,wind_wave_height,wind_wave_period`),
      fetch(`https://api.open-meteo.com/v1/forecast?${params}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,weathercode,cloudcover,temperature_2m`)
    ]);

    if (!marineRes.ok || !forecastRes.ok) {
      return new Response('API error', { status: 502 });
    }

    const data = {
      marine: await marineRes.json(),
      forecast: await forecastRes.json()
    };

    // Cache for 1 hour
    await env.MARINE_CACHE.put(cacheKey, JSON.stringify(data), {
      expirationTtl: 3600
    });

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
```

**Cambio en la app (api.js):**

Reemplazar las llamadas directas a Open-Meteo con llamadas al Worker:
```javascript
// Antes:
fetch(`https://marine-api.open-meteo.com/v1/marine?${params}&...`)
fetch(`https://api.open-meteo.com/v1/forecast?${params}&...`)

// Después:
fetch(`https://coco-proxy.USUARIO.workers.dev?spot_id=${spot.id}&lat=${spot.lat}&lon=${spot.lon}`)
```

Y el Worker devuelve `{ marine, forecast }` directamente — sin cambios en el resto de la lógica.

**Setup:**
1. Crear Worker en Cloudflare Dashboard → Workers → Create Service
2. Crear KV Namespace: `MARINE_CACHE`
3. Bindear KV al Worker
4. Deploy con `wrangler deploy`

**Cuándo implementarlo:**
- Recomendado antes del lanzamiento en stores (Fase 2)
- Opcional pero prudente en Fase 1 si hay crecimiento rápido
- No urgente para las primeras semanas de uso web

---

#### Plan de contingencia si Open-Meteo falla

1. **Primer nivel:** El localStorage actual cachea 60 min. Si Open-Meteo está caído, la app sigue funcionando con datos recientes.
2. **Segundo nivel:** Con el Worker proxy, el KV tiene los datos aunque Open-Meteo esté caído hasta que expiren (1h).
3. **Tercer nivel (futuro):** Fallback a yr.no (Norwegian Met Institute) para datos atmosféricos.
4. **Último recurso:** Mensaje de error claro al usuario ("Datos temporalmente no disponibles").

---

#### Cuándo contratar Open-Meteo commercial

- Cuando la app empiece a monetizar (suscripciones o IAP)
- O cuando el volumen supere ~8.000-9.000 req/día de forma consistente
- Precio: ~14€/mes para hasta 10.000 req/día garantizadas

---

### 2. Nominatim (búsqueda de playas)

**URL:** `https://nominatim.openstreetmap.org/search`
**Uso:** Búsqueda geocoding al añadir una playa nueva

**Condiciones de uso:**
- Máximo 1 req/segundo (hard limit)
- Requiere User-Agent propio identificando la app (ya implementado: `'SUP App (sup-app.pages.dev)'`)
- No permitido para scraping masivo o uso en producción de alto volumen
- Uso no comercial permitido

**Riesgo:** Si hay muchas búsquedas concurrentes, puede bloquear la IP.

**Mitigación:**
- El debounce de 350ms ya implementado en la app ayuda
- En volúmenes altos: usar Photon API (https://photon.komoot.io) como alternativa, también gratuita y basada en OpenStreetMap pero más permisiva

---

## Atribución requerida (legal)

Open-Meteo requiere atribución visible (CC Attribution 4.0).

**Texto mínimo requerido:**
> Datos meteorológicos de Open-Meteo.com

**Dónde ponerlo:**
- En una pantalla "Sobre la app" o "Créditos"
- En el footer de la web
- En la descripción de las stores (recomendado)

Nominatim / OpenStreetMap también requiere atribución si se muestran datos de localización.
