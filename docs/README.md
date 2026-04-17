# Coco — Documentación del proyecto

> App que interpreta datos del mar para hacerlos comprensibles y accionables.
> "¿Salgo o no salgo al agua hoy?"

**Estado actual:** MVP web casi terminado. En fase 0 — definición y documentación.
**Última actualización:** 2026-04-17

---

## Cómo usar esta documentación

Cada carpeta cubre un área del proyecto. Este README es el índice central.
El punto de entrada para trabajar es siempre **la fase actual** (ver mapa abajo).

Convenciones:
- `✍️ Escribir` — documento pendiente de crear/rellenar
- `🔨 Implementar` — acción técnica a ejecutar en esa fase
- `✅ Hecho` — completado
- `⚠️ Crítico` — bloquea el avance si no está resuelto

---

## Mapa de fases → documentos

### FASE 0 — Definición (AHORA)
_Objetivo: cerrar todas las decisiones clave antes de publicar nada._

| Área | Documento | Estado | Qué hacer |
|------|-----------|--------|-----------|
| Estrategia | `strategy/product-vision.md` | ✍️ | Escribir visión, problema, solución en 1 página |
| Estrategia | `strategy/risks.md` | ✅ | Revisar y priorizar |
| Técnico | `technical/api-dependencies.md` | ✅ | Leer análisis Open-Meteo. Decidir cuándo hacer el Worker |
| Técnico | `technical/web-to-native.md` | ✅ | Leer plan PWA → Capacitor |
| Técnico | `technical/storage.md` | ✅ | Revisar decisiones localStorage |
| Legal | `legal/disclaimers.md` | ⚠️ | Redactar disclaimer de seguridad ANTES de publicar |
| Legal | `legal/privacy-policy-draft.md` | ⚠️ | Tener borrador antes de cualquier publicación |
| Legal | `legal/terms-draft.md` | ⚠️ | Idem |
| Legal | `legal/api-usage.md` | ✅ | Revisar condiciones Open-Meteo y Nominatim |
| Analytics | `analytics/tools.md` | ✅ | Activar Cloudflare Web Analytics hoy (gratis, 0 setup) |
| UX/UI | `ux-ui/naming-brand.md` | ✅ | Nombre: Coco. Mascota: cocodrilo. Leer decisiones |
| Producto | `product/features.md` | ✍️ | Inventariar features actuales y planear v2/v3 |

---

### FASE 1 — MVP publicado (web + PWA)
_Objetivo: usuarios reales usando la app._

| Área | Documento | Estado | Qué hacer |
|------|-----------|--------|-----------|
| Técnico | `technical/web-to-native.md` | — | Implementar PWA (manifest + service worker) |
| Técnico | `technical/api-dependencies.md` | — | Implementar Cloudflare Worker proxy (si hay tracción) |
| Analytics | `analytics/tools.md` | — | Cloudflare Analytics ya activo. Revisar métricas tras 2 semanas |
| Analytics | `analytics/metrics.md` | ✍️ | Definir qué métricas importan y empezar a leerlas |
| Legal | `legal/disclaimers.md` | — | Disclaimer visible en la app antes de publicar |
| Legal | `legal/privacy-policy-draft.md` | — | Publicada en URL accesible |
| Launch | `launch/launch-plan.md` | ✍️ | Definir cómo y dónde lanzar la versión web/PWA |

---

### FASE 2 — Apps nativas (stores)
_Objetivo: App Store + Google Play._

| Área | Documento | Estado | Qué hacer |
|------|-----------|--------|-----------|
| Técnico | `technical/web-to-native.md` | — | Implementar Capacitor wrapper |
| Launch | `launch/app-store-checklist.md` | ✅ | Seguir checklist completo |
| Launch | `launch/google-play-checklist.md` | ✅ | Seguir checklist completo |
| UX/UI | `ux-ui/design-principles.md` | ✍️ | Revisar diseño para formato nativo (touch targets, etc.) |
| Legal | — | — | Privacy policy + ToS publicadas y enlazadas en stores |

---

### FASE 3 — Login + Features premium
_Objetivo: monetización y retención._

