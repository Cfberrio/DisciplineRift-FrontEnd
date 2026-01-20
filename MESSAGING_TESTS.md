# 🧪 Guía de Testing - Sistema de Mensajería

Este documento describe cómo ejecutar y entender los tests del sistema de mensajería.

## 📋 Tests Disponibles

### 1. Test Completo (Recomendado)
Ejecuta todos los tests y genera un reporte completo:

```bash
npm run test:messaging
```

**Verifica:**
- ✅ Estructura y contenido de componentes UI
- ✅ Conexión a Supabase
- ✅ Existencia y estructura de la tabla `message`
- ✅ Permisos de lectura/escritura
- ✅ Queries de teams por parent
- ✅ Compatibilidad con Realtime
- ✅ Presencia de todos los archivos necesarios

### 2. Test de UI Solamente
Verifica la implementación de componentes React:

```bash
npm run test:messaging:ui
```

**Verifica:**
- Interface `Message` en `lib/supabase.ts`
- Componente `TeamSelector`
- Componente `ChatPanel`
- Componente `MessagesClient`
- Página `messages/page.tsx`
- Integración en el navbar del dashboard

### 3. Test de Sistema Solamente
Verifica la configuración de Supabase y base de datos:

```bash
npm run test:messaging:system
```

**Verifica:**
- Conexión a Supabase
- Tabla `message` existe y es accesible
- Estructura correcta de la tabla
- Permisos de lectura
- Query de teams funciona
- Operaciones de inserción
- Configuración de Realtime

## 🎯 Interpretación de Resultados

### ✅ Todos los tests pasaron (100%)
El sistema está completamente funcional y listo para usar en producción.

### ⚠️ 75-99% de tests pasados
El sistema es funcional pero hay detalles menores a revisar. Revisar el output específico.

### 🔴 Menos de 75% de tests pasados
Se requiere configuración adicional. Problemas comunes:
- Variables de entorno no configuradas
- Tabla `message` no existe en Supabase
- RLS configurado pero sin políticas adecuadas
- Realtime no habilitado en Supabase

## 🔧 Solución de Problemas Comunes

### Error: "Variables de entorno no configuradas"
**Solución:** Verificar que `.env.local` contiene:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

### Error: "Tabla message no existe"
**Solución:** Crear la tabla en Supabase SQL Editor:

```sql
CREATE TABLE public.message (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teamid UUID NOT NULL REFERENCES team(teamid),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach')),
  parentid UUID REFERENCES parent(parentid),
  coachid UUID REFERENCES staff(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE message;
```

### Error: "Sin permisos de lectura/escritura"
**Solución:** El proyecto actualmente tiene RLS desactivado. Si lo activaste, necesitas políticas:

```sql
-- Política para parents (lectura)
CREATE POLICY "Parents can view their team messages"
ON message FOR SELECT
USING (
  teamid IN (
    SELECT DISTINCT e.teamid
    FROM student s
    JOIN enrollment e ON e.studentid = s.studentid
    WHERE s.parentid = auth.uid()
    AND e.isactive = true
  )
);

-- Política para parents (escritura)
CREATE POLICY "Parents can send messages"
ON message FOR INSERT
WITH CHECK (
  sender_role = 'parent'
  AND parentid = auth.uid()
  AND teamid IN (
    SELECT DISTINCT e.teamid
    FROM student s
    JOIN enrollment e ON e.studentid = s.studentid
    WHERE s.parentid = auth.uid()
    AND e.isactive = true
  )
);
```

### Error: "Realtime no funciona"
**Solución:** Habilitar Realtime en Supabase Dashboard:
1. Ve a Database → Replication
2. Habilita Realtime para la tabla `message`
3. Publica los cambios

## 📊 Output de Ejemplo

### Test Exitoso:
```
✅ Conexión Supabase: Conectado exitosamente
✅ Tabla message: La tabla existe y es accesible
✅ Estructura tabla: Todas las columnas requeridas están presentes
✅ Permisos lectura: Lectura permitida (5 mensajes en muestra)
✅ Query teams: Query exitoso (2 students encontrados)
✅ Inserción mensaje: Inserción exitosa y limpieza completada
✅ Realtime setup: Canal Realtime configurado correctamente
✅ Archivos componentes: Todos los archivos presentes

📊 RESUMEN: 8/8 tests pasados (100%)
✨ ¡TODOS LOS TESTS PASARON! Sistema listo para usar.
```

## 🚀 Verificación Manual en el Navegador

Después de que todos los tests pasen, verifica manualmente:

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Navegar a la página:**
   ```
   http://localhost:3000/dashboard/messages
   ```

3. **Verificar funcionalidad:**
   - [ ] El navbar muestra "Messages"
   - [ ] Puedes seleccionar un team del dropdown
   - [ ] El panel de chat se carga correctamente
   - [ ] Puedes escribir y enviar un mensaje
   - [ ] Los mensajes aparecen en tiempo real
   - [ ] Los mensajes de parent aparecen en azul a la derecha
   - [ ] Los mensajes de coach aparecen en gris a la izquierda

## 📈 Métricas de Calidad

Los tests verifican:
- **Cobertura de componentes:** 100% de archivos necesarios
- **Validaciones:** Sin auth, sin teams, mensajes vacíos
- **Funcionalidad Realtime:** Suscripción y eventos
- **Error handling:** Manejo robusto de errores
- **Optimistic updates:** UX mejorada
- **Auto-scroll:** Scroll automático a nuevos mensajes

## 🔄 Integración Continua

Para integrar en CI/CD, agrega a tu workflow:

```yaml
- name: Test Messaging System
  run: npm run test:messaging
```

Los tests devuelven:
- **Exit code 0:** Todos los tests pasaron
- **Exit code 1:** Al menos un test falló

## 📝 Notas Adicionales

- Los tests son **no destructivos**: no modifican datos existentes
- Si insertan datos de prueba, los limpian automáticamente
- Los tests funcionan con cualquier estado de la base de datos
- Los mensajes de test incluyen "[TEST MESSAGE - IGNORE]" para fácil identificación

## 🤝 Contribuir

Si encuentras un problema que los tests no detectan:
1. Documenta el issue
2. Agrega un test que lo reproduzca
3. Implementa la solución
4. Verifica que el test pase

---

**Última actualización:** Enero 2026  
**Versión de tests:** 1.0.0
