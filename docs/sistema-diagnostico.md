# Cocodrift — Sistema de diagnóstico y UX
_Documento vivo. Última actualización: abril 2026._

---

## 1. Visión de producto

Cocodrift es una app de **decisión**, no de datos.

Responde a una pregunta: **¿Salgo al agua hoy?**

No requiere conocimiento técnico. No muestra datos para interpretar.
Traduce condiciones del mar en una experiencia clara.

El usuario entiende en segundos:
- qué se va a encontrar
- si encaja con él

---

## 2. Modelo mental: mood del mar

El sistema no evalúa si el mar es "bueno" o "malo".
Evalúa **qué experiencia vas a tener en el agua**.

Esto se expresa como **mood del mar**. El mood no es suficiente por sí solo — se complementa con narrativa y avisos.

**Principio clave:** el usuario no decide con una etiqueta, decide con una historia corta.

---

## 3. Principios físicos

### Viento
- ≤ 6 kn → condiciones ideales
- ≤ 10 kn → cómodo
- 10–15 kn → empieza a ser exigente
- > 15 kn → difícil para la mayoría
- Principiantes: máximo recomendado ≈ 7 kn en mar abierto (hasta 10 kn con instructor o en agua cerrada)
- _Fuente: ASI, Paddle UK/BCAB — documentos oficiales abril 2025_

### Rachas
Desestabilizan, rompen el equilibrio, generan imprevisibilidad.
La variabilidad es tan importante como el valor medio.

### Variabilidad (derivada)
`variabilidad = racha - viento`

- < 3 kn → estable
- 3–6 kn → ligera variación
- 6–10 kn → incómodo
- > 10 kn → inestable real

**Insight clave:** la estabilidad pesa más que la media.

### Dirección — Terral (offshore)
El terral puede arrastrarte mar adentro independientemente del resto de condiciones.
**Siempre se trata como aviso independiente.**

### Ola y período
Ola pequeña ≠ siempre cómoda.

Período:
- ≥ 7 s → fluido
- 5–7 s → normal
- 4–5 s → incómodo
- < 4 s → caótico

Ola + período define la "textura" del mar.

---

## 4. Variables del sistema

**Variables base** (entrada de Open-Meteo):
- `windKn` — viento en nudos
- `gustKn` — rachas en nudos
- `windDir` — dirección en grados
- `waveH` — altura de ola en metros
- `wavePer` — período en segundos

**Variables derivadas** (calculadas):
- `variabilidad = gustKn - windKn`
- `terral` — nivel 0–3 según dirección + viento + spot

**Eliminadas del cálculo:**
- Nubes — no afectan la experiencia en el agua

---

## 5. Perfiles de usuario

No se seleccionan. Se reflejan en el bloque "Para quién es" con texto específico para las condiciones del momento.

| Perfil | Viento | Características |
|---|---|---|
| Principiante | < 7 kn (mar abierto) | mar plano, sin rachas, sin terral |
| Intermedio | 8–15 kn | algo de movimiento, rachas moderadas |
| Avanzado | 15–20 kn | mar movido, rachas fuertes |
| Experto | > 20 kn | condiciones duras |

El texto no describe el perfil en abstracto — describe las condiciones concretas del día y quién puede manejarlo.

---

## 6. Sistema de estados (moods)

### 6.1 Los 5 estados

| Estado | Mood | Descripción |
|---|---|---|
| 1 | Piscina | Condiciones ideales, sin exigencia |
| 2 | Muy agradable | Cómodo, con posibles ligeras variaciones |
| 3 | Se puede salir | Requiere manejo activo, manejable |
| 4 | Exigente | Requiere habilidad, el agua castiga errores |
| 5 | No recomendable | Condiciones que superan lo aceptable |

### 6.2 Reglas de estado (completas)

**Estado 1 — Piscina**
Requiere TODAS las condiciones:
- viento ≤ 6 kn
- rachas ≤ 10 kn
- variabilidad < 4 kn
- ola ≤ 0.3 m
- período ≥ 7 s
- terral: nivel 0 (sin terral)

