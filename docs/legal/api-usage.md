# Condiciones de uso de APIs externas

_Última actualización: 2026-04-17_

---

## Open-Meteo

**Licencia:** Creative Commons Attribution 4.0 International (CC BY 4.0)
**URL:** https://open-meteo.com/en/terms

### Qué permite
- Uso libre para proyectos no comerciales
- Uso educativo y de investigación
- Proyectos personales y de código abierto

### Qué requiere
- **Atribución obligatoria:** Citar "Open-Meteo.com" de forma visible en la app
- Para uso comercial: contratar plan commercial

### Qué no permite (sin plan commercial)
- Apps con monetización (suscripciones, IAP, publicidad)
- Uso masivo sin acuerdo previo

### Qué debemos hacer
- [ ] Añadir atribución visible en la app: "Datos meteorológicos: Open-Meteo.com"
- [ ] Cuando la app monetice (fase 3): contratar plan commercial (~14€/mes)

---

## Nominatim / OpenStreetMap

**Licencia:** Nominatim Usage Policy
**URL:** https://operations.osmfoundation.org/policies/nominatim/

### Qué permite
- Uso gratuito para proyectos razonables
- Búsquedas de usuario (no automatizadas)

### Qué requiere
- User-Agent propio identificando la app (ya implementado)
- No superar 1 req/segundo
- No scraping masivo

### Qué no permite
- Uso en producción de alto volumen sin acuerdo
- Scraping de datos geográficos en bulk
- Almacenar resultados indefinidamente

### Qué debemos hacer
- [x] User-Agent configurado: `'SUP App (sup-app.pages.dev)'` — actualizar a `'Coco App (coco.app)'` cuando se cambie el dominio
- [ ] Monitorizar si hay errores 429 (rate limit)
- [ ] Si el volumen de búsquedas crece: migrar a Photon API (https://photon.komoot.io) — mismos datos OpenStreetMap, más permisiva para producción

### Atribución
Los datos de OpenStreetMap requieren atribución CC BY-SA:
> © Colaboradores de OpenStreetMap

---

## Atribución en la app — texto recomendado

En pantalla "Acerca de" o footer:

> Datos meteorológicos: [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0)
> Búsqueda de ubicaciones: © Colaboradores de [OpenStreetMap](https://www.openstreetmap.org)
