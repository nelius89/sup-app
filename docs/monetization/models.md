# Modelos de monetización — Coco

_Última actualización: 2026-04-17_

---

## Principio base

No introducir monetización hasta tener tracción real. Primero usuarios, después dinero. Lanzar con paywall o ads desde el día 1 mata el crecimiento orgánico.

**Señal mínima para pensar en monetización:** 1.000 usuarios activos mensuales de forma consistente.

---

## Modelos posibles

### Freemium (recomendado)

**Estructura:** Funcionalidad core gratuita + features avanzadas de pago.

La app funciona bien gratis. El premium añade valor real sin bloquear la experiencia básica.

**Por qué funciona para Coco:**
- La propuesta de valor (interpretar el mar) debe ser accesible para todos
- El premium puede ser features que no todo el mundo necesita: alertas, sync, historial, deportes adicionales
- Bajo friction de entrada → más usuarios → más conversiones a largo plazo

**Precio orientativo:** 1,99€/mes o 9,99€/año

---

### Suscripción pura

Toda la app detrás de paywall o trial de 7 días.

**No recomendado en fase inicial.** Muy alta fricción para un producto sin reputación aún. La gente no paga por apps que no conoce.

**Puede funcionar en fase 4** si el producto tiene marca consolidada y diferencial muy claro.

---

### One-time purchase

Pago único para desbloquear la versión completa.

**Ventaja:** Sin recurrencia → menos presión al usuario.
**Desventaja:** Ingresos no predecibles, difícil financiar desarrollo continuo.

**Podría funcionar:** Como alternativa a la suscripción para usuarios que no quieren pagar mensualmente.

---

### Partnerships / B2B

Licencias para escuelas de surf, clubs de kayak, empresas de turismo náutico.

**Cuándo explorar:** Fase 4. Requiere producto maduro y referencias de usuarios.
**Potencial:** Un club con 50 socios que paga 20€/mes es equivalente a 200 usuarios premium B2C.

---

### Publicidad

Banners o intersticiales.

**No recomendado.** Destruye la UX minimalista que es el diferencial de Coco.

---

## Cuándo introducir qué

Ver `monetization/timing.md`.

---

## Herramientas de pago in-app

Para apps nativas (cuando llegue la fase 3):

**RevenueCat** — El estándar actual para monetización in-app.
- Gestiona suscripciones iOS y Android desde un solo SDK
- Dashboards de revenue, churn, LTV
- Gratis hasta $2.500 MRR
- Abstrae la complejidad de App Store Connect + Google Play Billing

Sin RevenueCat, habría que implementar el billing de Apple y Google por separado — complejidad innecesaria.
