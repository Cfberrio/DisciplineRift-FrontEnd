# Jobs Automáticos - Discipline Rift

Este directorio contiene los jobs automáticos y tareas programadas del sistema.

## 📋 Jobs Disponibles

### 🏐 Season Reminders (`sendSeasonReminders.ts`)

**Descripción**: Envía recordatorios por email a los padres cuando la temporada de su equipo comienza en exactamente 30 días.

**Programación**: Diariamente a las 20:30 America/New_York

**Funcionalidades**:
- ✅ Busca sesiones que inicien exactamente en 30 días
- ✅ Identifica enrollments activos para cada sesión
- ✅ Resuelve información de estudiantes y padres
- ✅ Deduplicación automática (un email por padre por sesión)
- ✅ Construye horario completo de temporada con fechas y horas
- ✅ Envío de emails con template HTML responsive
- ✅ Logs detallados y manejo de errores
- ✅ Soporte para múltiples formatos de días de la semana

**Criterios de Negocio**:
1. Solo sesiones con `startdate` = hoy + 30 días
2. Solo enrollments con `isactive = true`
3. Un email por combinación de (padre, sesión)
4. Subject: `{teamname} Season Starts in One Month! Discipline Rift`
5. Fallback a `Team {teamid}` si no hay nombre de equipo

**Funciones Exportadas**:
- `runSeasonReminders(opts?: { now?: Date })`: Función principal del job
- `checkSeasonRemindersConfig()`: Verificación de configuración

## 🔧 Configuración

### Variables de Entorno Requeridas:
```env
# Supabase (RLS deshabilitado - solo clave anónima)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### Variables Opcionales:
```env
ENABLE_SCHEDULERS=1          # Habilitar en desarrollo
DRY_RUN=1                    # Modo prueba (futuro)
TEST_DATE=2024-01-15         # Fecha específica para testing
```

## 🚀 Ejecución

### Manual (CLI):
```bash
# Ejecutar normalmente
npm run season-reminders

# Con fecha específica para testing
npm run season-reminders:test

# Modo prueba (próximamente)
npm run season-reminders:dry-run
```

### Automática (Scheduler):
El scheduler se inicia automáticamente en:
- ✅ **Producción**: Siempre activo
- ⚠️ **Desarrollo**: Requiere `ENABLE_SCHEDULERS=1`

## 📊 Monitoreo y Logs

El job proporciona logs estructurados:

```
🚀 === INICIANDO JOB DE RECORDATORIOS DE TEMPORADA ===
📅 Fecha actual (NY): 2024-01-15
🎯 Buscando sesiones que inician en: 2024-02-14
🔍 Consultando sesiones...
📊 Encontradas 3 sesiones

🏐 Procesando sesión abc123 del equipo team456
👥 Encontradas 12 inscripciones activas
✅ Email enviado a parent@email.com (msg-id-123)

📊 === RESUMEN DEL JOB ===
🎯 Sesiones procesadas: 3
📧 Emails enviados: 15
❌ Errores: 0
✅ Job completado exitosamente
```

## 🧪 Testing

### Casos de Prueba Recomendados:

1. **Test con fecha específica**:
   ```bash
   TEST_DATE=2024-01-15 npm run season-reminders
   ```

2. **Test de configuración**:
   ```bash
   npx tsx -e "import { checkSeasonRemindersConfig } from './jobs/sendSeasonReminders'; checkSeasonRemindersConfig().then(console.log)"
   ```

3. **Test de parseo de días**:
   - Probar con: `"Mon,Tue,Wed"`, `"m, tue, wednesday"`, `"Monday; Tuesday"`
   - Verificar que maneja formatos inconsistentes

### Datos de Test Sugeridos:

Para testing, crea datos en Supabase con:
- **session**: `startdate` = fecha actual + 30 días
- **enrollment**: Con `isactive = true`
- **student** y **parent**: Con emails válidos para testing

## 🔒 Seguridad

- ✅ Usa NEXT_PUBLIC_SUPABASE_ANON_KEY con RLS deshabilitado
- ✅ Valida configuración antes de ejecutar
- ✅ Manejo de errores sin exponer credenciales
- ✅ Límites de safety (máx 1000 sesiones, 10000 enrollments)
- ✅ Deduplicación para evitar spam

## 📈 Futuras Mejoras

- [ ] Modo dry-run completo
- [ ] Recordatorios adicionales (7 días, 1 día antes)
- [ ] Templates de email personalizables
- [ ] Webhooks para notificaciones de estado
- [ ] Dashboard de monitoreo
- [ ] Soporte para múltiples zonas horarias
