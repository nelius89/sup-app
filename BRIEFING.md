# Cocodrift — Briefing del proyecto

> Documento de contexto para IA. Contiene todo lo necesario para retomar el proyecto sin explicaciones previas.
> Última actualización: abril 2026 — v2.2

---

## Qué es Cocodrift

App web progresiva (PWA) que dice si puedes salir al agua hoy. Sin tecnicismos, sin tablas de datos, sin tener que interpretar nada: la app lee las condiciones del mar y te da una respuesta directa en un tono cercano y humano.

**La pregunta que responde:** ¿Salgo al agua hoy?

**El diferencial:** No compite con Windy o Windguru en datos. Compite en claridad. Cualquiera que quiera salir al mar entiende la respuesta, no solo los expertos.

**Mascota:** un cocodrilo con gafas de sol. Los cocodrilos viven en el agua y saben cuándo es segura — esa es la metáfora. El personaje es marca, no decoración.

---

## Visión de crecimiento

**v1 — Paddle surf (SUP).** Es el punto de partida porque es el deporte del creador y permite calibrar bien el sistema de scoring. Pero el sistema ya está diseñado para expandirse.

**Próximas actividades planeadas:**
- Kitesurf / windsurf (requiere viento más específico, rangos invertidos)
- Snorkel y natación en mar abierto (ola y visibilidad)
- Vela ligera (viento y dirección más críticos)
- Surf (período y ola prioritarios, viento secundario)

La arquitectura permite añadir actividades con pesos distintos en el scoring sin reescribir el sistema. Cada actividad tendrá su propia lógica de qué condición es buena o mala.

**Más adelante:** Posible extensión a actividades de montaña (senderismo, escalada) con APIs meteorológicas terrestres. El nombre Cocodrift no limita la propuesta.

---

## Stack técnico

| Pieza | Rol |
|---|---|
| **HTML + CSS + JS vanilla** | Frontend. Sin frameworks. App estática. |
| **GitHub** (`nelius89/cocodrift`) | Repositorio. Push a `main` → deploy automático |
| **Cloudflare Pages** | Hosting + CDN. Rama `main` = producción, `dev` = preview |
| **Open-Meteo API** | Datos meteorológicos y marinos. Gratuito, sin API key, CORS nativo |
| **localStorage** | Persistencia de spots y caché de datos. Sin backend ni login |
| **Service Worker** | PWA offline-first. Strategy: network-first, cache `coco-shell` |
| **Cloudflare Workers** | Worker activo: `coco-suggestions` → recibe sugerencias y las guarda en Notion |
| **Cloudflare Web Analytics** | Analytics de uso. Sin cookies, GDPR-friendly |

### Flujo de deploy
```
git push origin dev   →  preview en dev.sup-app.pages.dev
git push origin main  →  producción en cocodrift.pages.dev
```
(El proyecto en Cloudflare Pages aún se llama `sup-app` — pendiente de renombrar)

### Archivos principales
```
index.html          ← Estructura HTML de todas las vistas y sheets
css/styles.css      ← Todos los estilos (tokens, vistas, componentes)
js/app.js           ← Lógica de navegación, render y eventos
js/score.js         ← Sistema de diagnóstico: estados, avisos, copys, bloques narrativos
js/api.js           ← Llamadas a Open-Meteo, timeline horaria, caché
js/storage.js       ← Gestión de spots en localStorage
sw.js               ← Service Worker (network-first, cache coco-shell)
manifest.json       ← Configuración PWA (v2.2)
```

---

## Fuente de datos: Open-Meteo

### Dos llamadas por consulta

**Marine API** — olas y mar:
```
GET https://marine-api.open-meteo.com/v1/marine
  ?latitude={lat}&longitude={lon}
  &hourly=wave_height,wave_direction,wave_period,
          swell_wave_height,wind_wave_height,wind_wave_period
  &timezone=Europe/Madrid&forecast_days=7
```

**Forecast API** — viento y tiempo:
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,
          weathercode,temperature_2m,cloudcover
  &timezone=Europe/Madrid&forecast_days=7
