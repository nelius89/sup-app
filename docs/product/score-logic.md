# Lógica de score — Algoritmo de interpretación

_Última actualización: 2026-04-17_

---

## Cómo funciona el sistema actual

### 1. Datos de entrada (por franja horaria)

```
windKn      — velocidad del viento en nudos (promedio de la franja)
gustKn      — velocidad de rachas en nudos (promedio)
windDir     — dirección del viento en grados (promedio)
waveH       — altura de ola en metros (promedio)
wavePer     — período de ola en segundos (promedio)
cloudPct    — porcentaje de nubosidad (promedio)
weathercode — código de condición meteorológica (máximo del periodo — más pesimista)
tempC       — temperatura en grados Celsius (promedio)
```

### 2. Cálculo del score

```javascript
score = (
  scoreViento(windKn)  * 0.35 +   // 35% del score
  scoreOla(waveH)      * 0.35 +   // 35% del score
  scoreRacha(gustKn)   * 0.15 +   // 15% del score
  scorePeriodo(wavePer)* 0.10 +   // 10% del score
  scoreNubes(cloudPct) * 0.05     //  5% del score
)
// Resultado: 0-10
```

#### Sub-scores:

| Variable | 10 (perfecto) | 8 | 5 | 3 | 0 (peligroso) |
|----------|--------------|---|---|---|---------------|
| Viento | ≤6 kn | ≤10 kn | ≤14 kn | ≤19 kn | >19 kn |
| Ola | ≤0.3 m | ≤0.6 m | ≤1.0 m | ≤1.5 m | >1.5 m |
| Rachas | ≤8 kn | ≤12 kn | ≤16 kn | ≤20 kn | >20 kn |
| Período | ≥7 s | ≥5 s | ≥4 s | — | <4 s |
| Nubes | ≤20% | ≤50% | ≤80% | — | — |

### 3. Estado final

```
score ≥ 8.5 → "perfecto"
score ≥ 7.0 → "bueno"
score ≥ 5.0 → "aceptable"
score ≥ 3.0 → "complicado"
score < 3.0 → "no-salir"
weathercode ≥ 95 (tormenta) → "no-salir" (override)
```

### 4. Riesgo de terral (independiente del score)

```
Si windDir está entre offshore_range del spot (ej: 225-315° para Barcelona):
  windKn < 6 y gustKn < 10  → nivel 1 (leve)
  windKn > 10 o gustKn > 16 → nivel 3 (fuerte)
  resto                      → nivel 2 (relevante)

Si waveH > 0.6 m y spot no protegido: +1 nivel (máx 3)
```

---

## ⚠️ Hipótesis no validadas

El sistema actual es una **hipótesis de calibración**. Los pesos y umbrales NO han sido validados con usuarios reales de paddle surf en condiciones reales.

### Lo que podría estar mal

1. **El peso del viento (35%)** podría ser demasiado alto o bajo según condiciones locales
2. **Los umbrales de ola** están pensados para paddle surf — para surf o kayak serían diferentes
3. **El período de ola** puede no ser relevante para todos los spots (bahías protegidas vs mar abierto)
4. **La dirección del viento** solo afecta al terral, pero debería también afectar al score general (viento de cara vs a favor)
5. **La temperatura** no afecta al score — ¿debería? (hipotermia, comodidad)

### Cómo validarlo

- [ ] Compartir la app con 5-10 usuarios reales de paddle surf en condiciones variadas
- [ ] Pedirles que comparen la evaluación de Coco con su propia valoración al llegar a la playa
- [ ] Registrar discrepancias: ¿cuándo dice "bueno" y era malo? ¿cuándo dice "malo" y era bueno?
- [ ] Ajustar pesos basándose en el feedback real

---

## Posibles mejoras futuras

- **Score por deporte**: pesos diferentes para surf (ola más importante), kayak (corriente importa), kitesurf (viento es bueno)
- **Score por spot**: spots protegidos (bahías) toleran más viento que spots expuestos
- **Dirección del viento en el score**: viento offshore reduce puntos aunque sea suave
- **Calidad vs cantidad de ola**: el score actual mezcla altura y período pero no separa "buena ola de surf" de "ola peligrosa para SUP"
