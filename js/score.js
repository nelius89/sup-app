// ─────────────────────────────────────────
// SCORE — Sistema de diagnóstico
// ─────────────────────────────────────────

function kmhToKnots(kmh) {
  return kmh / 1.852;
}

function degreesToCardinal(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Devuelve nivel de riesgo terral: 0 (ninguno) · 1 (leve) · 2 (relevante) · 3 (desaconsejable)
function calcularRiesgoTerral(windKn, gustKn, windDir, waveH, spot) {
  const [min, max] = spot.offshore_range;
  if (windDir < min || windDir > max) return 0;

  let level;
  if (windKn < 6 && gustKn < 10) {
    level = 1;
  } else if (windKn > 10 || (gustKn > 16 && windKn >= 6)) {
    level = 3;
  } else {
    level = 2;
  }

  // Modificador de ola: +1 si ola > 0.6 m y spot no protegido
  if (waveH > 0.6 && !spot.protected) {
    level = Math.min(level + 1, 3);
  }

  return level;
}

// ── Sub-scores ──
function scoreViento(kn) {
  if (kn <= 6)  return 10;
  if (kn <= 10) return 8;
  if (kn <= 14) return 5;
  if (kn <= 19) return 3;
  return 0;
}

function scoreOla(m) {
  if (m <= 0.3) return 10;
  if (m <= 0.6) return 8;
  if (m <= 1.0) return 5;
  if (m <= 1.5) return 2;
  return 0;
}

function scoreRacha(kn) {
  if (kn <= 8)  return 10;
  if (kn <= 12) return 7;
  if (kn <= 16) return 4;
  if (kn <= 20) return 2;
  return 0;
}

function scorePeriodo(s) {
  if (s >= 7) return 10;
  if (s >= 5) return 8;
  if (s >= 4) return 6;
  return 3;
}

function scoreNubes(pct) {
  if (pct <= 20) return 10;
  if (pct <= 50) return 8;
  if (pct <= 80) return 6;
  return 5;
}

function calcularScore(viento_kn, ola_m, racha_kn, periodo_s, nubes_pct) {
  return (
    scoreViento(viento_kn)  * 0.35 +
    scoreOla(ola_m)         * 0.35 +
    scoreRacha(racha_kn)    * 0.15 +
    scorePeriodo(periodo_s) * 0.10 +
    scoreNubes(nubes_pct)   * 0.05
  );
}

// ── Estado según score ──
function getEstado(score, weathercode) {
  if (weathercode >= 95) return 'no-salir';
  if (score >= 8.5) return 'perfecto';
  if (score >= 7.0) return 'bueno';
  if (score >= 5.0) return 'aceptable';
  if (score >= 3.0) return 'complicado';
  return 'no-salir';
}

const ESTADOS = {
  'perfecto':   { titulo: 'Hoy es de los buenos',              subtitulo: 'Yo no me lo perdería' },
  'bueno':      { titulo: 'Hoy se puede salir',                subtitulo: 'Si te apetece, se está a gusto' },
  'aceptable':  { titulo: 'Hoy, depende...',                   subtitulo: 'Solo si estás acostumbrado' },
  'complicado': { titulo: 'Mejor otro día',                    subtitulo: 'Hoy lo dejaría' },
  'no-salir':   { titulo: 'Hoy mejor quedarse en casa',        subtitulo: 'No está el agua para nadie' },
};

// ── Textos cortos para pantalla principal (1 línea por bloque) ──
function buildMainBlocks(d) {
  let windShort;
  if      (d.windKn <= 6)  windShort = 'Viento suave.';
  else if (d.windKn <= 10) windShort = 'Brisa ligera.';
  else if (d.windKn <= 14) windShort = 'Viento moderado.';
  else if (d.windKn <= 19) windShort = 'Viento fuerte.';
  else                     windShort = 'Viento muy fuerte.';

  let seaShort;
  if      (d.waveH <= 0.3) seaShort = 'Olas muy pequeñas.';
  else if (d.waveH <= 0.6) seaShort = 'Olas pequeñas.';
  else if (d.waveH <= 1.0) seaShort = 'Olas medianas.';
  else if (d.waveH <= 1.5) seaShort = 'Olas grandes.';
  else                     seaShort = 'Mar muy agitado.';

  return { windShort, seaShort };
}

// ── Textos técnicos para el sheet expandido (3 párrafos por métrica) ──
function buildTechBlocks(d, estado) {
  // Viento
  let windP1, windP2, windP3;
  if (d.windKn <= 6) {
    windP1 = 'El viento es muy suave. Apenas lo notarás al remar.';
    windP2 = 'El mar se mantiene cómodo y fácil de controlar.';
    windP3 = 'Por debajo de 6 nudos suele hablarse de calma. Ahora mismo estás en ese rango.';
  } else if (d.windKn <= 10) {
    windP1 = 'El viento sopla con brisa ligera. Se nota al remar, pero no molesta.';
    windP2 = 'Las condiciones son manejables y el esfuerzo, normal.';
    windP3 = 'Entre 7 y 10 nudos es brisa ligera. Cómodo para paddle surf.';
  } else if (d.windKn <= 14) {
    windP1 = 'El viento es moderado. Remar contra él ya empieza a costar.';
    windP2 = 'Notarás el esfuerzo en la vuelta si el viento está en contra.';
    windP3 = 'Entre 11 y 14 nudos el viento empieza a condicionar la salida.';
  } else if (d.windKn <= 19) {
    windP1 = 'El viento es fuerte. Puede cansarte rápido y complicar el control de la tabla.';
    windP2 = 'Si el viento sopla contra ti, volver puede ser muy difícil.';
    windP3 = 'Por encima de 15 nudos las condiciones se complican para SUP recreativo.';
  } else {
    windP1 = 'El viento es demasiado fuerte para estar en el agua.';
    windP2 = 'Una racha puede echarte al agua lejos de la orilla.';
    windP3 = 'Por encima de 20 nudos no es seguro salir en tabla.';
  }

  // Rachas
  let gustP1, gustP2, gustP3;
  if (d.gustKn <= 8) {
    gustP1 = 'Las rachas son muy leves. El viento es estable y constante.';
    gustP2 = 'No habrá sorpresas ni empujones bruscos.';
    gustP3 = 'Poca diferencia entre viento base y rachas: el viento es muy regular.';
  } else if (d.gustKn <= 12) {
    gustP1 = 'Hay alguna racha puntual. El viento base sigue siendo estable.';
    gustP2 = 'Pueden pillarte descolocado de vez en cuando, sin ser peligroso.';
    gustP3 = 'Diferencia moderada entre base y rachas. Normal en condiciones costeras.';
  } else if (d.gustKn <= 16) {
    gustP1 = 'Las rachas son fuertes y pueden sorprenderte aunque el viento base sea suave.';
    gustP2 = 'Pueden desestabilizarte. Mantén una posición baja en la tabla.';
    gustP3 = 'Diferencia importante entre base y rachas. Hay que estar atento.';
  } else {
    gustP1 = 'Las rachas son peligrosas incluso si el viento base parece tranquilo.';
    gustP2 = 'Una racha puede empujarte hacia mar abierto o echarte al agua.';
    gustP3 = 'Diferencia muy alta entre base y rachas. No es seguro sin mucha experiencia.';
  }

  // Ola
  let seaP1, seaP2, seaP3;
  if (d.waveH <= 0.3) {
    seaP1 = 'Las olas son muy pequeñas. El mar está casi plano.';
    seaP2 = 'El equilibrio es fácil y el esfuerzo para mantenerte de pie es mínimo.';
    seaP3 = 'Por debajo de 0.3 m el mar se considera plano. Condiciones ideales.';
  } else if (d.waveH <= 0.6) {
    seaP1 = 'Las olas son pequeñas. Habrá algo de balanceo, pero controlable.';
    seaP2 = 'Con estas olas el equilibrio no es difícil para alguien con algo de práctica.';
    seaP3 = 'Entre 0.3 y 0.6 m hay movimiento, pero no es preocupante.';
  } else if (d.waveH <= 1.0) {
    seaP1 = 'Las olas son medianas. El mar tiene movimiento real.';
    seaP2 = 'Mantener el equilibrio requiere concentración y algo de técnica.';
    seaP3 = 'Por encima de 0.6 m las condiciones ya se notan. Para quienes tienen práctica.';
  } else if (d.waveH <= 1.5) {
    seaP1 = 'Las olas son grandes. El mar está agitado.';
    seaP2 = 'Mantenerse de pie es difícil. Solo apto para remadores con experiencia.';
    seaP3 = 'Por encima de 1 m no se recomienda para paddle surf recreativo.';
  } else {
    seaP1 = 'Las olas son peligrosas para hacer paddle surf.';
    seaP2 = 'El riesgo de caer y alejarse de la orilla es muy alto.';
    seaP3 = 'Por encima de 1.5 m el mar no es apto para actividades recreativas.';
  }

  // Período
  let perP1, perP2, perP3;
  if (d.wavePer >= 7) {
    perP1 = 'Las olas tienen un ritmo largo y ordenado.';
    perP2 = 'Un período largo hace las olas más predecibles y fáciles de leer.';
    perP3 = 'Por encima de 7 s se considera oleaje organizado. Fácil de manejar.';
  } else if (d.wavePer >= 5) {
    perP1 = 'El mar tiene un ritmo normal. Las olas son manejables.';
    perP2 = 'Ni demasiado caótico ni demasiado organizado.';
    perP3 = 'Entre 5 y 7 s es un período normal. El mar se mantiene predecible.';
  } else if (d.wavePer >= 4) {
    perP1 = 'Las olas tienen un ritmo algo irregular.';
    perP2 = 'El mar puede sorprenderte de vez en cuando.';
    perP3 = 'Por debajo de 5 s las olas son más cortas e impredecibles.';
  } else {
    perP1 = 'El mar está nervioso y con olas muy cortas.';
    perP2 = 'Este tipo de oleaje hace difícil mantener el equilibrio.';
    perP3 = 'Por debajo de 4 s el mar está muy revuelto. Condiciones complicadas.';
  }

  const cierres = {
    'perfecto':   'En conjunto, es un buen día para salir con comodidad.',
    'bueno':      'En conjunto, las condiciones acompañan. Puedes salir sin problema.',
    'aceptable':  'En conjunto, las condiciones tienen sus límites. Elige bien el momento.',
    'complicado': 'En conjunto, hoy no es el mejor día. Mejor esperar.',
    'no-salir':   'En conjunto, hoy no es el día para salir al agua.',
  };

  return {
    wind:   { p1: windP1, p2: windP2, p3: windP3 },
    gusts:  { p1: gustP1, p2: gustP2, p3: gustP3 },
    sea:    { p1: seaP1,  p2: seaP2,  p3: seaP3  },
    period: { p1: perP1,  p2: perP2,  p3: perP3  },
    closing: cierres[estado],
  };
}

// ── Resumen corto para la pantalla principal (2-3 frases) ──
function buildSummary(d, estado) {
  // Viento — intensidad + estabilidad en una sola frase
  let wind;
  if      (d.windKn <= 6  && d.gustKn <= 8)  wind = 'Viento muy suave y constante.';
  else if (d.windKn <= 6  && d.gustKn <= 12) wind = 'Viento suave, con alguna racha.';
  else if (d.windKn <= 6)                    wind = 'Viento suave pero rachas notables.';
  else if (d.windKn <= 10 && d.gustKn <= 12) wind = 'Brisa ligera, bastante estable.';
  else if (d.windKn <= 10)                   wind = 'Brisa ligera con rachas.';
  else if (d.windKn <= 14)                   wind = 'Viento moderado. Remar cuesta.';
  else if (d.windKn <= 19)                   wind = 'Viento fuerte.';
  else                                        wind = 'Viento muy fuerte.';

  // Mar — ola + período en una sola frase
  let sea;
  if      (d.waveH <= 0.3 && d.wavePer >= 5)  sea = 'Mar plano y tranquilo.';
  else if (d.waveH <= 0.3)                     sea = 'Mar plano pero algo nervioso.';
  else if (d.waveH <= 0.6 && d.wavePer >= 5)  sea = 'Olas muy pequeñas y ordenadas.';
  else if (d.waveH <= 0.6)                     sea = 'Olas pequeñas, algo irregulares.';
  else if (d.waveH <= 1.0 && d.wavePer >= 5)  sea = 'Olas medias, mar movido.';
  else if (d.waveH <= 1.0)                     sea = 'Mar movido y algo agitado.';
  else if (d.waveH <= 1.5)                     sea = 'Olas grandes. Equilibrio difícil.';
  else                                          sea = 'Mar muy movido.';

  const cierres = {
    'perfecto':   'Condiciones ideales para salir.',
    'bueno':      'Condiciones cómodas en general.',
    'aceptable':  'Puedes salir, pero con atención.',
    'complicado': 'Condiciones exigentes hoy.',
    'no-salir':   'Mejor no meterse hoy.',
  };

  return `${wind} ${sea} ${cierres[estado]}`;
}

// ── Bloques interpretativos para el sheet (viento unificado + mar unificado) ──
// Devuelve { windTitle, windDesc, seaTitle, seaDesc, closing }
function buildBlocks(d, estado) {
  // Bloque viento — intensidad + rachas en título y consecuencia separados
  let windTitle, windDesc;
  if      (d.windKn <= 6  && d.gustKn <= 8)  { windTitle = 'El viento sopla muy suave y constante.';              windDesc = 'No lo vas a notar al remar.'; }
  else if (d.windKn <= 6  && d.gustKn <= 12) { windTitle = 'El viento sopla suave, con alguna racha puntual.';    windDesc = 'Nada que vaya a molestarte al remar.'; }
  else if (d.windKn <= 6)                    { windTitle = 'El viento base es suave, pero las rachas son notables.'; windDesc = 'Vigila los empujones bruscos que pueden pillarte descolocado.'; }
  else if (d.windKn <= 10 && d.gustKn <= 12) { windTitle = 'Hay una brisa ligera y bastante estable.';            windDesc = 'Se nota un poco al remar, pero no molesta.'; }
  else if (d.windKn <= 10)                   { windTitle = 'Hay una brisa ligera con algunas rachas.';            windDesc = 'Puede pillarte descolocado de vez en cuando.'; }
  else if (d.windKn <= 14 && d.gustKn <= 16) { windTitle = 'Viento moderado, sin rachas muy bruscas.';            windDesc = 'Remar contra él empieza a costar. Exige más esfuerzo.'; }
  else if (d.windKn <= 14)                   { windTitle = 'Viento moderado con rachas fuertes.';                 windDesc = 'Puede desestabilizarte con facilidad. Mantén una posición baja.'; }
  else if (d.windKn <= 19)                   { windTitle = 'El viento fuerte va a cansarte rápido.';              windDesc = 'Las rachas pueden tirarte o alejarte sin que te des cuenta.'; }
  else                                        { windTitle = 'El viento es demasiado fuerte para salir.';          windDesc = 'No es seguro estar en el agua con estas condiciones.'; }

  // Bloque mar — ola + período en título y consecuencia separados
  let seaTitle, seaDesc;
  if      (d.waveH <= 0.3 && d.wavePer >= 5)  { seaTitle = 'Las olas son muy pequeñas y el mar está tranquilo.';    seaDesc = 'Apenas notarás movimiento. Como remar en una piscina.'; }
  else if (d.waveH <= 0.3)                     { seaTitle = 'El mar está plano, con olas cortas y algo nerviosas.';  seaDesc = 'Puede haber algún movimiento irregular puntual.'; }
  else if (d.waveH <= 0.6 && d.wavePer >= 5)  { seaTitle = 'Las olas son pequeñas y llevan un ritmo ordenado.';     seaDesc = 'Habrá algo de balanceo, pero predecible y fácil de manejar.'; }
  else if (d.waveH <= 0.6)                     { seaTitle = 'Olas pequeñas con un ritmo algo irregular.';            seaDesc = 'Puede haber algún movimiento inesperado de vez en cuando.'; }
  else if (d.waveH <= 1.0 && d.wavePer >= 5)  { seaTitle = 'Hay movimiento real, con olas medias y ritmo regular.'; seaDesc = 'Necesitarás equilibrio. El mar está vivo pero predecible.'; }
  else if (d.waveH <= 1.0)                     { seaTitle = 'Mar movido, con olas medias y ritmo irregular.';        seaDesc = 'Mantenerse de pie exige concentración. Espera sorpresas.'; }
  else if (d.waveH <= 1.5)                     { seaTitle = 'Las olas son grandes y el mar está agitado.';           seaDesc = 'Difícil mantenerse estable. Solo para remadores con experiencia.'; }
  else                                          { seaTitle = 'El mar está muy movido y las olas son peligrosas.';    seaDesc = 'No apto para paddle surf recreativo hoy.'; }

  const cierres = {
    'perfecto':   'Un día ideal para salir y disfrutar sin esfuerzo.',
    'bueno':      'Un buen día para salir. Las condiciones acompañan.',
    'aceptable':  'Puedes salir, pero necesitarás más atención de lo habitual.',
    'complicado': 'No es un buen día para la tabla. Mejor esperarlo en tierra.',
    'no-salir':   'Hoy es mejor quedarse en tierra.',
  };

  return { windTitle, windDesc, seaTitle, seaDesc, closing: cierres[estado] };
}

// ── Etiquetas métricas ──
function labelViento(kn) {
  if (kn <= 6)  return { label: 'Calma total',     phrase: 'No lo notarás ni en el pelo.' };
  if (kn <= 10) return { label: 'Brisa ligera',    phrase: 'Se nota pero no molesta.' };
  if (kn <= 14) return { label: 'Viento moderado', phrase: 'Remar contra él ya cuesta.' };
  if (kn <= 19) return { label: 'Viento fuerte',   phrase: 'El mar está revuelto.' };
  return        { label: 'Demasiado viento',        phrase: 'No es seguro estar en el agua.' };
}

function labelOla(m) {
  if (m <= 0.3) return { label: 'Plana',       phrase: 'Como una piscina. Sin movimiento.' };
  if (m <= 0.6) return { label: 'Pequeña',     phrase: 'Algo de balanceo. Agradable.' };
  if (m <= 1.0) return { label: 'Mediana',     phrase: 'Te mueve. Necesitas equilibrio.' };
  if (m <= 1.5) return { label: 'Grande',      phrase: 'Difícil mantenerse de pie.' };
  return        { label: 'Muy grande',          phrase: 'Peligroso para SUP recreativo.' };
}

function labelRacha(kn) {
  if (kn <= 8)  return { label: 'Estable',          phrase: 'Sin sorpresas. El viento es constante.' };
  if (kn <= 12) return { label: 'Alguna racha',      phrase: 'Pequeños empujones puntuales.' };
  if (kn <= 16) return { label: 'Rachas fuertes',    phrase: 'Pueden pillarte descolocado.' };
  return        { label: 'Rachas peligrosas',         phrase: 'Una racha puede echarte al agua lejos de la orilla.' };
}

function labelPeriodo(s) {
  if (s <= 3) return { label: 'Ola caótica',    phrase: 'Corta y desordenada. El mar está nervioso.' };
  if (s <= 6) return { label: 'Ola normal',     phrase: 'Ritmo normal. Manejable.' };
  return      { label: 'Ola organizada',         phrase: 'Ola larga y predecible. La mejor.' };
}

function labelTemp(c) {
  if (c <= 16) return 'Fresquito';
  if (c <= 20) return 'Templado';
  if (c <= 25) return 'Agradable';
  if (c <= 30) return 'Calor';
  return 'Mucho calor';
}

function labelDireccion(degrees) {
  const card = degreesToCardinal(degrees);
  // Onshore para BCN/Badalona: viento del E/SE (llega del mar)
  // Offshore: O/NO [225-315]
  if (degrees >= 225 && degrees <= 315) {
    return { label: `${card} · Viento terral`, phrase: 'Parece tranquilo pero te aleja del mar. ¡Cuidado!' };
  }
  if ((degrees >= 45 && degrees <= 135)) {
    return { label: `${card} · Viento de mar`, phrase: 'Empuja hacia la orilla. Sin riesgo de alejarte.' };
  }
  return { label: `${card} · Lateral`, phrase: 'El más neutro. Solo vigila la deriva.' };
}