```

### Caché
Respuesta guardada en localStorage con timestamp. No se vuelve a llamar si han pasado menos de 60 minutos.

### Conversiones
- Viento km/h → nudos: `kn = km/h / 1.852`
- Grados → punto cardinal: función por rangos de 22.5°

---

## Spots

### Hardcodeados (no borrables por el usuario)
```json
[
  { "id": "pont-petroli", "name": "Pont del Petroli", "city": "Badalona",
    "lat": 41.4421, "lon": 2.2385, "offshore_range": [225, 315] },
  { "id": "platja-llevant", "name": "Platja del Llevant", "city": "Barcelona",
    "lat": 41.3934, "lon": 2.2048, "offshore_range": [225, 315] }
]
```

### Spots de usuario
- Añadidos via búsqueda (Nominatim con `countrycodes=es`, búsqueda secuencial con prefijos playa/platja/cala)
- Mismo esquema JSON. Guardados en localStorage. Borrables con tap largo.
- **Límite: 4 spots de usuario.** Si se supera, aparece popup "sardinas" informando del límite.
- Los resultados de búsqueda muestran estrella para marcar favorito antes de guardar.

---

## Sistema de diagnóstico v2 — Reglas directas

El paradigma central: **reglas directas por variable**, no scoring ponderado. Cada variable tiene umbrales absolutos que determinan el estado. No hay compensaciones entre variables.

### Los 5 estados

| Estado | Título visible |
|---|---|
| `piscina` | Se está como en una piscina |
| `muy-agradable` | Está super agradable |
| `se-puede-salir` | Está movidito pero manejable |
| `exigente` | El mar está exigente |
| `no-recomendable` | Hoy mejor en tierra |

### Reglas de estado (en orden de prioridad)

**No recomendable** — cualquiera de estas:
- Tormenta (weathercode ≥ 95)
- windKn > 20 · gustKn > 28 · waveH > 1.5
- wavePer < 3 y waveH > 0.5
- terral nivel 3 y windKn > 8

**Exigente** — cualquiera de estas:
- windKn > 15 · gustKn > 22 · waveH > 1.0
- wavePer < 4 y waveH > 0.3

**Se puede salir** — cualquiera de estas:
- windKn > 10 · gustKn > 16 · variabilidad > 6 · waveH > 0.6
- wavePer < 5
- terral nivel 2 y windKn > 5

**Piscina** — TODAS estas:
- windKn ≤ 6 · gustKn ≤ 10 · variabilidad < 4 · waveH ≤ 0.3 · wavePer ≥ 7 · terral = 0

**Muy agradable** — todo lo que no encaja en los anteriores.

### Regla de acumulación
Si hay ≥ 2 avisos de nivel 3 activos, el estado baja uno en la escala.

---

## Sistema de avisos

Cuatro tipos de aviso, cada uno con 3 niveles. Los de categoría `narrativa` se absorben en los bloques de texto — no generan bloque visual propio.

| Tipo | Niveles | Categorías |
|---|---|---|
| rachas | 1/2/3 | narrativa · a-tener-en-cuenta · alerta |
| variabilidad | 1/2/3 | narrativa · a-tener-en-cuenta · cuidado |
| mar | 1/2/3 | narrativa · a-tener-en-cuenta · cuidado |
| terral | 1/2/3 | a-tener-en-cuenta · cuidado · alerta |

**Variabilidad** = `max(0, gustKn − windKn)`. Variable propia de Cocodrift — no existe en literatura técnica de SUP.

### Aviso terral
El terral (viento de tierra hacia el mar) es un riesgo de seguridad independiente del estado. `offshore_range` para BCN/Badalona: [225, 315] grados. Modificador: +1 nivel si waveH > 0.6 y spot no protegido y windKn ≥ 5.

Las tarjetas de aviso con categoría `cuidado` y `alerta` tienen fondo tintado (ámbar) para diferenciarse visualmente. El terral aparece como pill compacta encima del diagnóstico.

### Alerta consolidada
Cuando el estado es `no-recomendable`, todos los avisos se fusionan en un único párrafo explicativo. El título ya dice todo — esto añade el porqué.

---

## Bloques narrativos

La función `buildBlocks(d, estado)` genera los textos del diagnóstico principal describiendo las condiciones como experiencia, no como datos:

- `encounter-desc` — qué te vas a encontrar
- `demand-desc` — qué te va a pedir
- `fit-title` — para quién encaja

Los avisos de categoría `narrativa` (nivel 1) quedan absorbidos en este copy.

---

## Estructura de pantallas

### Home (fondo azul #314fff)
- Header: botón info circular (izquierda) · botón instalar PWA (derecha, oculto si ya instalada)
- Logo Cocodrift (`Logo.png`, 65% ancho)
- Cocodrilo animado: video loop WebM VP9 con canal alpha (`coco-loop.webm`), solapado sobre el logo
- Lista de spots: pills con nombre. Tap → pantalla Resultados. Tap largo → modo borrar (badge ✕)
- Límite 4 spots de usuario. El botón + abre el buscador de playas.
- Sheet "Acerca de": bottom sheet accesible desde el botón info. Incluye versión, descripción, disclaimer y contacto/sugerencias.

### Resultados (fondo beige #f9f6ef)

**Zona azul (fija):**
- Topbar: ← back (izquierda) · estrella favorito (derecha)
- Hero: nombre del spot + fila ciudad con icono pin
- Timeline horaria deslizable: label día fijo encima + slots horarios con snap magneto + bocadillo blanco sólido sobre el slot activo

**Zona beige (scroll):**
- Bocadillo: título del estado (grande) + divider + 3 líneas narrativas (encounter · demand · fit)
- Ilustración del cocodrilo por estado (SVG, debajo del bocadillo)
- Botón "Ver información técnica ↓"
- Tech blocks: tarjetas blancas independientes con datos de Viento, Rachas, Ola, Período. Tarjetas con aviso tienen fondo ámbar tintado.
- Botón "Informar error" al final

---

## Timeline horaria

Reemplaza el sistema anterior de selector día + 4 franjas fijas. Slots horarios deslizables (0h–23h), agrupados en intervalos. Al cargar, el slot activo se alinea a la izquierda automáticamente. Snap magneto al soltar.

Los datos de cada slot son el promedio de los valores horarios dentro de ese bloque.

---

## Ilustraciones (v2.2)

```
assets/illustrations/
  Home/
    Logo.png              ← logotipo Cocodrift
    coco-loop.webm        ← video loop cocodrilo (VP9, alpha, ~1.7MB)
  Resolucion/
    Estados/              ← ilustración por estado en pantalla de resultados
      Piscina.svg
      Muyagradable.svg
      Sepuedesalir.svg
      Exigente.svg
      Norecomendable.svg
    Bloques/              ← iconos para los 3 bloques narrativos
      1 quetevasaencontrar.svg
      2 quetevaapedir.svg
      3 paraquienencaja.svg
  Bueno.svg / Perfecto.svg  ← legado v2.0, no en uso activo
  FR1.png, FR2.png, FR-3.png ← legado v1, no en uso activo
```

Iconos PWA en `assets/icons/`: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.

---

## Sistema visual

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#314fff` | Color principal, fondo Home, zona azul resultados |
| `--beige` | `#f9f6ef` | Fondo Resultados, textos sobre azul |
| `--black` | `#0a0a0a` | Textos |
| `--white` | `#ffffff` | Textos sobre azul |
| `--amber` | unificado | Tarjetas de aviso (cuidado/alerta) |

**Tipografía:** Geist Mono (Google Fonts). Una sola familia, todos los pesos desde ella.

---

## Lo que está fuera de v1

- Notificaciones push
- Historial de sesiones del usuario
- Comparativa de spots en paralelo
- Datos de mareas
- Login / sync entre dispositivos
- Soporte a otras actividades (kite, surf, vela...) — arquitectura preparada, pendiente
- Vista de 7 días — arquitectura pendiente
