# Storage — Local vs Cloud

_Última actualización: 2026-04-17_

---

## Estado actual (v1)

Todo en **localStorage** del dispositivo.

### Qué se guarda

```javascript
// Estructura en localStorage (key: 'sup-app')
{
  spots: [],           // spots añadidos por el usuario (máx 8)
  activeSpotId: '...',  // último spot consultado
  cache: {             // caché de API por spot
    'spot-id': {
      timestamp: 1234567890,
      marine: { ... },
      forecast: { ... }
    }
  }
}
```

### Límites del localStorage

| Límite | Valor |
|--------|-------|
| Capacidad | ~5MB por dominio |
| Número de spots | 8 usuario + 2 hardcoded = 10 máx |
| TTL de caché API | 60 minutos (luego se refresca) |

---

## Qué escala mal con localStorage

### 1. No sincroniza entre dispositivos
El usuario cambia de móvil y pierde todos sus spots. No hay recuperación posible.

**Impacto:** Molestia, no bloqueante. Aceptable en v1.
**Solución fase 3:** Cloud sync con login.

### 2. Safari puede limpiar los datos
En iOS con "Prevent Cross-Site Tracking" activo o en modo incógnito, el localStorage puede limpiarse. También si el usuario borra datos del navegador.

**Impacto:** Pérdida de spots guardados.
**Mitigación v1:** Considerar añadir un aviso sutil ("Tus spots se guardan en este dispositivo").

### 3. PWA instalada puede limpiar datos
Cuando se desinstala la PWA o se borra la caché, se puede perder el localStorage.

**Impacto:** Mismo que arriba.

### 4. No hay backup
Sin login, si se pierde el localStorage no hay recuperación.

---

## Decisiones para cada fase

### Fase 1 (ahora): localStorage
- Sin cambios
- Documentar limitación al usuario si procede
- No es un problema real hasta tener base de usuarios

### Fase 2 (stores): localStorage + mejor gestión
- La PWA/app nativa con Capacitor tiene su propio localStorage aislado
- Más estable que en navegador
- Aún sin sync entre dispositivos

### Fase 3 (login): migración a cloud
- Cuando el usuario crea cuenta, migrar sus spots de local a cloud
- Lógica: "Si tienes cuenta → sync automático. Si no → solo local."
- La migración debe ser transparente e imperceptible

### Implementación cloud (fase 3)

**Opción recomendada: Supabase**
- Free tier generoso (500MB base de datos, 50MB storage)
- Auth integrado
- SDK JavaScript directo
- Sin backend propio necesario

```javascript
// Ejemplo de estructura en Supabase
table: user_spots
  id: uuid
  user_id: uuid (FK → auth.users)
  spot_id: string
  name: string
  city: string
  lat: float
  lon: float
  offshore_range: jsonb
  created_at: timestamp

table: spot_cache
  spot_id: string
  data: jsonb
  updated_at: timestamp
```

---

## Lo que NO debe guardarse en localStorage

- Datos de pago o billing (nunca en cliente)
- Tokens de autenticación sensibles (usar cookies httpOnly o almacenamiento seguro nativo)
- Datos personales identificables (cuando haya login, usar Supabase/cloud)
