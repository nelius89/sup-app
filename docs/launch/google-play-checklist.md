# Google Play Checklist — Android

_Última actualización: 2026-04-17_

---

## Requisitos previos

- [ ] Google Play Developer Account (25€ — pago único)
- [ ] Android Studio instalado
- [ ] Capacitor configurado y build Android funcionando (AAB — Android App Bundle)
- [ ] App testeada en dispositivo físico Android (no solo emulador)
- [ ] Privacy policy publicada en URL pública
- [ ] Disclaimer de seguridad visible en la app

---

## App ID

- [ ] Application ID: `com.coco.app` (mismo que iOS)
- [ ] Coincidir en `capacitor.config.json` y `android/app/build.gradle`

---

## Assets requeridos

### Icono
- [ ] 512×512 px (PNG, 32-bit, sin fondo transparente en la versión de store)
- [ ] Adaptive icon: foreground 108dp, safe zone 72dp (para Android 8+)

### Screenshots
- [ ] Mínimo 2 screenshots de teléfono (máximo 8)
- [ ] Resolución mínima: 320px, máximo 3840px, ratio máximo 2:1
- [ ] Formato: JPEG o PNG 24-bit sin transparencia

### Feature Graphic
- [ ] 1024×500 px — banner que aparece en la ficha del Play Store
- [ ] Obligatorio

### App Preview Video (opcional)
- URL de YouTube

---

## Información en Play Console

- [ ] Nombre de la app: **Coco** (máx 30 caracteres)
- [ ] Descripción corta: máx 80 caracteres
- [ ] Descripción larga: máx 4.000 caracteres
- [ ] Categoría: Tiempo o Deportes
- [ ] Etiquetas (tags): hasta 5
- [ ] Clasificación de contenido: completar cuestionario (resultado esperado: Todos/Everyone)
- [ ] Precio: Gratis
- [ ] URL de privacidad: obligatoria
- [ ] Email de soporte: obligatorio

---

## Data Safety (requerido desde 2022)

Google requiere declarar qué datos recoge la app. Similar al nutrition label de Apple.

- [ ] Completar sección "Seguridad de los datos" en Play Console
- [ ] Con Cloudflare Analytics sin cookies: "No se recopilan datos"
- [ ] Si se añade PostHog: declarar datos de uso

---

## Ventajas vs Apple

- Review más rápido: generalmente 1-7 días (vs 1-21 días Apple)
- Menos restrictivo en primer review
- Sin necesidad de Mac para builds (aunque se recomienda)
- Sin fee anual (solo 25€ una vez)

---

## Proceso de submit

1. Build en Android Studio: `Build → Generate Signed Bundle/APK → Android App Bundle (AAB)`
2. Subir AAB a Play Console → Producción
3. Completar toda la información del store listing
4. Completar Data Safety
5. Submit for Review
6. Esperar aprobación

---

## Puntos a revisar antes de submit

- [ ] App no crashea en Android 10, 11, 12, 13
- [ ] Safe areas / notch / punch-hole camera no tapan contenido
- [ ] Los gestos de navegación de Android (back swipe) no colisionan con los de la app
- [ ] El carrusel de métricas (swipe horizontal) funciona bien junto con gestos del sistema
