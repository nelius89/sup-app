# Métricas — Qué medir y por qué

_Última actualización: 2026-04-17_

---

## North Star Metric

**Sesiones semanales por usuario activo**

Mide si la app genera hábito. Una app de condiciones del mar debería consultarse antes de cada salida al agua. Si alguien va al mar 2-3 veces por semana, debería abrir Coco 2-3 veces por semana.

---

## Métricas de retención (prioritarias)

| Métrica | Qué indica | Señal buena |
|---------|-----------|-------------|
| D1 Retención | % que vuelve al día siguiente | > 30% |
| D7 Retención | % que vuelve a la semana | > 20% |
| D30 Retención | % que vuelve al mes | > 10% |
| WAU/MAU ratio | Frecuencia semanal vs mensual | > 25% |

---

## Métricas de producto

| Métrica | Qué indica |
|---------|-----------|
| Spots más consultados | Dónde hay concentración de usuarios |
| Franja horaria más usada | Cuándo planifica la gente |
| % que usa slide 2 (resumen texto) | Valora la explicación o solo mira los números |
| % que abre el terral detail | Interés en el "por qué" |
| % que añade spots propios | Engagement avanzado |
| Días de previsión consultados | ¿Planifican con antelación? |

---

## Qué observar con Cloudflare Analytics (fase 1)

Cloudflare Analytics no da eventos, pero sí:
- Visitantes únicos diarios/semanales/mensuales
- Top países
- Dispositivos (% mobile vs desktop)
- Referrers (cómo llegan)

Con esto se puede responder:
- ¿La gente vuelve? (comparando periodos)
- ¿De dónde llegan?
- ¿Es 100% mobile como se espera?

---

## Cuándo añadir eventos detallados

Cuando se implemente PostHog o Umami (fase 2-3), añadir estos eventos en app.js:

```javascript
// Ejemplos de eventos a trackear
analytics.track('spot_viewed', { spot_id, franja, estado });
analytics.track('terral_sheet_opened', { nivel_terral });
analytics.track('slide_swiped', { to_slide: 2 });
analytics.track('spot_added');
analytics.track('day_changed', { day_offset });
```
