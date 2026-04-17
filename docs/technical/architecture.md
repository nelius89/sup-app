# Arquitectura técnica — Coco

_Última actualización: 2026-04-17_

---

## Stack actual

| Capa | Tecnología | Decisión |
|------|-----------|----------|
| Frontend | HTML + CSS + JavaScript (vanilla) | Sin framework — simplicidad máxima |
| Fuente de verdad | `localStorage` | Sin backend propio en v1 |
| APIs externas | Open-Meteo, Nominatim | Gratuitas, directas desde el cliente |
| Hosting | Cloudflare Pages | Gratis, CDN global, deploy automático desde git |
| Repositorio | GitHub (`nelius89/sup-app`) | Ramas: `main` (producción), `dev` (staging) |
| Analytics | Cloudflare Web Analytics | Gratis, GDPR, zero setup |
| Dominio actual | `sup-app.pages.dev` | Cambiar a dominio propio cuando proceda |

---

## Arquitectura v1

```
[Usuario — móvil/web]
       ↓ HTTPS
[Cloudflare Pages — archivos estáticos]
   index.html
   css/styles.css
   js/app.js, score.js, api.js, storage.js, wheel.js
       ↓ fetch() desde el cliente
[Open-Meteo API] — datos de mar y meteorología
[Nominatim API]  — búsqueda geocoding
       ↓
[localStorage]   — spots, caché de datos, spot activo
```

Sin backend propio. Sin base de datos. Sin servidor.

---

## Estructura de archivos del proyecto

```
App-padel/
├── index.html              — estructura HTML, vistas, bottom sheet terral
├── css/
│   └── styles.css          — todos los estilos
├── js/
│   ├── app.js              — lógica principal, navegación, renderizado
│   ├── score.js            — algoritmo de score, etiquetas, ESTADOS
│   ├── api.js              — llamadas a Open-Meteo, franjas horarias
│   ├── storage.js          — localStorage, spots, caché
│   └── wheel.js            — SlideSwiper (carrusel de métricas)
├── assets/
│   └── illustrations/      — imágenes de estados (Perfecto.png, Bueno.png...)
└── docs/                   — documentación del proyecto (esta carpeta)
```

---

## Arquitectura v2 — Con Cloudflare Worker proxy

```
[Usuario — móvil/web]
       ↓ HTTPS
[Cloudflare Pages]
       ↓ fetch() al Worker (en lugar de Open-Meteo directamente)
[Cloudflare Worker — coco-proxy]
       ↓ check cache
[Cloudflare KV — marine-cache]  ← HIT: respuesta en <10ms
       ↓ cache miss
[Open-Meteo API]                ← solo 1 llamada/hora por spot
```

Ver implementación completa en `technical/api-dependencies.md`.

---

## Arquitectura v3 — Con login y cloud

```
[Usuario — app nativa (Capacitor)]
       ↓
[Cloudflare Worker proxy]
       ↓
[Supabase]
   auth.users          — cuentas de usuario
   user_spots          — spots por usuario (sync)
   spot_cache          — caché compartida en servidor
       ↓
[Open-Meteo API]
```

---

## Decisiones técnicas y justificaciones

| Decisión | Alternativas consideradas | Por qué se eligió |
|----------|--------------------------|-------------------|
| Vanilla JS, sin framework | React, Vue, Svelte | Cero dependencias, máxima velocidad de carga, sin build step |
| localStorage | IndexedDB, cookie | Suficiente para v1, simple, sin setup |
| Cloudflare Pages | Vercel, Netlify | Integración con futuro Worker proxy, free tier generoso |
| Open-Meteo | Storm Glass, Windy API | Gratuito, buenos datos para uso no comercial, datos globales |
| Sin geolocalización | Con GPS | Menos fricción (sin popup de permisos), suficiente para MVP |
| Sin login en v1 | Con auth desde el inicio | Reducir fricción de entrada, validar antes de complicar |

---

## Deuda técnica conocida

1. **Sin tests** — no hay tests automatizados. El algoritmo de score en particular debería tener tests unitarios.
2. **Sin error boundaries** — si una llamada a API falla de forma inesperada, el usuario puede ver una pantalla rota.
3. **Sin tipo de datos** — el JS es vanilla sin TypeScript. Propenso a errores de tipo silenciosos.
4. **Caché solo en cliente** — si el usuario cierra y abre la app, la caché se mantiene. Pero si borra datos del navegador, se pierde.
