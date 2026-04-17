# Disclaimers — Coco

_Este es el documento legal más urgente del proyecto._
_Debe estar activo ANTES de cualquier publicación pública._
_Última actualización: 2026-04-17_

---

## Por qué este documento es crítico

Coco interpreta datos del mar para ayudar a tomar decisiones que pueden implicar riesgo físico. Si alguien sale al agua porque la app dijo "bueno" y sufre un accidente, sin un disclaimer de responsabilidad claro existe exposición legal real para el desarrollador.

Este tipo de disclaimers es estándar en:
- Apps meteorológicas
- Apps de navegación
- Apps de actividades outdoor
- Apps de salud y fitness

No tenerlo no es una opción.

---

## Disclaimer de seguridad — Borrador

### Versión corta (para mostrar en la app)

> **Aviso importante:** Los datos que muestra Coco son orientativos y provienen de modelos de previsión meteorológica. Las condiciones reales del mar pueden diferir significativamente. Siempre evalúa las condiciones in situ antes de entrar al agua. El uso de esta app no sustituye el criterio personal ni la experiencia en el mar. El desarrollador no se responsabiliza de accidentes, daños o pérdidas derivados del uso de esta aplicación.

### Versión larga (para Privacy Policy / Terms of Service)

> **Limitación de responsabilidad — Actividades acuáticas**
>
> La información proporcionada por Coco (en adelante "la App") tiene carácter exclusivamente informativo y orientativo. Los datos meteorológicos y de estado del mar mostrados en la App proceden de fuentes de terceros (Open-Meteo y otras APIs) y están sujetos a márgenes de error inherentes a los modelos de previsión meteorológica.
>
> La App no garantiza la exactitud, completitud, actualidad ni fiabilidad de los datos mostrados. Las condiciones reales del mar, el viento y el clima pueden diferir significativamente de las previsiones mostradas.
>
> **El uso de la App no sustituye:**
> - La evaluación personal de las condiciones en el lugar
> - La experiencia y criterio del usuario en actividades acuáticas
> - El consejo de profesionales certificados
> - La consulta de fuentes oficiales de predicción meteorológica
>
> El desarrollador de la App no asume ninguna responsabilidad por accidentes, lesiones, daños materiales, pérdidas o perjuicios de cualquier naturaleza que puedan derivarse del uso de la información proporcionada por la App o de la práctica de actividades acuáticas basándose en dicha información.
>
> El usuario asume plena responsabilidad sobre sus decisiones y acciones en el agua.

---

## Dónde debe aparecer el disclaimer

### Obligatorio antes de publicar:

1. **En la app** — pantalla "Sobre Coco" o sección de información accesible desde cualquier pantalla principal
2. **En los Terms of Service** — sección de limitación de responsabilidad
3. **En la Privacy Policy** — referencia a la naturaleza informativa de los datos

### Recomendado:

4. **En la descripción de las stores** — versión muy corta: "Los datos son orientativos. Evalúa siempre las condiciones in situ."
5. **En el primer uso** — considerar un onboarding de una pantalla que el usuario tiene que aceptar explícitamente (especialmente si se añade login en v3)

### No recomendado (afecta UX):

- En la pantalla principal de resultados de forma prominente
- Popup en cada apertura
- Modal bloqueante recurrente

---

## Disclaimer de datos de terceros

También recomendado tener este texto visible (ya requerido por licencia Open-Meteo):

> Datos meteorológicos proporcionados por [Open-Meteo](https://open-meteo.com/) (CC Attribution 4.0). Búsqueda de ubicaciones: [OpenStreetMap](https://www.openstreetmap.org/) / Nominatim.

---

## Checklist legal — Fase 0

- [ ] Disclaimer de seguridad redactado (borrador arriba, revisar con abogado si escala)
- [ ] Disclaimer visible en la app (pantalla "Acerca de" o similar)
- [ ] Atribución a Open-Meteo visible
- [ ] Incluido en Terms of Service (ver `legal/terms-draft.md`)
- [ ] Incluido en Privacy Policy (ver `legal/privacy-policy-draft.md`)

---

## Nota sobre asesoría legal

Para la fase inicial (MVP sin monetización, audiencia pequeña), el borrador de arriba es suficiente. Si la app escala, tiene usuarios pagando, o se producen incidentes, se recomienda revisar con un abogado especializado en apps móviles o responsabilidad de producto. El coste de una revisión legal preventiva es infinitamente menor que el coste de un litigio.
