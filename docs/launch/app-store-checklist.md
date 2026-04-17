# App Store Checklist — Apple

_Última actualización: 2026-04-17_

---

## Requisitos previos

- [ ] Apple Developer Account activa (99€/año)
- [ ] Mac con Xcode instalado (versión reciente)
- [ ] Capacitor configurado y build iOS funcionando
- [ ] App testeada en dispositivo físico iOS (no solo simulador)
- [ ] Privacy policy publicada en URL pública
- [ ] Terms of Service publicados en URL pública
- [ ] Disclaimer de seguridad visible en la app

---

## App ID y certificados

- [ ] App ID registrado en Apple Developer: `com.coco.app`
- [ ] Bundle ID igual en Capacitor y en Apple Developer
- [ ] Certificates: Development + Distribution
- [ ] Provisioning Profiles configurados
- [ ] Signing configurado en Xcode

---

## Assets requeridos

### Icono de app
- [ ] 1024×1024 px (App Store — sin transparencia, sin redondeado manual, Apple lo aplica)
- [ ] Todos los tamaños para Xcode (se generan automáticamente con un generador de iconos desde el 1024px)

### Screenshots
- [ ] iPhone 6.7" (iPhone 14 Pro Max) — obligatorio
- [ ] iPhone 6.5" (iPhone 11/12/13 Pro Max) — obligatorio
- [ ] iPhone 5.5" (iPhone 8 Plus) — recomendado
- [ ] iPad Pro 12.9" — solo si tiene soporte iPad
- Mínimo 1 screenshot, máximo 10 por tamaño
- Formato: PNG o JPEG, sin bordes, sin marco de dispositivo (opcional pero recomendado)

### App Preview Video (opcional)
- Máximo 30 segundos
- Muestra la app en uso real

---

## Información de la app (App Store Connect)

- [ ] Nombre de la app: **Coco** (máx 30 caracteres)
- [ ] Subtítulo: máx 30 caracteres — ej: "¿Salgo al agua hoy?"
- [ ] Descripción: máx 4.000 caracteres — primer párrafo es lo más visible
- [ ] Palabras clave: máx 100 caracteres (separadas por comas, sin espacios)
  - Sugerencias: paddle surf, SUP, mar, olas, viento, surf, condiciones, playa, kayak, previsión
- [ ] URL de privacidad: link a privacy policy
- [ ] URL de soporte: email o web
- [ ] Categoría primaria: Tiempo o Deportes
- [ ] Categoría secundaria (opcional)
- [ ] Rating: seleccionar apropiado (sin contenido maduro → 4+)
- [ ] Precio: Gratis
- [ ] Disponibilidad: todos los países o selección

---

## Información de privacidad (requerida desde iOS 14)

Apple requiere declarar qué datos recoge la app:

- [ ] Datos recopilados: seleccionar categorías (si no se recoge nada, seleccionar "No se recopilan datos")
- [ ] Con Cloudflare Analytics sin cookies: se puede declarar "No se recopilan datos del usuario"
- [ ] Si se añade PostHog o similar: declarar datos de uso/diagnóstico

---

## Puntos críticos de revisión de Apple

Causas habituales de rechazo para apps como Coco:

### 1. Datos inexactos o engañosos (Guideline 5.1.1)
La descripción debe reflejar exactamente lo que hace la app. No prometer más de lo que entrega.

### 2. Apps de información de seguridad sin disclaimer (Guideline 1.4)
Apps que influyen en decisiones de seguridad física deben tener disclaimers claros. **El disclaimer de `legal/disclaimers.md` resuelve esto.**

### 3. UI/UX que no sigue las Human Interface Guidelines
- Touch targets mínimos: 44×44 pt
- Safe areas respetadas (ya implementado en el CSS)
- No usar gestos reservados del sistema (swipes desde bordes)

### 4. Crashes o bugs en review
Apple prueba la app. Si crashea durante el review, rechazo automático. Testear extensivamente antes del submit.

### 5. Metadata incompleta o incorrecta
Descripción que no coincide con lo que hace la app. Screenshots que muestran features no disponibles.

---

## Proceso de submit

1. Build en Xcode → Archive → Validate App
2. Upload to App Store Connect
3. En App Store Connect: completar toda la información
4. Submit for Review
5. Esperar: 1 día a 3 semanas (normalmente 24-48h)
6. Si hay rechazo: resolver el problema específico y re-submit

---

## Post-aprobación

- [ ] Verificar que la app live funciona en dispositivos reales
- [ ] Responder a primeras reseñas
- [ ] Monitorizar Crashes en Xcode Organizer o Crashlytics
