# Web to Native — PWA → Capacitor

_Plan para ir de web app a apps nativas en stores._
_Última actualización: 2026-04-17_

---

## Decisión tomada

**No se reescribe nada.** El código actual (HTML/CSS/JS) es la base.

El camino:
1. **PWA** — web app instalable desde el navegador. Sin stores.
2. **Capacitor** — envuelve la web app en una capa nativa. Permite publicar en App Store y Google Play sin reescribir.
3. **React Native / Flutter** — solo si hay tracción real y justificación. No es el plan.

---

## Paso 1: PWA (Progressive Web App)

### Qué es
Una web app que el usuario puede "instalar" desde el navegador como si fuera una app nativa. Aparece en la home screen, abre en fullscreen, funciona offline (si hay service worker).

### Qué hay que añadir

**1. manifest.json**

Crear `/manifest.json` en la raíz del proyecto:

```json
{
  "name": "Coco",
  "short_name": "Coco",
  "description": "¿Salgo al agua hoy?",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#314fff",
  "theme_color": "#314fff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**2. Enlazar manifest en index.html:**

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#314fff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Coco">
<link rel="apple-touch-icon" href="/assets/icons/icon-192.png">
```

**3. Service Worker básico (para que sea "installable" en Android):**

```javascript
// /sw.js
const CACHE_NAME = 'coco-v1';
const STATIC_ASSETS = ['/', '/css/styles.css', '/js/app.js', '/js/score.js', '/js/api.js', '/js/storage.js', '/js/wheel.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Solo cachear assets estáticos, no llamadas a APIs
  if (event.request.url.includes('open-meteo') || event.request.url.includes('nominatim')) {
    return; // No interceptar, dejar pasar
  }
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
```

**Registrar el Service Worker en app.js:**

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

**4. Iconos necesarios:**
- 192×192 px (Android)
- 512×512 px (Android splash)
- 512×512 maskable (Android adaptive icon)
- 180×180 px (Apple Touch Icon)

Con el cocodrilo como icono.

### Resultado de la PWA
- En Android: Chrome muestra banner "Añadir a pantalla de inicio" automáticamente
- En iOS: el usuario puede añadirla manualmente desde el menú compartir de Safari
- No aparece en stores (eso viene con Capacitor)

---

## Paso 2: Capacitor (hacia las stores)

### Qué es
Capacitor (de Ionic) es una capa que envuelve tu web app en una WebView nativa. El resultado es una app .ipa (iOS) y .apk/.aab (Android) que se puede publicar en las stores.

### Por qué Capacitor y no otras opciones
- No requiere reescribir nada — tu HTML/CSS/JS va dentro de la WebView
- Acceso a APIs nativas si es necesario (notificaciones push, cámara, geolocalización)
- Mantenido activamente por Ionic
- Usado en producción por muchas apps reales

### Setup inicial

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# Inicializar en el proyecto
npx cap init "Coco" "com.coco.app" --web-dir .

# Añadir plataformas
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

**capacitor.config.json:**

```json
{
  "appId": "com.coco.app",
  "appName": "Coco",
  "webDir": ".",
  "server": {
    "androidScheme": "https"
  }
}
```

### Workflow de desarrollo con Capacitor

```bash
# Después de hacer cambios en el código:
npx cap sync          # copia los cambios a ios/ y android/
npx cap open ios      # abre Xcode
npx cap open android  # abre Android Studio
```

### Requisitos para builds

**iOS:**
- Mac con Xcode instalado (obligatorio para builds iOS)
- Apple Developer account (99€/año)
- Certificados de signing configurados

**Android:**
- Android Studio
- Java/SDK configurados
- Google Play Developer account (25€ una vez)

### Posibles problemas al envolver con Capacitor

1. **Gestos que colisionan:** Los swipes horizontales (el carrusel de métricas) pueden colisionar con los gestos de navegación del sistema en iOS. Hay que testear y posiblemente ajustar `touch-action` CSS.

2. **Safe areas:** Ya están implementadas en el CSS (`env(safe-area-inset-*)`) — esto es buena señal.

3. **Rendimiento en WebView:** Generalmente bueno, pero animaciones muy complejas pueden ir peor que en Safari nativo. Hay que testear en dispositivo real.

4. **HTTPS en Android:** Capacitor usa HTTPS en Android por defecto. Las llamadas a la API deben ser HTTPS (Open-Meteo ya usa HTTPS).

5. **Permisos:** Si en el futuro se añade geolocalización o notificaciones push, hay que declarar los permisos en Info.plist (iOS) y AndroidManifest.xml.

---

## Checklist antes de publicar en stores

- [ ] PWA funcionando correctamente en móvil
- [ ] Iconos en todos los tamaños requeridos
- [ ] Nombre definitivo: Coco
- [ ] App ID registrado: `com.coco.app`
- [ ] Privacy policy publicada en URL accesible
- [ ] Terms of service publicados
- [ ] Disclaimer de seguridad visible en la app
- [ ] Atribución a Open-Meteo visible
- [ ] Testeado en dispositivo iOS real (no solo simulador)
- [ ] Testeado en dispositivo Android real
- [ ] Screenshots de store preparados (mínimo 3, recomendado 5)
- [ ] Descripción de store escrita en español e inglés
- [ ] Categoría elegida (Tiempo / Deportes / Utilidades)
- [ ] Palabras clave para ASO definidas

---

## Timeline estimado

```
Semana 1  │ PWA: manifest + service worker + iconos
Semana 2  │ Capacitor setup + primer build iOS
Semana 3  │ Testing en dispositivos reales, correcciones
Semana 4  │ Assets de store + descripción + screenshots
Semana 5  │ Submit App Store + Google Play
Semana 6+ │ Review (Apple: 1-21 días, Google: 1-7 días)
```

---

## Nota sobre geolocalización

La versión actual NO usa geolocalización (el usuario introduce la playa manualmente). Esto es una decisión consciente para reducir fricción y evitar el popup de permisos en el primer uso.

Si en el futuro se añade geolocalización (para sugerir la playa más cercana), eso requiere:
- Declarar el permiso en iOS/Android
- El popup de permiso aparece en el primer uso nativo
- En la web, el navegador también pide permiso
- Considerar si el beneficio justifica la fricción del permiso