_Período ajustado a ≥7s por fuentes técnicas (Barrachou SUP, Islandeering): <5s ya es muy incómodo, el óptimo real es ≥10s. ≥7s es el mínimo para condiciones genuinamente fluidas._

**Estado 2 — Muy agradable**
- viento ≤ 10 kn
- rachas ≤ 16 kn
- variabilidad ≤ 6 kn
- ola ≤ 0.6 m
- período ≥ 5 s
- terral: máximo nivel 1 (leve)

_Justificación: rachas 16 kn con viento 10 = variabilidad 6 kn, que es "ligera variación". Período ≥5s mantiene el mar fluido. Ola 0.6m con buen período es cómoda._

**Estado 3 — Se puede salir**
- viento 10–15 kn
- rachas ≤ 22 kn
- variabilidad ≤ 10 kn
- ola ≤ 1.0 m
- período ≥ 4 s
- terral: máximo nivel 2 (no fuerte)

_Justificación: rachas 22 kn con viento 15 = variabilidad 7 kn, incómodo pero no inestable real. Período 4s es el mínimo aceptable. Ola 1m con período ≥4s es manejable para un intermedio._

**Estado 4 — Exigente**
- viento 15–20 kn
- rachas ≤ 28 kn
- variabilidad: sin límite (ya hay aviso activo)
- ola ≤ 1.5 m
- período ≥ 3 s
- terral: máximo nivel 2

_Justificación: rachas 28 kn con viento 20 = variabilidad 8 kn, inestable pero un avanzado puede manejarlo. Si período < 3s con ola > 0.5m, se degrada a "No recomendable"._

**Estado 5 — No recomendable**
Se activa si cualquiera de:
- viento > 20 kn
- rachas > 28 kn
- ola > 1.5 m
- período < 3 s + ola > 0.5 m
- tormenta (weathercode ≥ 95)
- terral nivel 3 (fuerte) + viento > 8 kn
- ≥ 2 avisos de nivel 3 simultáneos (regla de acumulación — ver §8)

---

## 7. Separación clave: estado ≠ riesgo

**Estado:** describe la experiencia general.
**Avisos:** describen lo que puede complicarla.

Son capas independientes. Un estado puede ser "Muy agradable" con un aviso activo (ej: viento suave pero rachas fuertes). El aviso no cambia el estado — lo matiza.

---

## 8. Sistema de avisos

### 8.1 Principio

Los avisos no describen el fenómeno — describen **la experiencia**.
No alarman innecesariamente. Siempre explican qué pasa y qué implica.

### 8.2 Triggers y niveles

**Rachas**
- Nivel 1: rachas 12–16 kn (se nota ligeramente)
- Nivel 2: rachas 16–22 kn (afecta la experiencia)
- Nivel 3: rachas > 22 kn (requiere experiencia)

**Variabilidad**
- Nivel 1: variabilidad 4–6 kn (se nota ligeramente)
- Nivel 2: variabilidad 6–10 kn (afecta la experiencia)
- Nivel 3: variabilidad > 10 kn (inestabilidad real)

**Mar incómodo**
- Se activa si: período < 5 s + ola > 0.5 m
- Nivel 1: período 4–5 s + ola 0.5–0.8 m
- Nivel 2: período 3–4 s + ola > 0.5 m
- Nivel 3: período < 3 s + ola > 0.5 m

**Terral** (siempre aviso independiente)
- Nivel 1 (leve): viento en rango offshore < 6 kn, rachas < 10 kn
- Nivel 2 (relevante): viento en rango offshore 6–10 kn, o rachas 10–16 kn
- Nivel 3 (fuerte): viento offshore > 10 kn, o rachas > 16 kn
- Modificador: +1 nivel si ola > 0.6 m y spot no protegido (máx nivel 3)

### 8.3 Regla de acumulación

Si hay ≥ 2 avisos de nivel 3 activos simultáneamente → el estado baja uno automáticamente.

_Esto evita incoherencias donde el estado dice "Exigente" pero la combinación de condiciones hace el agua realmente peligrosa._

---

