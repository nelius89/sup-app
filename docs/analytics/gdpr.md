# GDPR — Privacidad y tracking

_Última actualización: 2026-04-17_

---

## Estado actual: sin datos personales

Con el stack actual (Cloudflare Pages + Cloudflare Web Analytics + localStorage), la app:
- No recoge ningún dato personal identificable
- No usa cookies de tracking
- No almacena IPs
- No requiere consentimiento explícito del usuario

**Resultado: GDPR compliant por diseño.** No hay nada que declarar ni banners que mostrar.

---

## Qué cambia si se añaden herramientas de tracking

### PostHog / Umami (eventos anónimos)
- Si los eventos no están asociados a identidades (sin login)
- Si no se recogen IPs ni cookies de seguimiento
- → Sigue siendo GDPR compliant sin banner
- → Hay que declararlo en la Privacy Policy

### Google Analytics
- Requiere consent banner
- Requiere configuración explícita para ser GDPR compliant
- No recomendado para este proyecto

### PostHog + Login (fase 3)
- Los eventos pasan a asociarse a usuarios identificados
- Aparecen nuevas obligaciones:
  - Derecho de acceso a los datos (el usuario puede pedir sus datos)
  - Derecho de supresión (el usuario puede pedir que se borren)
  - Base legal del tratamiento (consentimiento o interés legítimo)
  - Actualizar Privacy Policy

---

## Qué debe declarar la Privacy Policy

### Fase 1 (sin login, Cloudflare Analytics)

```
Datos recogidos: ningún dato personal identificable.
Herramientas de análisis: Cloudflare Web Analytics (no usa cookies, no recoge IPs).
Datos de terceros: datos meteorológicos de Open-Meteo.com.
Almacenamiento: los spots favoritos se guardan localmente en el dispositivo del usuario.
```

### Fase 3 (con login)

Añadir:
```
Datos de cuenta: email (para login).
Datos de uso: spots consultados, frecuencia de uso (anonimizados o asociados a cuenta con consentimiento).
Derechos del usuario: acceso, rectificación, supresión.
Retención de datos: [definir política].
```

---

## Checklist GDPR básico (fase 0-1)

- [ ] Privacy Policy redactada y publicada en URL accesible
- [ ] Privacy Policy enlazada en la app (pantalla "Acerca de")
- [ ] Privacy Policy enlazada en App Store y Google Play
- [ ] Declarar que no se recogen datos personales
- [ ] Declarar uso de Cloudflare Web Analytics
- [ ] Declarar APIs de terceros (Open-Meteo, Nominatim)
- [ ] Declarar almacenamiento local (localStorage)

---

## Nota importante: localStorage y GDPR

Los datos guardados en localStorage (spots favoritos) son datos del dispositivo, no del usuario. No se transmiten a ningún servidor externo. No son datos personales según la definición GDPR (no identifican a una persona).

**Conclusión:** El localStorage actual no genera obligaciones GDPR.
