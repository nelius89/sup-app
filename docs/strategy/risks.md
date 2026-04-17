# Riesgos — Coco

_Ordenados por probabilidad × impacto._
_Última actualización: 2026-04-17_

---

## Riesgos críticos (actuar ya)

### R1 — Sin disclaimer de seguridad
**Probabilidad:** Alta si no se añade
**Impacto:** Muy alto (legal)

La app interpreta datos del mar para tomar decisiones que pueden implicar riesgo físico. Si alguien sale al agua porque la app dijo "bueno" y tiene un accidente, sin disclaimer de responsabilidad existe exposición legal real. Es el riesgo más ignorado en apps de este tipo.

**Acción:** Redactar y publicar disclaimer antes de cualquier lanzamiento público. Ver `legal/disclaimers.md`.

---

### R2 — Lanzar con nombre o icono provisional
**Probabilidad:** Alta si no se decide ahora
**Impacto:** Alto (difícil de cambiar en stores sin perder reviews/posicionamiento)

Cambiar el nombre de una app en stores después de tener usuarios implica perder posicionamiento ASO, confundir usuarios existentes y potencialmente reiniciar el proceso de review.

**Acción:** Decidir nombre, icono y descripción definitivos antes de cualquier submit a stores. Nombre elegido: **Coco**.

---

### R3 — Apple rechaza la app en el primer review
**Probabilidad:** Media-alta (apps de condiciones que influyen en seguridad física son más escrutadas)
**Impacto:** Medio (retraso, no bloqueo)

Causas habituales de rechazo:
- Falta de disclaimer en apps que influyen en decisiones de seguridad
- UI no adaptada a iOS guidelines (touch targets, safe areas, etc.)
- Descripción que no refleja exactamente lo que hace la app
- Uso de APIs no documentado en la privacy policy

**Acción:** Seguir checklist en `launch/app-store-checklist.md`. Contar con al menos una ronda de rechazo en la planificación.

---

## Riesgos técnicos

### R4 — Open-Meteo cambia condiciones o tiene caídas
**Probabilidad:** Baja a corto plazo, media a largo plazo
**Impacto:** Muy alto (la app deja de funcionar)

Open-Meteo es gratuito para uso no comercial y ha sido estable, pero:
- No tiene SLA en el tier gratuito
- Si la app monetiza, legalmente necesita licencia commercial (~14€/mes)
- Podría cambiar sus términos sin previo aviso

**Acción inmediata:** Implementar Cloudflare Worker proxy con KV cache (ver `technical/api-dependencies.md`). Esto reduce dependencia directa y el volumen de llamadas drásticamente.
**Acción a medio plazo:** Cuando llegue la monetización, contratar el plan commercial de Open-Meteo.
**Fallback:** yr.no (Norwegian Meteorological Institute) como API alternativa para datos atmosféricos.

---

### R5 — Rate limiting de Open-Meteo por crecimiento rápido
**Probabilidad:** Baja inicialmente, sube con tracción
**Impacto:** Alto (experiencia rota para todos los usuarios)

Sin el Worker proxy, cada dispositivo genera sus propias llamadas a la API. Con 1.000 usuarios activos diarios consultando spots diferentes, el volumen puede superar lo que considera "fair use" la API gratuita.

**Acción:** Implementar Worker proxy antes del lanzamiento en stores. Ver `technical/api-dependencies.md`.

---

### R6 — localStorage se limpia o se pierde
**Probabilidad:** Media (comportamiento de algunos navegadores móviles)
**Impacto:** Medio (usuario pierde sus spots favoritos)

En algunos navegadores móviles (especialmente Safari en iOS con "Prevent Cross-Site Tracking" activo), el localStorage puede limpiarse. El usuario pierde sus playas guardadas sin posibilidad de recuperación.

**Acción fase 1:** Documentar la limitación, considerar añadir un aviso al usuario.
**Acción fase 3:** Login + sync en cloud resuelve esto definitivamente.

---

### R7 — Algoritmo de score no calibrado correctamente
**Probabilidad:** Media (no ha sido validado con usuarios reales)
**Impacto:** Alto (confianza y seguridad del producto)

El sistema de puntuación actual asigna pesos a viento, ola, rachas y período. Estos pesos son hipótesis, no han sido validados con paddlers reales en condiciones reales.

**Acción:** Antes del lanzamiento masivo, validar el algoritmo con al menos 5-10 usuarios reales de paddle surf. Ver `product/score-logic.md`.

---

## Riesgos de negocio

### R8 — Sin feedback loop en v1
**Probabilidad:** Certeza (sin login no hay contacto)
**Impacto:** Medio

Sin login ni email, si hay un bug crítico post-lanzamiento no existe forma de contactar a los usuarios. No se puede enviar updates ni comunicar cambios importantes.

**Mitigación:** Añadir un enlace visible a feedback (formulario simple, email o red social) desde el primer día. No hace falta login para eso.

---

### R9 — Competencia con apps consolidadas
**Probabilidad:** Siempre presente
**Impacto:** Bajo a corto plazo

Windy, Windguru, Surfline, MagicSeaweed. Todas tienen más datos y más usuarios. La diferencia de Coco es la interpretación y el tono — no la cantidad de datos.

**Acción:** El diferencial no es competir en datos, sino en claridad y experiencia. Mantener ese foco. Ver `strategy/value-proposition.md`.

---

### R10 — Dependencia excesiva de un solo proveedor de datos
**Probabilidad:** Certeza (ahora mismo solo Open-Meteo)
**Impacto:** Alto si falla

**Acción a futuro:** Diversificar a 2 fuentes de datos con lógica de fallback. No es urgente en fase 0-1.

---

## Riesgos legales

### R11 — GDPR sin compliance
**Probabilidad:** Baja con Cloudflare Analytics (no usa cookies), alta si se añaden otras herramientas
**Impacto:** Alto

**Acción:** Usar Cloudflare Web Analytics en v1 (GDPR by design, sin cookies, sin banner necesario). Si se añaden otras herramientas de tracking en el futuro, revisar `analytics/gdpr.md`.

---

### R12 — Condiciones de uso de APIs externas
**Probabilidad:** Baja pero real
**Impacto:** Medio

Open-Meteo requiere atribución (Creative Commons). Nominatim prohíbe scraping masivo y requiere user-agent propio. El incumplimiento puede resultar en bloqueo de IP o acceso.

**Acción:** Ver `legal/api-usage.md`. La atribución a Open-Meteo debe ser visible en la app (footer o about).

---

## Cosas que puedes estar ignorando

1. **Naming antes de publicar.** Ya resuelto (Coco), pero recordatorio de que esto bloquea el submit a stores.

2. **App Store fees.** 99€/año para Apple Developer. 25€ única vez para Google Play. Hay que tenerlos previstos antes de iniciar el proceso de publicación.

3. **Capacitor no es magia.** Al envolver la web app en nativo, pueden aparecer problemas de rendimiento, gestos que colisionan con los del sistema operativo, o comportamientos distintos entre iOS y Android. Hay que probar en dispositivos reales, no solo simulador.

4. **El algoritmo de score es el corazón del producto.** Una mala calibración no es solo un bug técnico — destruye la confianza en la app. Priorizar su validación.

5. **Nominatim para búsqueda.** Tiene política de uso aceptable estricta: no más de 1 req/segundo, no scraping. Si la búsqueda de playas se usa mucho, necesitará un proxy o una alternativa (Photon API, también OpenStreetMap pero más permisiva).
