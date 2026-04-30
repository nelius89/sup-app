# Análisis: eliminar selector de franjas → resumen diario + botón reloj

_Fecha: 2026-04-29_
_Contexto: rama v2.2 — header/hero con selector de 4 franjas horarias (análisis iniciado en v2.1)_

---

## El problema

El selector de franjas (Amanecer / Día / Tarde / Noche) ocupa espacio en el hero y añade carga cognitiva. En la práctica, las condiciones entre franjas diurnas (Día y Tarde) varían poco en playas mediterráneas, y el cambio perceptible más frecuente está en el Amanecer. El selector no aporta suficiente valor para justificar el espacio que ocupa.

**Propuesta**: eliminar el bloque de franjas del hero, mostrar un resumen diario, y añadir un botón reloj que despliegue el detalle por horas.

---

## Cómo lo resuelven las apps de referencia

| App | Modelo |
|---|---|
| **Surfline** | Score diario (1–10) basado en las mejores condiciones del día. Barra horaria expandible. Pondera las horas "surfables" (amanecer–puesta de sol). |
| **Windguru** | Tabla horaria directa, sin score. Orientada a expertos. No tiene capa de resumen. |
| **Windy** | Muestra "peor y mejor momento del día" con icono. El usuario abre el detalle horario si quiere. |
| **Surf-forecast** | Rating por franja (mañana / tarde / noche) — el modelo más parecido al actual. |
| **XCWeather / Meteored** | Resumen diario + tap para ver horas. |

**Conclusión benchmark**: el modelo más limpio y con mejor adopción es score diario + detalle horario opcional. Surfline lo ha validado masivamente.

---

## ALERTA DE SEGURIDAD — diferencia crítica con apps de surf

Las apps de surf priorizan mostrar el **máximo** de lo bueno: si a X hora hay mucha ola, eso es el dato relevante. Si no la hay, simplemente decepción — sin consecuencias de seguridad.

**Cocodrift es diferente.** Es una app orientada a SUP y usuarios de playa. Aquí la lógica es la inversa:

> Si en algún momento del día las condiciones van a ser peligrosas (viento fuerte, olas grandes, corriente), eso es lo que hay que priorizar — no el mejor momento.

Mostrar un score diario basado en la media o en el mejor momento puede dar una falsa sensación de seguridad. Un usuario que ve "8/10" puede salir al agua sin saber que a las 17h habrá viento de 30km/h y oleaje de 1.5m.

**Principio de diseño para Cocodrift**: el score diario debe reflejar el **peor momento relevante del día**, no el mejor ni la media.

Esto tiene implicaciones directas en cómo se calcula el score diario (ver sección siguiente).

---

## Cómo calcular el "score diario"

El error a evitar: promediar las 24h incluye la noche, cuando nadie va a la playa. El score pierde utilidad.

**Horas activas = 8:00–20:00** (12h). Estándar para climas mediterráneos.

### Opciones de cálculo

| Opción | Descripción | Pro | Contra |
|---|---|---|---|
| **A — Media simple** | Promedio horas 8–20 | Simple, ya tienes `extractSlice()` | No distingue picos peligrosos |
| **B — Media ponderada** | Más peso a mediodía (10–17h) | Más representativa del "cuándo irías" | Sigue enmascarando picos |
| **C — Best window** | Detectar bloque de 3–4h consecutivas con mejor score | Muy accionable, diferencial | Más complejo; puede ignorar riesgo vespertino |
| **D — Worst-case relevante** | Score = el peor momento dentro de las horas activas | Prioritiza seguridad | Puede parecer "pesimista" sin contexto |
| **E — Híbrido** | Score visual = media, pero con bandera de alerta si alguna hora supera umbral de riesgo | Balance entre utilidad y seguridad | Más complejo de implementar |

**Recomendación para Cocodrift**: empezar con **Opción A** (media 8–20h) más **sistema de alerta** si alguna hora supera umbrales críticos (viento > X, olas > Y). Esto cubre la seguridad sin hacer el score innecesariamente pesimista.

La Opción E (híbrido) es la más robusta a largo plazo — score informativo + flag de riesgo. Es lo que debería ser.

---

## El botón reloj — qué despliega

Bottom sheet o dropdown con vista horaria:

```
[Reloj icon]  ← tap para abrir

08:00  ☀️  21°  Viento: 8km/h   ● 8/10
10:00  ☀️  23°  Viento: 6km/h   ● 9/10
12:00  ⛅  24°  Viento: 9km/h   ● 8/10
14:00  ⛅  23°  Viento: 12km/h  ● 7/10
16:00  🌤  22°  Viento: 15km/h  ● 6/10
18:00  ⚠️  21°  Viento: 28km/h  ● 3/10  ← alerta visible
```

La alerta de riesgo debe ser visible en la vista horaria — no escondida.

---

## Implicaciones en el código

| Aspecto | Complejidad |
|---|---|
| Calcular media 8–20h | Baja — adaptar `extractSlice()` en api.js |
| Eliminar bloque de franjas del DOM | Baja |
| Eliminar `currentFranja` como estado global | Media — hay referencias en app.js |
| Renderizar score diario en el hero | Baja |
| Botón reloj + UI desplegable con horas | Media — nuevo componente |
| Sistema de alertas por umbral de riesgo | Media-alta — definir umbrales primero |
| Mantener coherencia con Hoy/Mañana/7días | Baja — no cambia lógica de días |

Lo que desaparece:
- `currentFranja` como variable de estado global
- `renderFranjas()`
- El slot selector del header
- `sliderIndex(day, franja)` — sustituida por índice solo por día

---

## Pregunta abierta antes de implementar

¿Qué muestra el hero sin el selector de franjas?

**Opción A** — Score del día + condición resumida ("Buenas condiciones 10–14h") + flag de alerta si aplica
**Opción B** — Métricas clave del día (temp agua, viento, olas) sin score numérico — más raw

Hay que decidir esto antes de diseñar el nuevo hero.

---

## Nota final — implicación de seguridad en el diseño del score

En surf, el peligro de sobreestimar las condiciones es una decepción. En SUP, es un accidente. Eso significa que el score diario no puede ser solo una media ni basarse en el mejor momento — necesita incluir algún mecanismo de alerta cuando en cualquier franja del día las condiciones superan un umbral de riesgo.

El modelo más sensato para Cocodrift sería: **score = media de horas activas, pero con un flag visible si en alguna hora hay condiciones que merezcan precaución**. No hacer el score artificialmente bajo, pero tampoco esconder el riesgo debajo de un 8/10.

Esto requiere definir los umbrales (viento > X, olas > Y) antes de implementar nada. Vale la pena contrastar esto cuando se revisen las apps de referencia — ver cómo definen ellos los umbrales de "condiciones difíciles" para SUP específicamente.

---

## Pendiente

- [ ] Revisar Surfline, Windy, Meteored para benchmark visual del hero
- [ ] Definir umbrales de riesgo (viento, olas, corriente) para el sistema de alertas
- [ ] Decidir modelo de score: media simple vs híbrido con alerta
- [ ] Diseñar el nuevo hero (Figma o sketch rápido)
- [ ] Implementar
