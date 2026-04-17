# Features premium — Candidatos

_Última actualización: 2026-04-17_

---

## Criterio para decidir qué es premium

Una feature es buena candidata a premium si:
1. Añade valor real a usuarios recurrentes o avanzados
2. No bloquea la propuesta de valor básica (interpretar el mar)
3. Tiene coste de infraestructura asociado (justifica el pago)
4. Es suficientemente diferenciadora

---

## Candidatos premium por categoría

### Funcionalidad core (SIEMPRE FREE)
- Diagnóstico de condiciones del día
- 2 playas hardcoded
- Previsión de 7 días con franjas horarias
- Aviso de terral
- Métricas detalladas (slide 1 y 2)

---

### Candidatos premium

| Feature | Valor para el usuario | Coste infraestructura |
|---------|----------------------|----------------------|
| **Sync de spots entre dispositivos** | Alto — no perder spots al cambiar móvil | Bajo (Supabase free tier) |
| **Alertas de condiciones** | Alto — "avísame cuando esté perfecto" | Medio (push notifications, lógica de triggers) |
| **Spots ilimitados** | Medio — ahora máx 10 | Bajo |
| **Historial de condiciones** | Medio — ver cómo estaba el mar días pasados | Medio (almacenamiento) |
| **Deportes adicionales** | Alto — surf, kayak, kitesurf con parámetros propios | Bajo (lógica ya existe, adaptar) |
| **Widget de pantalla de inicio** | Alto para usuarios habituales | Medio (Capacitor plugin) |
| **Previsión extendida (+7 días)** | Medio | Bajo (Open-Meteo da hasta 16 días) |
| **Modo offline completo** | Bajo-medio | Bajo |

---

## Estructura freemium recomendada (hipótesis)

### Coco Free
- Consulta de condiciones para hasta 3 spots
- Previsión 7 días
- Avisos de terral
- Sin sync, sin alertas

### Coco Premium (1,99€/mes o 9,99€/año)
- Spots ilimitados + sync entre dispositivos
- Alertas personalizadas de condiciones
- Previsión extendida (hasta 14 días)
- Deportes adicionales (surf, kayak)
- Widget de pantalla de inicio

---

## Lo que no debería ser premium (nunca)

- El disclaimer de seguridad
- Los avisos de riesgo (terral, condiciones peligrosas)
- La información básica de las condiciones del día
- La atribución a Open-Meteo

Bloquear información de seguridad detrás de paywall es un error tanto ético como estratégico.
