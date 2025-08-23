# 📄 Resume Upload System - Supabase Storage Integration

## 📋 Descripción General

Sistema implementado para subir archivos PDF de currículos al bucket público `resume` en Supabase Storage, integrado con el formulario de aplicación "Application Form".

## ✨ Características

### ✅ Subida Segura de PDF
- Endpoint API server-side `/api/apply` que maneja multipart/form-data
- Validaciones estrictas: solo PDF, máximo 10MB
- Subida a bucket público `resume` en Supabase Storage

### 🔒 Seguridad
- **Service Role Key** manejada únicamente del lado servidor
- No exposición de credenciales sensibles en el cliente
- Operaciones atómicas con rollback en caso de fallo

### 📊 Flujo Completo
1. **Validación**: Campos requeridos y archivo PDF válido
2. **Base de Datos**: Inserción en tabla `Drteam` con `resume = null`
3. **Storage**: Subida del PDF a `drteam/{id}/{timestamp}-{filename}`
4. **Actualización**: Guardado de ruta del archivo en BD
5. **Rollback**: Limpieza automática si falla cualquier paso

## 🛠️ Variables de Entorno Requeridas

Agregar al archivo `.env.local`:

```env
# Supabase Configuration (ya existentes)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### ⚠️ Notas Importantes
- `SUPABASE_SERVICE_ROLE_KEY` es **obligatorio** para las operaciones de Storage
- Esta clave **nunca** se expone en el cliente, solo se usa en API routes server-side

## 🎯 Endpoint API: `/api/apply`

### Método: POST
**Content-Type**: `multipart/form-data`

### Campos Requeridos:
- `firstName` (string): Nombre del aplicante
- `lastName` (string): Apellido del aplicante  
- `email` (string): Email de contacto
- `number` (string): Número de teléfono
- `currentAddre` (string): Dirección actual (mantiene typo de BD)
- `sport` (string): Deporte de interés
- `description` (string): Descripción/motivación
- `resume` (File): Archivo PDF del currículum

### Validaciones:
- **Tipo de archivo**: Solo `application/pdf`
- **Tamaño máximo**: 10MB
- **Campos obligatorios**: Todos los campos de texto y el archivo

### Respuestas:

#### ✅ Éxito (200)
```json
{
  "ok": true,
  "id": "uuid-del-registro",
  "resume_path": "drteam/uuid/timestamp-filename.pdf",
  "publicUrl": "https://supabase-url/storage/v1/object/public/resume/drteam/uuid/timestamp-filename.pdf"
}
```

#### ❌ Error de Validación (400/413/415)
```json
{
  "ok": false,
  "error": "Only PDF files are allowed"
}
```

#### ❌ Error Interno (500)
```json
{
  "ok": false,
  "error": "Failed to save application data"
}
```

## 🗄️ Estructura de Base de Datos

### Tabla: `public.Drteam`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | bigint | Primary key (auto-generado) |
| `firstName` | varchar | Nombre del aplicante |
| `lastName` | varchar | Apellido del aplicante |
| `email` | text | Email de contacto |
| `number` | varchar | Número de teléfono |
| `currentAddre` | varchar | Dirección (mantiene typo original) |
| `sport` | varchar | Deporte de interés |
| `description` | varchar | Descripción/motivación |
| `resume` | text | Ruta del archivo en Storage |

**Nota**: La tabla solo almacena la ruta del archivo. Los metadatos adicionales (tamaño, tipo MIME, fecha) se pueden obtener del Storage API de Supabase si es necesario.

## 📁 Estructura de Storage

### Bucket: `resume` (público)
```
resume/
└── drteam/
    └── {id}/
        └── {timestamp}-{filename-sanitizado}.pdf
```

### Ejemplo de Ruta:
```
drteam/550e8400-e29b-41d4-a716-446655440000/1704123456789-john-doe-resume.pdf
```

## 🔧 Configuración de Supabase

### Crear Bucket `resume`
```sql
-- Crear bucket público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resume', 'resume', true);
```

### Políticas de Storage (RLS)
```sql
-- Permitir inserción desde servidor (Service Role)
CREATE POLICY "Allow server upload" ON storage.objects
FOR INSERT TO service_role
WITH CHECK (bucket_id = 'resume');

