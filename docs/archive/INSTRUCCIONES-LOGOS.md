# 🎨 Guía para Configurar Logos de Equipos

## 📦 Estructura Actual

- **Bucket:** `team-logo`
- **Carpeta:** `teams`
- **Tabla:** `team`
- **Columna:** `logo`

## 🔧 Pasos de Configuración

### 1️⃣ Ejecutar Script SQL

Ve a tu dashboard de Supabase → SQL Editor y ejecuta el archivo:
```
lib/setup-team-logos.sql
```

Este script:
- ✅ Verifica/crea la columna `logo` en la tabla `team`
- ✅ Verifica/crea el bucket `team-logo`
- ✅ Configura el bucket como público
- ✅ Configura las políticas de acceso

### 2️⃣ Verificar Diagnóstico

Ejecuta en tu navegador:
```
http://localhost:3000/api/debug-teams
```

Esto te mostrará:
- Qué buckets existen
- Si la columna `logo` existe
- Qué archivos hay en `team-logo/teams`
- Qué equipos tienen logos configurados

### 3️⃣ Formato de URL Correcto

Las URLs en la columna `logo` deben seguir este formato EXACTO:

```
https://[TU-PROJECT-ID].supabase.co/storage/v1/object/public/team-logo/teams/[NOMBRE-ARCHIVO]
```

**Ejemplos válidos:**
```
https://abcdefgh.supabase.co/storage/v1/object/public/team-logo/teams/logo-volleyball.png
https://abcdefgh.supabase.co/storage/v1/object/public/team-logo/teams/equipo-1.jpg
https://abcdefgh.supabase.co/storage/v1/object/public/team-logo/teams/team-logo.webp
```

### 4️⃣ Cómo Obtener la URL Correcta

#### Opción A: Desde el Dashboard de Supabase

1. Ve a **Storage** en tu dashboard
2. Abre el bucket `team-logo`
3. Navega a la carpeta `teams`
4. Haz clic en el archivo de imagen
5. Copia la **URL pública** que aparece
6. Pega esa URL en la columna `logo` del equipo correspondiente

#### Opción B: Construir la URL Manualmente

Si tu proyecto es `abcdefgh.supabase.co` y subiste `logo-equipo-1.png` en la carpeta `teams`:

```
https://abcdefgh.supabase.co/storage/v1/object/public/team-logo/teams/logo-equipo-1.png
```

### 5️⃣ Actualizar la Base de Datos

Una vez que tengas las imágenes subidas y las URLs, actualiza la tabla:

```sql
-- Ejemplo para un equipo específico
UPDATE public.team 
SET logo = 'https://tu-proyecto.supabase.co/storage/v1/object/public/team-logo/teams/logo-equipo-1.png'
WHERE teamid = 'id-del-equipo';

-- O actualizar varios equipos
UPDATE public.team 
SET logo = 'https://tu-proyecto.supabase.co/storage/v1/object/public/team-logo/teams/logo-volleyball.png'
WHERE name = 'Varsity Volleyball';
```

## 🚨 Checklist de Verificación

Marca cada punto cuando lo completes:

- [ ] Script SQL ejecutado sin errores
- [ ] Columna `logo` existe en tabla `team` (verificar en Table Editor)
- [ ] Bucket `team-logo` existe (verificar en Storage)
- [ ] Bucket `team-logo` es público (verificar en Storage → Settings)
- [ ] Carpeta `teams` existe dentro del bucket
- [ ] Imágenes subidas en `team-logo/teams/`
- [ ] URLs copiadas y pegadas en la columna `logo`
- [ ] Endpoint `/api/debug-teams` muestra datos correctos
- [ ] Frontend muestra las imágenes

## 🔍 Problemas Comunes

### Problema 1: Las imágenes no aparecen
**Causa:** URLs incorrectas o bucket no público

**Solución:**
1. Verifica que la URL comience con `https://` y contenga `/storage/v1/object/public/`
2. Verifica que el bucket sea público en Storage → Settings
3. Ejecuta el script SQL nuevamente

### Problema 2: Error 404 en las imágenes
**Causa:** Archivo no existe en la ruta especificada

**Solución:**
1. Verifica que el archivo exista en `team-logo/teams/`
2. Verifica que el nombre del archivo en la URL coincida exactamente (case-sensitive)

### Problema 3: La columna `logo` no existe
**Causa:** La columna no fue creada

**Solución:**
1. Ejecuta el script SQL `lib/setup-team-logos.sql`
2. O ejecuta manualmente: `ALTER TABLE public.team ADD COLUMN logo TEXT;`

### Problema 4: Acceso denegado
**Causa:** Políticas RLS bloqueando acceso

**Solución:**
1. Ejecuta el script SQL para configurar políticas
2. O desactiva RLS: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`

## 📊 Ejemplo Completo

### Estructura en Supabase Storage:
```
team-logo/
└── teams/
    ├── volleyball-team.png
    ├── tennis-team.jpg
    └── pickleball-team.webp
```

### Datos en la tabla `team`:
```sql
teamid | name              | logo
-------|-------------------|--------------------------------------------------
001    | Varsity Volleyball| https://abc.supabase.co/storage/v1/object/public/team-logo/teams/volleyball-team.png
002    | Tennis Elite      | https://abc.supabase.co/storage/v1/object/public/team-logo/teams/tennis-team.jpg
003    | Pickleball Pro    | https://abc.supabase.co/storage/v1/object/public/team-logo/teams/pickleball-team.webp
```

### Resultado en el Frontend:
- En la sección de registro: logos de 48x48px al lado del nombre
- En la sección de servicios: logos de 200x400px como imagen principal

## 🎯 Siguiente Paso

Ejecuta el endpoint de diagnóstico y comparte los resultados:
```
http://localhost:3000/api/debug-teams
```

Esto me ayudará a identificar exactamente qué falta configurar.













