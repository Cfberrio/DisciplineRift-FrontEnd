# 🚀 Configuración del Sistema de Mensajería

## Paso 1: Crear la Tabla en Supabase

### Opción A: Usando el SQL Editor (Recomendado)

1. **Abre tu Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega al SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Copia el SQL**
   - Abre el archivo `lib/create-message-table.sql`
   - Copia TODO el contenido

4. **Pega y Ejecuta**
   - Pega el SQL en el editor
   - Haz clic en "Run" o presiona `Ctrl/Cmd + Enter`
   - Deberías ver: "Success. No rows returned"

### Opción B: SQL Rápido (Versión Mínima)

Si solo quieres lo esencial, ejecuta esto:

```sql
CREATE TABLE IF NOT EXISTS public.message (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teamid UUID NOT NULL REFERENCES team(teamid),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach')),
  parentid UUID REFERENCES parent(parentid),
  coachid UUID REFERENCES staff(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_teamid ON public.message(teamid);
CREATE INDEX idx_message_created_at ON public.message(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE message;
```

## Paso 2: Habilitar Realtime

### Método 1: Desde Database → Replication

1. Ve a: **Database** → **Replication**
2. En la sección "Supabase Realtime", busca la tabla `message`
3. Haz clic en el toggle para habilitarla
4. Asegúrate de que esté activada (color verde)

### Método 2: Verificar con SQL

Ejecuta esta query para verificar:

```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'message';
```

Debería devolver una fila con la tabla `message`.

## Paso 3: Verificar la Configuración

### Ejecutar Diagnóstico

```bash
npm run diagnose-message-table
```

Este comando te dirá:
- ✅ Si la tabla existe
- ✅ Si tiene la estructura correcta
- ✅ Qué columnas faltan (si aplica)

### Ejecutar Test Rápido

```bash
npm run test:messaging:quick
```

Resultado esperado:
```
✅ Conexión OK
✅ Tabla message OK
✅ Estructura OK
✨ ¡SISTEMA LISTO!
```

### Ejecutar Tests Completos

```bash
npm run test:messaging
```

Esto ejecuta TODOS los tests y genera un reporte detallado.

## Paso 4: Probar en el Navegador

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Navegar a:**
   ```
   http://localhost:3000/dashboard/login
   ```

3. **Iniciar sesión** con una cuenta de parent que tenga students registrados

4. **Ir a Messages:**
   ```
   http://localhost:3000/dashboard/messages
   ```

5. **Verificar:**
   - [ ] Ves la página de Messages en el navbar
   - [ ] Puedes seleccionar un team del dropdown
   - [ ] Puedes escribir un mensaje
   - [ ] El mensaje aparece inmediatamente (optimistic update)

## Solución de Problemas

### Error: "column message.id does not exist"

**Causa:** La tabla tiene una estructura diferente o incompleta.

**Solución:**
1. Ejecuta: `npm run diagnose-message-table`
2. Sigue las instrucciones que proporciona el script
3. Si es necesario, ejecuta el SQL de `lib/create-message-table.sql`

### Error: "relation public.message does not exist"

**Causa:** La tabla no ha sido creada.

**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta el contenido de `lib/create-message-table.sql`

### Error: "No teams available"

**Causa:** El parent no tiene enrollments activos.

**Esto es normal si:**
- Es un parent nuevo sin students registrados
- Los enrollments están inactivos
- Los teams están en estado no válido

**Solución:**
1. Registra un student
2. Crea un enrollment activo
3. Asegúrate de que el team esté en estado 'open', 'ongoing' o 'closed'

### Los mensajes no aparecen en tiempo real

**Causa:** Realtime no está habilitado.

**Solución:**
1. Ve a Database → Replication
2. Habilita la tabla `message`
3. O ejecuta: `ALTER PUBLICATION supabase_realtime ADD TABLE message;`

### Error: "Policy violation" o "Permission denied"

**Causa:** RLS está habilitado pero sin políticas.

**Solución:**

**Opción A (Recomendada):** Desactiva RLS temporalmente:
```sql
ALTER TABLE public.message DISABLE ROW LEVEL SECURITY;
```

**Opción B:** Activa las políticas comentadas en `lib/create-message-table.sql`

## Estructura de la Tabla

```sql
message
├── id (UUID, PK)              -- ID único del mensaje
├── teamid (UUID, FK→team)     -- Team al que pertenece
├── sender_role (TEXT)         -- 'parent' o 'coach'
├── parentid (UUID, FK→parent) -- ID del parent (si aplica)
├── coachid (UUID, FK→staff)   -- ID del coach (si aplica)
├── body (TEXT)                -- Contenido del mensaje
└── created_at (TIMESTAMPTZ)   -- Fecha de creación
```

## Comandos Útiles

```bash
# Tests
npm run test:messaging              # Test completo
npm run test:messaging:quick        # Test rápido (< 10s)
npm run test:messaging:ui           # Solo componentes UI
npm run test:messaging:system       # Solo Supabase

# Diagnóstico
npm run diagnose-message-table      # Analizar tabla message

# Desarrollo
npm run dev                         # Servidor de desarrollo
npm run build                       # Build de producción
```

## Checklist de Configuración

- [ ] Tabla `message` creada en Supabase
- [ ] Índices creados
- [ ] Realtime habilitado para la tabla
- [ ] `npm run diagnose-message-table` pasa sin errores
- [ ] `npm run test:messaging:quick` pasa todos los checks
- [ ] Servidor corriendo con `npm run dev`
- [ ] Página `/dashboard/messages` carga correctamente
- [ ] Puedes enviar mensajes
- [ ] Los mensajes aparecen en tiempo real

## ✨ ¡Listo!

Una vez completados todos los pasos, el sistema de mensajería estará completamente funcional.

Para documentación adicional, consulta:
- `MESSAGING_TESTS.md` - Guía completa de testing
- Plan original en `.cursor/plans/`
