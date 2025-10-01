# Instrucciones para Agregar la Columna "isongoing" a la Tabla Team

## Descripción
Este script agrega una nueva columna `isongoing` a la tabla `team` en Supabase. Esta columna se usa junto con `isactive` para controlar qué equipos se muestran en el frontend.

## Lógica de Visualización
Un equipo se mostrará en el frontend SOLO si:
- `isactive = TRUE` 
- `isongoing = TRUE`

Ambas condiciones deben cumplirse para que el equipo sea visible.

## Pasos para Ejecutar el Script

### 1. Acceder a Supabase
1. Ve a https://supabase.com
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto de DisciplineRift

### 2. Abrir el Editor SQL
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en el botón **"+ New query"** para crear una nueva consulta

### 3. Ejecutar el Script
1. Abre el archivo `add-ongoing-column.sql` en tu editor de código
2. Copia todo el contenido del archivo
3. Pega el contenido en el editor SQL de Supabase
4. Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)

### 4. Verificar la Ejecución
Después de ejecutar el script, deberías ver un mensaje de éxito. Para verificar:

```sql
-- Verifica que la columna se creó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'team' AND column_name = 'isongoing';

-- Verifica que el índice se creó
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'team' AND indexname = 'idx_team_active_ongoing';

-- Verifica los valores de los equipos existentes
SELECT teamid, name, isactive, isongoing
FROM team
LIMIT 10;
```

### 5. Configurar Equipos
Después de ejecutar el script, todos los equipos existentes tendrán `isongoing = true` por defecto. 

Para ocultar un equipo del frontend, puedes:
```sql
-- Ocultar temporalmente un equipo (mantiene isactive=true pero isongoing=false)
UPDATE team SET isongoing = false WHERE teamid = 'ID_DEL_EQUIPO';

-- Desactivar completamente un equipo
UPDATE team SET isactive = false WHERE teamid = 'ID_DEL_EQUIPO';

-- Volver a mostrar un equipo
UPDATE team SET isongoing = true, isactive = true WHERE teamid = 'ID_DEL_EQUIPO';
```

## ¿Qué Hace el Script?

1. **Agrega la columna `isongoing`**: Crea una nueva columna booleana en la tabla `team`
2. **Establece valor por defecto**: Todos los equipos nuevos tendrán `isongoing = true` automáticamente
3. **Actualiza equipos existentes**: Establece `isongoing = true` para todos los equipos actuales
4. **Crea un índice**: Optimiza las consultas que filtran por `isactive` y `isongoing`
5. **Agrega restricción NOT NULL**: Asegura que la columna siempre tenga un valor

## Casos de Uso

### Equipo Activo y Visible
```sql
isactive = true, isongoing = true
```
✅ El equipo SE MUESTRA en el frontend

### Equipo Pausado Temporalmente
```sql
isactive = true, isongoing = false
```
❌ El equipo NO se muestra en el frontend (pero está activo en el sistema)

### Equipo Desactivado
```sql
isactive = false, isongoing = false
```
❌ El equipo NO se muestra en el frontend (completamente desactivado)

### Caso Inválido
```sql
isactive = false, isongoing = true
```
❌ El equipo NO se muestra en el frontend (debe estar activo para mostrarse)

## Cambios en el Código

Los siguientes archivos fueron modificados para implementar esta lógica:

1. **`lib/supabase-queries.ts`**
   - Función `getAllSchoolsTeamsAndSessions()`: Ahora filtra por `.eq("isongoing", true)`
   - Función `getTeamsBySchool()`: Ahora filtra por `.eq("isongoing", true)`
   - Función `getAllTeams()`: Ahora filtra por `.eq("isongoing", true)`

## Notas Importantes

- ⚠️ **Ejecuta este script solo UNA VEZ**. Si lo ejecutas múltiples veces, no causará errores gracias a las cláusulas `IF NOT EXISTS`, pero es innecesario.
- ✅ **No afecta datos existentes**: Todos los equipos actuales mantendrán sus registros y se establecerán como `isongoing = true` automáticamente.
- 🔄 **Compatibilidad**: El código frontend está listo y funcionará automáticamente después de ejecutar el script.

## Soporte

Si encuentras algún error al ejecutar el script, verifica:
1. Que tienes permisos de administrador en Supabase
2. Que estás en el proyecto correcto
3. Que la tabla `team` existe en tu base de datos
4. Revisa los mensajes de error en la consola del SQL Editor
