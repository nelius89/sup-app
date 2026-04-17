# Roadmap — Coco

_Última actualización: 2026-04-17_

---

## Fase 0 — Definición (AHORA → 2 semanas)

**Objetivo:** Cerrar todas las decisiones clave antes de publicar. La app casi está — lo que falta es documentar, decidir y preparar el terreno.

### Entregables
- [ ] `strategy/product-vision.md` escrito
- [ ] `product/features.md` con inventario actual y v2/v3
- [ ] `legal/disclaimers.md` — disclaimer de seguridad redactado
- [ ] `legal/privacy-policy-draft.md` — borrador completo
- [ ] `legal/terms-draft.md` — borrador completo
- [ ] Cloudflare Web Analytics activado
- [ ] Nombre Coco consolidado (icono, título, metadatos)

### Decisiones clave en esta fase
- Confirmar qué features están en v1 y cuáles se mueven a v2
- Decidir si implementar el Cloudflare Worker proxy ahora o después del lanzamiento
- Validar el algoritmo de score con al menos 3-5 usuarios reales

### Riesgos
- Lanzar sin disclaimer de seguridad → riesgo legal real
- Lanzar con nombre/icono provisional → difícil de cambiar en stores luego

---

## Fase 1 — MVP publicado (Semanas 3–6)

**Objetivo:** Usuarios reales usando la app. Web + PWA instalable.

### Entregables
- [ ] PWA completa (manifest.json + service worker básico)
- [ ] Privacy policy + ToS en URL pública y enlazadas en la app
- [ ] Disclaimer visible antes del primer uso o en footer
- [ ] Analytics activos y leyendo datos reales
- [ ] Primera ronda de feedback con 10-20 usuarios

### Decisiones clave
- ¿Dónde lanzar? (redes personales, grupos de paddle surf, Reddit, etc.)
- ¿Con qué URL definitiva? (coco.app, getcocap.app, etc.)

### Riesgos
- Sin feedback loop: sin login ni email, no puedes contactar usuarios si hay un bug crítico
- Open-Meteo: si se viraliza antes de implementar el Worker proxy, puede haber problemas de rate
- Algoritmo de score no validado → puede dar resultados incorrectos en condiciones límite

---

## Fase 2 — Apps nativas / Stores (Mes 2–3)

**Objetivo:** Presencia en App Store y Google Play.

### Entregables
- [ ] Capacitor configurado y app buildada para iOS y Android
- [ ] Assets de store completos (icono, screenshots x5, descripción, categoría)
- [ ] App Store submitted + aprobada
- [ ] Google Play submitted + aprobada
- [ ] Cloudflare Worker proxy implementado (antes de stores, el volumen puede dispararse)

### Decisiones clave
- Categoría en stores: "Tiempo" vs "Deportes" vs "Utilidades" (afecta al discovery)
- Precio: gratis en stores (con futuras compras in-app)
- Mínimo de reviews antes de monetizar: al menos 50-100 reseñas positivas

### Riesgos
- **Apple puede rechazar la primera versión.** Contar con ello. Causas habituales:
  - Descripción imprecisa de funcionalidades
  - Falta de disclaimer en apps que influyen en decisiones de seguridad física
  - UI no adaptada a guidelines de iOS
- Google Play es más rápido y menos estricto, pero también puede pedir cambios
- Open-Meteo: con stores el volumen sube. El Worker proxy es necesario antes de este paso

### Duración estimada
- Capacitor setup + testing: 1-2 semanas
- Assets de store: 1 semana
- Review Apple: 1 día a 3 semanas (impredecible, puede haber rechazo)
- Review Google: 1-7 días

---

## Fase 3 — Login + Features premium (Mes 4–6)

**Objetivo:** Monetización y retención real.

### Entregables
- [ ] Login opcional implementado (magic link o Google/Apple Sign-In)
- [ ] Sync de favoritos entre dispositivos (via Supabase o similar)
- [ ] Modelo premium definido e implementado
- [ ] Sistema de pagos in-app (RevenueCat para iOS/Android)
- [ ] Alertas de condiciones (push notifications básicas)

### Decisiones clave
- Qué features son free vs premium (ver `monetization/premium-features.md`)
- Qué proveedor de auth: Supabase Auth, Firebase Auth, Clerk
- Precio de suscripción (hipótesis inicial: 1,99€/mes o 9,99€/año)

### Riesgos
- Introducir login puede generar fricción y bajar retención si no se hace bien
- RevenueCat + App Store = 30% de comisión Apple en primeros años
- La transición de local storage a cloud debe ser imperceptible para el usuario

---

## Fase 4 — Escalado (Mes 7+)

**Objetivo:** Crecer más allá de paddle surf. Potencial B2B.

### Entregables
- [ ] Lógica adaptable a surf, kayak, kitesurf (diferentes parámetros de score)
- [ ] Dashboard interno de métricas
- [ ] Evaluación de API: ¿seguir con Open-Meteo commercial o propia capa de datos?
- [ ] Explorar partnerships: escuelas de surf, clubs de kayak, turismo costero

### Decisiones clave
- ¿Cuándo tiene sentido un backend propio vs seguir en Cloudflare?
- ¿B2C únicamente o hay modelo B2B (licencia para escuelas)?

---

## Timeline visual

```
Semana 1-2   │ Fase 0: docs, legal, decisiones, nombre
Semana 3-4   │ Fase 1: PWA + analytics + privacy policy
Semana 5-6   │ Fase 1: lanzamiento web, primeros usuarios, feedback
Semana 7-8   │ Fase 2: Capacitor + assets de store
Semana 9     │ Fase 2: submit App Store + Google Play
Semana 10-12 │ Fase 2: review, correcciones, approved
Mes 4        │ Iteración post-lanzamiento + inicio login planning
Mes 5-6      │ Fase 3: login + premium
Mes 7+       │ Fase 4: escalado según tracción
```

---

## Dependencias críticas

```
[disclaimer legal] ──────────────────────→ [publicar en cualquier store]
[privacy policy]   ──────────────────────→ [publicar en cualquier store]
[PWA]              ──────────────────────→ [lanzamiento web Fase 1]
[Cloudflare Worker proxy] ───────────────→ [lanzamiento en stores Fase 2]
[analytics activos] ─────────────────────→ [entender qué pasa post-lanzamiento]
[nombre/icono definitivos] ──────────────→ [submit stores]
[login] ─────────────────────────────────→ [monetización y alertas]
```
