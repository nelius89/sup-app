# Features — Inventario por fase

_Última actualización: 2026-04-17_

---

## V1 (actual — casi terminada)

### Core
- [x] Diagnóstico principal: estado del mar con título + descripción en lenguaje natural
- [x] Ilustraciones por estado (Perfecto, Bueno; resto pendiente)
- [x] Métricas detalladas: temperatura, viento, ola, rachas, período, dirección
- [x] Resumen de texto (slide 2)
- [x] Aviso de terral con bottom sheet explicativo
- [x] Previsión 7 días con navegación por días
- [x] Franjas horarias (7 franjas por día)
- [x] 2 spots hardcoded: Pont del Petroli (Badalona) y Platja del Llevant (Barcelona)
- [x] Añadir spots propios (búsqueda por geocoding)
- [x] Máximo 10 spots (8 usuario + 2 hardcoded)
- [x] Caché de API (60 min TTL)
- [x] Diseño responsive mobile-first

### Pendiente para cerrar V1
- [ ] Ilustraciones para estados Aceptable, Complicado, No salir
- [ ] Pantalla "Acerca de" con disclaimer y atribuciones
- [ ] PWA: manifest.json + service worker
- [ ] Cloudflare Web Analytics activado
- [ ] Renombrar a Coco (title, metadatos, icono)

---

## V2 (post-lanzamiento stores)

_Definir prioridades según feedback de usuarios_

- [ ] Ilustraciones completas para todos los estados
- [ ] Mejoras UX según feedback
- [ ] Deportes: parámetros ajustados para surf (ola más relevante que viento)
- [ ] Geolocalización opcional (sugerir spot más cercano)
- [ ] Compartir condiciones (screenshot generado o link)

---

## V3 (login + premium)

- [ ] Login opcional (magic link o Google/Apple)
- [ ] Sync de spots entre dispositivos
- [ ] Alertas de condiciones
- [ ] Previsión extendida (14 días)
- [ ] Widget de pantalla de inicio (iOS/Android)
- [ ] Historial de condiciones (últimos 7 días)

---

## Backlog / ideas sin priorizar

- Modo oscuro
- Notificación "esta tarde está bien para salir"
- Comparativa de spots cercanos
- Calendario de la semana (vista semanal)
- Integración con calendario del móvil
- B2B: dashboard para escuelas
- Spots comunitarios (usuarios comparten spots buenos)