| Área | Documento | Estado | Qué hacer |
|------|-----------|--------|-----------|
| Producto | `product/features.md` | — | Definir qué es free vs premium |
| Monetización | `monetization/models.md` | ✅ | Leer análisis. Elegir modelo |
| Monetización | `monetization/premium-features.md` | ✅ | Revisar candidatos premium |
| Monetización | `monetization/timing.md` | ✅ | Revisar cuándo introducir cada pieza |
| Técnico | — | — | Login: magic link o social. RevenueCat para pagos in-app |
| Analytics | `analytics/gdpr.md` | ✅ | Revisar implicaciones al añadir identidad de usuario |

---

### FASE 4 — Escalado
_Objetivo: otros deportes, otras geografías, posible B2B._

| Área | Documento | Estado | Qué hacer |
|------|-----------|--------|-----------|
| Técnico | `technical/scalability.md` | ✅ | Revisar límites y cuándo actuar |
| Técnico | `technical/api-dependencies.md` | — | Evaluar Open-Meteo commercial o API alternativa |
| Estrategia | `strategy/competitive-analysis.md` | ✍️ | Actualizar con lo aprendido |
| Growth | `growth/channels.md` | ✅ | Activar canales según tracción |

---

## Estructura de carpetas

```
docs/
├── README.md                    ← este archivo (índice central)
├── strategy/
│   ├── product-vision.md        ← qué es, para quién, por qué
│   ├── value-proposition.md     ← diferencial real
│   ├── roadmap.md               ← fases, timeline, dependencias
│   ├── risks.md                 ← riesgos ordenados
│   └── competitive-analysis.md  ← mapa del mercado
├── product/
│   ├── features.md              ← inventario por fase
│   ├── score-logic.md           ← algoritmo de interpretación
│   └── backlog.md               ← pendiente priorizado
├── technical/
│   ├── architecture.md          ← stack, decisiones, justificaciones
│   ├── api-dependencies.md      ← Open-Meteo, Nominatim, Worker proxy
│   ├── storage.md               ← local vs cloud, decisiones
│   ├── web-to-native.md         ← PWA → Capacitor → stores
│   └── scalability.md           ← cuándo rompe qué
├── analytics/
│   ├── tools.md                 ← Cloudflare Analytics (gratis), opciones
│   ├── metrics.md               ← qué medir y por qué
│   └── gdpr.md                  ← qué se puede trackear legalmente
├── legal/
│   ├── disclaimers.md           ← disclaimer seguridad (CRÍTICO)
│   ├── privacy-policy-draft.md  ← borrador política de privacidad
│   ├── terms-draft.md           ← borrador términos de servicio
│   └── api-usage.md             ← condiciones de APIs externas
├── monetization/
│   ├── models.md                ← análisis de modelos posibles
│   ├── premium-features.md      ← candidatos a premium
│   └── timing.md                ← cuándo introducir qué
├── ux-ui/
│   ├── design-principles.md     ← principios no negociables
│   └── naming-brand.md          ← nombre Coco, mascota, decisiones
├── launch/
│   ├── app-store-checklist.md   ← checklist completo Apple
│   ├── google-play-checklist.md ← checklist completo Google
│   └── launch-plan.md           ← estrategia de lanzamiento
└── growth/
    └── channels.md              ← canales de adquisición por fase
```

---

## Decisiones ya tomadas

| Decisión | Opción elegida | Fecha |
|----------|---------------|-------|
| Nombre | Coco | 2026-04-17 |
| Mascota | Cocodrilo surfero (reencuadrado, no limitado a SUP) | 2026-04-17 |
| Tono | Friendly, cercano, colorido. No premium/tecnológico | 2026-04-17 |
| Web → Native | PWA primero, Capacitor después. No reescribir | 2026-04-17 |
| Analytics | Cloudflare Web Analytics (gratis). PostHog/Umami cuando escale | 2026-04-17 |
| Login | No en v1. Opcional en v3 | 2026-04-17 |
| Storage | localStorage en v1. Migrar a cloud con login en v3 | 2026-04-17 |
| API | Open-Meteo free. Cloudflare Worker proxy cuando haya tracción | 2026-04-17 |

---

## Preguntas abiertas

- [ ] ¿Cuándo activar el Cloudflare Worker proxy? (antes de stores o después)
- [ ] ¿Qué features serán premium en v3?
- [ ] ¿Login: magic link, Google, Apple o los tres?
- [ ] ¿Escuelas de surf/kayak como canal B2B en fase 4?
- [ ] ¿Validar el algoritmo de score con usuarios reales de paddle surf?