## 9. Sistema de copy

**Reglas:**
- No usar lenguaje técnico sin traducir ("rachas", "variabilidad" → experiencia)
- Hablar en términos de: equilibrio, esfuerzo, comodidad
- No alarmar innecesariamente
- Siempre explicar: qué pasa + qué implica

**Lenguaje prohibido directamente:** "rachas de 15 nudos", "variabilidad de 10 kn", "período de 4 segundos"

**Lenguaje correcto:** "el viento empuja a ratos", "el mar tiene más movimiento de lo que parece", "las olas llegan irregulares"

---

## 10. Estructura UX

```
HEADER
  ← Nombre spot   [cambiar hora]

BLOQUE 1 — HERO
  Localización · Momento · Datos clave

BLOQUE 2 — DECISIÓN (unidad única)
  Mood
  Frase principal
  Narrativa inmediata
  (estado + explicación son inseparables)

BLOQUE 3 — AVISOS
  Solo si existen. Expandibles.

BLOQUE 4 — PARA QUIÉN ES
  Texto generativo: condiciones + quién puede manejarlo hoy

BLOQUE 5 — DETALLE TÉCNICO
  Expandible · Descriptivo · No alarmista
  4 métricas: viento, rachas, ola, período
```

---

## 11. Pipeline de construcción

```
getState(datos)          → estado 1–5
getWarnings(datos)       → lista de avisos activos con nivel
buildNarrative(datos, estado, warnings) → frase + narrativa coherente
getUserFit(estado, warnings) → texto "para quién es" con contexto real
buildTechnical(datos)    → 4 bloques expandibles
```

**Reglas de coherencia:**
- El técnico no contradice el estado
- El estado no oculta los avisos
- Los avisos no exageran
- Todo cuenta la misma historia

---

## 12. Ejemplo real validado

**Datos:** viento 5.4 kn · rachas 15.9 kn · variabilidad ~10 kn

**Resultado con el sistema:**
- Estado: **Muy agradable** (viento ≤10 kn, ola no especificada)
- Aviso activo: variabilidad nivel 3 (10 kn > umbral)
- Narrativa: "mar tranquilo, viento suave pero con cambios bruscos"
- Aviso: "a ratos el viento empuja bastante más — puede descolarte ligeramente"

_Este caso demuestra por qué el sistema actual (scoring ponderado) falla: viento 5.4 kn + rachas 15.9 kn daría score "bueno" sin ningún aviso sobre la inestabilidad real._

---

## 13. Mejoras incorporadas al diseño

**Sesgo conservador en bordes**
Cuando una variable está en el límite entre dos estados, redondear siempre hacia el estado más restrictivo. Para una app de seguridad en el agua, el coste de ser más restrictivo es bajo; el inverso, alto.

**Regla de acumulación** (ya en §8.3)
≥ 2 avisos nivel 3 = estado baja uno. Evita que el estado sea incongruente con la experiencia real.

**"Para quién es" generativo**
No describe el perfil en abstracto. Describe las condiciones concretas del día y quién puede manejarlo: "hoy es cómodo para intermedio o avanzado, pero un principiante va a sufrir con las rachas".

---

## 14. Sobre la variable "variabilidad"

`variabilidad = racha - viento` no existe como variable formalizada en literatura técnica de SUP (ni en ICF, ISA, Paddle UK ni ASI). Aparece de forma implícita en práctica de instructores — la regla no documentada es: "si la racha supera el viento sostenido en más de 5 kn, trata las condiciones un nivel por encima".

Cocodrift formaliza esto como variable propia con umbrales explícitos. No está respaldado por normativa — está respaldado por la física y por la lógica de lo que realmente experimenta el usuario en el agua. Es una decisión de diseño del producto, no un estándar externo.

---

## 15. Lo que NO hace Cocodrift (por diseño)

- No muestra datos para interpretar
- No requiere conocimiento técnico del usuario
- No tiene login ni historial
- No hace comparativas entre spots
- No usa nubes en el cálculo (no afectan la experiencia en el agua)
- No tiene notificaciones push (por ahora)
