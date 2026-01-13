# Fix: Resume Bucket RLS Error

## Error
```
Failed to upload PDF: new row violates row-level security policy
```

## Causa
El bucket `resume` en Supabase Storage tiene **Row-Level Security (RLS) habilitado** sin las políticas correctas, bloqueando los uploads incluso con `supabaseAdmin`.

---

## Solución Paso a Paso

### Paso 1: Ir a Supabase Dashboard

1. Abre tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Ve a **Storage** en el menú lateral
3. Busca el bucket **`resume`**

### Paso 2: Verificar Configuración del Bucket

1. Haz clic en el bucket **`resume`**
2. Haz clic en los 3 puntos (...) → **Edit bucket**
3. Asegúrate que:
   - ✅ **Public bucket**: HABILITADO (ON)
   - ✅ **File size limit**: 10 MB o más
   - ✅ **Allowed MIME types**: `application/pdf` o dejarlo vacío

### Paso 3: Ejecutar SQL para Deshabilitar RLS

**Opción A: Deshabilitar RLS completamente (RECOMENDADO - MÁS SIMPLE)**

1. Ve a **SQL Editor** en el menú lateral de Supabase
2. Crea una nueva query
3. Copia y pega este SQL:

```sql
-- Deshabilitar RLS en storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Asegurar que el bucket es público
UPDATE storage.buckets
SET public = true
WHERE id = 'resume';
```

4. Haz clic en **RUN** o presiona `Ctrl/Cmd + Enter`
5. ✅ Deberías ver: "Success. No rows returned"

**Opción B: Mantener RLS con políticas (AVANZADO)**

Si prefieres mantener RLS habilitado con control granular:

```sql
-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Permitir todos los uploads al bucket 'resume'
CREATE POLICY "Allow public uploads to resume bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'resume');

-- Permitir todas las descargas del bucket 'resume'
CREATE POLICY "Allow public downloads from resume bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resume');

-- Permitir actualizaciones
CREATE POLICY "Allow public updates in resume bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'resume')
WITH CHECK (bucket_id = 'resume');

-- Permitir eliminaciones
CREATE POLICY "Allow public deletes in resume bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'resume');

-- Asegurar que el bucket es público
UPDATE storage.buckets
SET public = true
WHERE id = 'resume';
```

### Paso 4: Verificar la Solución

1. Prueba subir un resume desde el formulario "Join DR Team"
2. Debería funcionar sin errores
3. El archivo debería guardarse en el bucket `resume`
4. La ruta debería guardarse en la columna `resume` de la tabla `Drteam`

---

## Verificación Adicional

### Comprobar que RLS está deshabilitado:

```sql
-- Verificar estado de RLS en storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';
```

Deberías ver `rowsecurity = false` si usaste la Opción A.

### Comprobar políticas existentes:

```sql
-- Ver todas las políticas de storage
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## Troubleshooting

### Si aún no funciona:

1. **Verificar que el bucket existe:**
```sql
SELECT * FROM storage.buckets WHERE id = 'resume';
```

2. **Verificar permisos del Service Role Key:**
   - El `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` debe ser correcto
   - Debe tener permisos de admin

3. **Revisar logs del backend:**
   - Busca el mensaje de error completo en la consola
   - Puede haber información adicional sobre qué política está bloqueando

4. **Recrear el bucket:**
   - Si nada funciona, elimina y recrea el bucket `resume`
   - Configúralo como público desde el inicio
   - Ejecuta el SQL de RLS nuevamente

---

## Configuración Recomendada Final

```
Bucket: resume
├─ Public: ✅ YES
├─ File size limit: 10 MB
├─ Allowed MIME types: application/pdf (o vacío)
└─ RLS: ❌ DISABLED (Opción A)
```

O si usas Opción B:
```
Bucket: resume
├─ Public: ✅ YES
├─ File size limit: 10 MB
├─ Allowed MIME types: application/pdf (o vacío)
└─ RLS: ✅ ENABLED con 4 políticas (INSERT, SELECT, UPDATE, DELETE)
```

---

## Notas Importantes

- ⚠️ Con RLS deshabilitado, cualquiera puede subir archivos al bucket `resume`
- ✅ El backend ya valida PDFs y tamaños antes de subir
- ✅ El backend usa rutas únicas con timestamps para evitar conflictos
- ✅ Los archivos se organizan por `drteam/{applicationId}/{timestamp}-{filename}.pdf`

---

## Después de Aplicar la Solución

El formulario "Join DR Team" debería funcionar correctamente:
1. ✅ Usuarios pueden subir PDFs (opcional)
2. ✅ Backend valida el archivo
3. ✅ Se guarda en bucket `resume`
4. ✅ La ruta se guarda en tabla `Drteam`
5. ✅ El equipo recibe notificación con link al resume
