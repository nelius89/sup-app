# Analytics — Herramientas y decisiones

_Última actualización: 2026-04-17_

---

## Decisión tomada

**Fase 0-1-2:** Cloudflare Web Analytics (gratis, ya disponible, GDPR compliant)
**Fase 3+:** Evaluar PostHog o Umami si se necesita más granularidad

---

## Cloudflare Web Analytics (AHORA)

### Por qué es la opción correcta para empezar

- **Gratis.** Sin plan de pago, sin trial. Incluido en Cloudflare Pages.
- **Zero setup.** Ya estás en Cloudflare. Está en el dashboard, se activa con un click.
- **GDPR compliant by design.** No usa cookies. No necesitas banner de cookies. No almacena IPs. Mide de forma agregada, no individual.
- **Sin código.** No hay que añadir nada al proyecto.

### Cómo activarlo (5 minutos)

1. Cloudflare Dashboard → tu sitio → Web Analytics
2. Activar Analytics
3. Se añade automáticamente al script de Cloudflare Pages

### Qué te da

- Visitantes únicos (estimación)
- Páginas vistas
- Top páginas visitadas
- Dispositivos (mobile / desktop)
- Navegadores
- Países
- Referrers (de dónde vienen)
- Core Web Vitals (rendimiento)

### Qué NO te da

- Eventos personalizados (qué botones tocan, qué spots buscan)
- Funnels
- Retención / usuarios recurrentes
- Sesiones individuales

Para el MVP esto es suficiente. Saber cuánta gente entra y de dónde es más que suficiente para la fase 1.

---

## Opciones gratuitas si se necesita más

### PostHog (free tier)

**Free hasta:** 1 millón de eventos/mes
**Hosting:** Cloud gratuito o self-hosted
**Qué da:**
- Eventos personalizados (clicks, acciones, flujos)
- Funnels
- Session recordings (con anonimización)
- Feature flags
- GDPR compliant (con configuración)

**Cuándo usar:** Cuando se necesite entender qué hacen los usuarios dentro de la app — qué spots buscan, si usan el terral detail, etc.

**Código de integración (cuando sea el momento):**
```html
<script>
  !function(t,e){...} // snippet de PostHog
</script>
```

```javascript
// Ejemplo de evento
posthog.capture('spot_viewed', {
  spot_id: 'pont-petroli',
  franja: 'mañana',
  estado: 'bueno'
});
```

---

### Umami (self-hosted gratuito)

**Free:** Self-hosted en Railway / Vercel / Supabase (gratis con sus free tiers)
**Qué da:**
- Visitantes, páginas vistas, referrers
- Eventos personalizados simples
- Sin cookies, GDPR compliant
- Dashboard limpio y bonito

**Cuándo usar:** Si se quiere más que Cloudflare Analytics pero sin tocar PostHog. Requiere setup de servidor (~30 min).

---

### Google Analytics 4

**No recomendado para este proyecto.**

Por qué:
- Requiere banner de cookies (GDPR)
- Complejo de configurar correctamente
- Los datos son de Google, no tuyos
- Overkill para esta fase

---

## Eventos a trackear (cuando se implemente PostHog/Umami)

Estos son los eventos más valiosos para entender el producto:

| Evento | Qué indica |
|--------|-----------|
| `app_opened` | Uso recurrente, retención |
| `spot_viewed` | Qué playas consultan + franja horaria |
| `spot_added` | ¿Añaden playas propias? |
| `terral_sheet_opened` | ¿Leen el detalle del terral? |
| `slide_swiped` | ¿Usan el resumen de texto (slide 2)? |
| `day_changed` | ¿Planifican con antelación? |
| `franja_changed` | ¿Consultan otras horas del día? |

**Lo que NO hace falta trackear en v1:**
- Identidad del usuario
- Localización exacta (solo el spot_id que eligieron)
- Session recordings

---

## Métricas clave del producto

### North Star Metric
**Sesiones semanales por usuario activo** — mide si la app genera hábito y recurrencia.

### Métricas secundarias
- DAU/WAU/MAU (usuarios activos diario/semanal/mensual)
- Spots más consultados
- Distribución de franjas horarias (¿cuándo consultan?)
- % de usuarios que añaden spots propios
- Retención D1, D7, D30 (% que vuelven al día 1, 7, 30)

---

## GDPR — qué se puede hacer sin banner

Con Cloudflare Web Analytics:
- Todo permitido sin banner. No recoge datos personales. No hay nada que declarar.

Con PostHog o Umami (eventos anónimos):
- Si no se asocian eventos a identidades, y no se recogen IPs ni cookies de seguimiento, se puede operar sin banner de cookies.
- Pero hay que declararlo en la Privacy Policy.

Con PostHog + login (fase 3):
- Cuando se asocien eventos a usuarios identificados, aparecen obligaciones GDPR más complejas.
- Ver `analytics/gdpr.md`.