-- Permitir lectura pública
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'resume');
```

## 📝 Uso del Sistema

### Frontend (React)
El formulario en `components/contact-section.tsx` ya está configurado para:
- Usar `encType="multipart/form-data"`
- Enviar archivos via `FormData`
- Manejar respuestas y errores apropiadamente

### Ejemplo de Integración:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  const formData = new FormData()
  
  // Agregar campos de texto
  formData.append('firstName', 'John')
  formData.append('lastName', 'Doe')
  // ... otros campos
  
  // Agregar archivo
  formData.append('resume', pdfFile)
  
  const response = await fetch('/api/apply', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  if (result.ok) {
    console.log('PDF accessible at:', result.publicUrl)
  }
}
```

## ⚡ Características de Rendimiento

### Sanitización de Nombres
- Nombres de archivo convertidos a minúsculas
- Caracteres especiales reemplazados por guiones
- Longitud máxima de 80 caracteres
- Timestamp para evitar conflictos

### Operaciones Atómicas
- Si falla la subida del PDF, se elimina automáticamente el registro de BD
- Si falla la actualización de BD, el archivo queda huérfano pero el proceso falla limpiamente
- Logging detallado para debugging

## 🧪 Testing

### 1. Verificar Configuración del Sistema
Antes de probar el formulario, verifica que todo esté configurado correctamente:

```bash
# Verificar configuración completa
GET http://localhost:3000/api/test-upload-system

# Probar upload real (archivo de prueba)
POST http://localhost:3000/api/test-upload-system
```

**Respuesta esperada de verificación:**
```json
{
  "success": true,
  "message": "Upload system is ready",
  "report": {
    "environment": {
      "supabaseUrl": true,
      "supabaseAnonKey": true,
      "supabaseServiceRoleKey": true
    },
    "database": {
      "drteamTableAccess": true
    },
    "storage": {
      "resumeBucketAccess": true,
      "bucketExists": true
    },
    "recommendations": ["✅ All systems ready! You can now test the upload functionality."]
  }
}
```

### 2. Casos de Prueba del Formulario
1. **Caso feliz**: PDF válido < 10MB → registro creado, archivo subido, ruta guardada
2. **Archivo muy grande**: PDF > 10MB → Error 413
3. **Tipo inválido**: Archivo .docx → Error 415
4. **Campo faltante**: Sin email → Error 400
5. **Sin archivo**: Solo campos de texto → Error 400

### 3. Verificación Manual con cURL
```bash
# Probar endpoint principal
curl -X POST http://localhost:3000/api/apply \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "number=+1234567890" \
  -F "currentAddre=123 Main St" \
  -F "sport=Volleyball" \
  -F "description=I want to coach" \
  -F "resume=@path/to/test.pdf"
```

### 4. Verificación en el Navegador
1. **Abrir**: `http://localhost:3000/#contact`
2. **Llenar formulario** con datos de prueba
3. **Seleccionar archivo PDF** < 10MB
4. **Enviar** y verificar respuesta
5. **Revisar consola** para logs detallados

## 🚨 Manejo de Errores

### Logging
- Todos los errores se logean con contexto
- IDs de registros incluidos para trazabilidad
- No se exponen credenciales en logs

### Recuperación
- Rollback automático en caso de fallo
- Mensajes de error claros para el usuario
- Operaciones idempotentes donde sea posible

## 🔄 Mantenimiento

### Limpieza de Archivos Huérfanos
Si por alguna razón quedan archivos sin registro en BD:

```sql
-- Encontrar registros sin archivo
SELECT id, resume FROM "Drteam" 
WHERE resume IS NULL OR resume = '';

-- Encontrar archivos huérfanos requiere script personalizado
-- comparando Storage con registros en BD
```

### Monitoreo
- Revisar logs de API para errores frecuentes
- Monitorear espacio usado en bucket `resume`
- Verificar que Service Role Key no esté cerca de expirar

---

## ✅ Criterios de Aceptación Cumplidos

- [x] Formulario permite adjuntar PDF
- [x] Archivo se sube a bucket `resume` público  
- [x] Tabla `Drteam` guarda ruta en columna `resume`
- [x] API devuelve `{ ok: true, id, resume_path, publicUrl }`
- [x] Rollback automático en caso de fallo
- [x] Service Role Key no expuesta en cliente
- [x] Validaciones de tipo y tamaño implementadas
- [x] Logging apropiado sin exponer credenciales
