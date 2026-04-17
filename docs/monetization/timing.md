# Timing de monetización

_Cuándo introducir cada pieza._
_Última actualización: 2026-04-17_

---

## Regla general

No monetizar hasta tener señales claras de valor:
- Usuarios que vuelven semana a semana (retención D7 > 20%)
- Feedback positivo espontáneo
- Mínimo 1.000 usuarios activos mensuales

Monetizar antes destruye el crecimiento orgánico de una app sin marca establecida.

---

## Fase 0-1 (AHORA — primeras semanas)

**Monetización:** Ninguna.

Objetivo: validar que la app aporta valor. Si la gente no vuelve gratis, no pagará de pago.

---

## Fase 2 (stores publicadas, primeros meses)

**Monetización:** Ninguna todavía.

La app es gratis en stores. El objetivo es acumular reseñas y usuarios.

**Preparar (sin activar):**
- Pensar qué features irán en premium
- Revisar `monetization/premium-features.md`
- Registrar Apple Developer y Google Play accounts (necesario para publicar)

---

## Fase 3 (cuando haya tracción)

**Monetización:** Introducir Coco Premium (freemium).

**Secuencia recomendada:**
1. Implementar login (sin esto no hay sync ni alertas, que son las features premium más valiosas)
2. Implementar sync de spots (primera feature premium clara)
3. Introducir sistema de suscripción con RevenueCat
4. Añadir alertas de condiciones (feature premium más deseada)
5. Añadir deportes adicionales (surf, kayak)

**Nunca hacer:**
- Poner paywall sobre features que antes eran gratuitas (genera churn masivo y reviews negativas)
- Cobrar por funcionalidades de seguridad

---

## Fase 4 (escala)

**Monetización adicional posible:**
- Partnerships con escuelas de surf o kayak (B2B)
- Versión white-label para clubs (si hay demanda)
- Plan anual con descuento para reducir churn
