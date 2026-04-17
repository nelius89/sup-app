# Escalabilidad — Cuándo rompe qué

_Última actualización: 2026-04-17_

---

## Mapa de límites

| Componente | Límite actual | Cuándo actuar | Coste |
|-----------|--------------|---------------|-------|
| Cloudflare Pages | 500 deploys/mes, bandwidth ilimitado | Probablemente nunca | — |
| Cloudflare Workers (free) | 100.000 req/día | Con >50.000 usuarios activos | $5/mes (Workers Paid) |
| Cloudflare KV (free) | 100.000 reads/día, 1.000 writes/día | Cuando haya Worker proxy activo | $0.50/millón reads |
| Open-Meteo (free) | ~10.000 req/día (fair use) | Con >1.000 usuarios activos sin Worker | ~14€/mes commercial |
| Nominatim | 1 req/segundo | Con búsqueda frecuente masiva | Migrar a Photon API |
| localStorage | ~5MB | Con >50 spots guardados (no probable) | Migrar a cloud |

---

## El cuello de botella real: Open-Meteo sin Worker proxy

Sin el Worker proxy, cada dispositivo llama directamente a Open-Meteo.

```
Sin Worker proxy:
  1.000 usuarios/día × 2 req/spot × 2 carga media = ~4.000 req/día  → Límite fair use

Con Worker proxy + KV cache:
  100 spots populares × 2 req/hora × 24h = ~4.800 req/día           → Independiente del número de usuarios
```

**Conclusión:** El Worker proxy es la mejora de escalabilidad más importante antes de lanzar en stores.

---

## Cuándo cambiar arquitectura

### De Cloudflare Pages a... nada todavía
Cloudflare Pages es muy generoso. No hay motivo para cambiar hasta tener un volumen enorme. Si se necesitara más control, Cloudflare Workers (como SSR) o un servidor Node propio serían los siguientes pasos, pero no antes del millón de usuarios.

### De Open-Meteo free a Open-Meteo commercial
- Cuando: al monetizar (por legalidad) o cuando el volumen supere ~8.000 req/día de forma consistente
- Coste: ~14€/mes
- Sin cambios de código — misma API, mismo formato

### De localStorage a Supabase
- Cuando: al implementar login en fase 3
- Sin urgencia antes de eso

### De app web a app nativa
- La PWA es suficiente para validar el producto
- Capacitor cuando haya demanda real de stores

---

## Señales de alerta a vigilar

1. **Errores 429 o 503 de Open-Meteo** → Implementar Worker proxy de inmediato
2. **Cloudflare Analytics muestra >5.000 usuarios/día** → Revisar si Worker proxy está activo
3. **Quejas de datos lentos o no disponibles** → Revisar caché y fallbacks
4. **Crecimiento viral inesperado** → El Worker proxy + KV cache aguanta, el problema sería Open-Meteo

---

## Escenario de crecimiento rápido (plan de contingencia)

Si la app se viraliza antes de tener el Worker proxy:

1. **Inmediato (horas):** Aumentar TTL de caché local de 60 min a 3 horas para reducir req
2. **Corto plazo (días):** Implementar Worker proxy con KV
3. **Si Open-Meteo bloquea:** Considerar contratar plan commercial (~14€/mes) como medida temporal mientras se implementa el proxy
