# Cocodrift — Estado del proyecto
_Actualizar al inicio/cierre de cada sesión de trabajo._
_Última actualización: abril 2026 — v2.2_

---

## Qué es Cocodrift

App PWA de diagnóstico de condiciones para SUP (Stand Up Paddle).
Responde a: **¿Salgo al agua hoy?**

Traduce datos meteorológicos y marinos en una decisión clara, en lenguaje no técnico.
Sin login. Sin historial. Funciona offline (Service Worker).

**Stack:** HTML + CSS + JS vanilla · Open-Meteo API · Cloudflare Pages

**Repo:** `nelius89/cocodrift` (GitHub)
**URL producción:** `cocodrift.pages.dev`

---

## Ramas

| Rama | Función |
|---|---|
| `main` | Producción (Cloudflare auto-deploy) |
| `dev` | Staging / preview |
| `v2.2` | **Rama activa de desarrollo** |
| `v2.1`, `v2.0`, `v1.1`, `ui-lab` | Archivadas |

**Regla:** nunca mergear `v2.2` → `dev`/`main` sin confirmación explícita.

---

## Estado actual — v2.2 (abril 2026)

### Lo que está implementado

**Home**
- Header: botón info circular (izquierda) + botón instalar PWA (derecha, oculto si ya instalada)
- Logo Cocodrift (Logo.png, 65% ancho)
- Video loop del cocodrilo (coco-loop.webm, VP9 con alpha), solapado sobre el logo con mix-blend-mode
- Lista de spots como pills. Tap → Resultados. Tap largo → modo borrar
- Límite 4 spots de usuario + popup "sardinas" al superarlo
- Sheet "Acerca de": versión v2.2, descripción, disclaimer, contacto

**Timeline horaria (pantalla Resultados, zona azul)**
- Reemplaza el sistema anterior de tabs Hoy/Mañana + 4 franjas fijas
- Label del día fijo arriba + slots horarios deslizables con snap magneto
- Bocadillo blanco sólido sobre el slot activo
- Al cargar: slot activo alineado automáticamente a la izquierda

**Diagnóstico principal (zona beige)**
- Pre-label fijo: "¿Está para salir?"
- Bocadillo: título del estado + divider + 3 líneas narrativas (encounter · demand · fit)
- Ilustración SVG del cocodrilo según el estado (5 estados, 5 ilustraciones)
- Botón "Ver información técnica ↓"
- Tech blocks: tarjetas blancas independientes (Viento, Rachas, Ola, Período)
- Tarjetas con aviso cuidado/alerta: fondo ámbar tintado
- Dirección de viento: label onshore/offshore según spot
- Botón "Informar error" al final

**Sistema de diagnóstico (score.js) — cerrado**
- Paradigma: reglas directas por variable (no scoring ponderado)
- 5 estados: piscina · muy-agradable · se-puede-salir · exigente · no-recomendable
- Avisos: rachas · variabilidad · mar · terral (3 niveles cada uno)
- Variabilidad = gustKn − windKn (variable propia de Cocodrift)
- Terral con modificador de ola
- Regla de acumulación: ≥2 avisos nivel 3 → baja un estado
- Alerta consolidada para estado no-recomendable
- Categorías de aviso: narrativa (absorbida en copy) · a-tener-en-cuenta · cuidado · alerta

**Búsqueda de playas**
- Nominatim con countrycodes=es + prefijos playa/platja/cala
- Estrella en resultados para marcar favorito antes de guardar

**Workers**
- `coco-suggestions`: recibe sugerencias desde la app y las guarda en Notion

### Pendiente / no implementado

- Vista de 7 días — placeholder vacío, lógica sin construir
- Token temporal en el copy (franja actual / futura / mañana / días futuros)
- `getUserFit()` — función en score.js pendiente de conectar al DOM

---

## Orden de bloques en pantalla (v2.2)

```
ZONA AZUL (fija)
  ← back                              ★ favorito
  [Nombre del spot]
  [📍 Ciudad]
  ─────────────────────────────
  [label día]
  [← slot slot [bocadillo] slot slot →]

ZONA BEIGE (scroll)
  ¿Está para salir?
  ┌─────────────────────────┐
  │ TÍTULO DEL ESTADO       │
  │ ─────────────────────── │
  │ qué te vas a encontrar  │
  │ qué te va a pedir       │
  │ para quién encaja       │
  └─────────────────────────┘
  [ilustración cocodrilo por estado]

  [Ver información técnica ↓]

  ┌─────────┐  ┌─────────┐
  │ Viento  │  │ Rachas  │
  └─────────┘  └─────────┘
  ┌─────────┐  ┌─────────┐
  │  Ola    │  │ Período │
  └─────────┘  └─────────┘

  [Informar error]
```

---

## Ilustraciones activas (v2.2)

```
Home:
  Logo.png                  ← logotipo
  coco-loop.webm            ← loop animado (VP9, alpha)

Resultados:
  Resolucion/Estados/
    Piscina.svg
    Muyagradable.svg
    Sepuedesalir.svg
    Exigente.svg
    Norecomendable.svg
  Resolucion/Bloques/
    1 quetevasaencontrar.svg
    2 quetevaapedir.svg
    3 paraquienencaja.svg
```

---

## Decisiones de diseño tomadas (no reabrir sin motivo)

| Decisión | Motivo |
|---|---|
| Reglas directas vs. scoring ponderado | El scoring permitía que variables se compensaran entre sí |
| Variabilidad como variable propia | No existe en literatura técnica de SUP; Cocodrift la formaliza |
| Terral siempre visible como pill compacta | El mecanismo de riesgo existe desde nivel 1 |
| Terral nivel 1 = a-tener-en-cuenta (no alerta) | Alarmista si es leve; diluye el valor de la alerta real |
| No-recomendable = alerta consolidada (un párrafo) | Avisos individuales añaden ruido cuando el estado ya lo dice todo |
| Tarjetas cuidado/alerta con fondo ámbar | Diferenciación visual clara sin romper el sistema de color |
| Timeline horaria vs. tabs + franjas fijas | Mayor granularidad y UX más fluida |
| Bocadillo blanco sólido en timeline | Claridad visual del slot activo sin ambigüedad |
| Snap magneto en timeline | Evita estados intermedios entre slots |
| Todo el copy es atemporal | Token temporal pendiente de implementar |
| Límite 4 spots de usuario | Evita que la lista crezca sin control |
| Sheet unificado "Acerca de" (sin hamburger) | Simplifica la navegación en Home |

---

## Archivos clave

| Archivo | Qué contiene |
|---|---|
| `js/score.js` | Sistema de diagnóstico completo (estados, avisos, bloques, copy) |
| `js/app.js` | Orquestación, renderizado, eventos |
| `js/api.js` | Llamadas a Open-Meteo, timeline, caché |
| `js/storage.js` | localStorage: spots y caché |
| `index.html` | Estructura HTML de todas las vistas y sheets |
| `css/styles.css` | Estilos (tokens, vistas, componentes) |
| `docs/sistema-diagnostico.md` | Spec técnica del sistema de diagnóstico |
| `BRIEFING.md` | Contexto completo del proyecto |

---

## Cómo retomar una sesión

1. Leer este archivo
2. Leer `BRIEFING.md` para contexto completo
3. Leer `docs/sistema-diagnostico.md` si se trabaja en lógica o copy
4. Rama activa: `v2.2`
5. **No tocar `score.js` salvo motivo concreto** — el sistema de diagnóstico está cerrado
6. Próximos trabajos posibles: token temporal, vista 7 días, nuevas actividades
