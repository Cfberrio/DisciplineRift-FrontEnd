# 📧 Sistema de Emails de Cancelación de Equipos

Este sistema permite enviar emails automáticos de cancelación a padres cuyos hijos están inscritos en equipos que han sido cancelados.

## 🎯 Funcionalidad

El sistema identifica estudiantes que están en equipos cancelados (`team.isactive = false`) pero cuyas inscripciones siguen activas (`enrollment.isactive = true`) y envía emails de cancelación a sus padres.

## 📁 Archivos del Sistema

### 1. Servicio Principal
- **`lib/cancellation-email-service.ts`**: Contiene toda la lógica de:
  - Obtener datos de la base de datos
  - Generar HTML del email
  - Enviar emails vía SMTP
  - Validar configuración

### 2. API Routes
- **`app/api/send-cancellation-emails/route.ts`**: Endpoint REST para:
  - `GET`: Obtener lista de estudiantes que necesitan emails
  - `POST`: Enviar los emails de cancelación

### 3. Scripts de Ejecución
- **`send-cancellation-emails.js`**: Script principal para ejecutar el envío
- **`generate-cancellation-email-preview.js`**: Genera vista previa del email

## 🚀 Uso del Sistema

### 1. Generar Vista Previa

Primero, genera una vista previa del email para revisar el diseño:

```bash
node generate-cancellation-email-preview.js
```

Esto creará `cancellation-email-preview.html` que puedes abrir en tu navegador.

### 2. Verificar Qué Emails Se Enviarían (Preview Mode)

```bash
node send-cancellation-emails.js --preview
```

Este comando muestra:
- Lista de estudiantes afectados
- Información de padres y equipos
- Cantidad total de emails
- **NO envía emails reales**

### 3. Enviar Email de Prueba

Para probar con un email específico:

```bash
node send-cancellation-emails.js --test-email=tu@email.com --limit=3
```

Esto enviará máximo 3 emails a tu dirección de prueba.

### 4. Envío Real de Emails

⚠️ **CUIDADO**: Este comando envía emails reales a los padres.

```bash
node send-cancellation-emails.js
```

Para enviar solo un número limitado:

```bash
node send-cancellation-emails.js --limit=10
```

## 📋 Opciones del Script

| Opción | Descripción |
|--------|-------------|
| `--preview` | Solo muestra qué emails se enviarían sin enviarlos |
| `--test-email=EMAIL` | Envía todos los emails a esta dirección |
| `--limit=N` | Limita el número de emails a enviar |
| `--help` | Muestra ayuda detallada |

## 🔧 Configuración Requerida

### Variables de Entorno (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Gmail SMTP
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password
```

### Configuración Gmail SMTP

1. **Activar 2FA** en tu cuenta de Gmail
2. **Generar App Password**: 
   - Ve a [Google Account Security](https://myaccount.google.com/security)
   - Selecciona "App passwords"
   - Genera password para "Mail"
3. **Usar password** en `GMAIL_APP_PASSWORD`

## 📊 Estructura de Datos

### Query Principal

El sistema busca estudiantes usando esta lógica:

```sql
SELECT enrollment.*, student.*, parent.*, team.*, school.*
FROM enrollment
JOIN student ON enrollment.studentid = student.studentid
JOIN parent ON student.parentid = parent.parentid
JOIN team ON enrollment.teamid = team.teamid
JOIN school ON team.schoolid = school.schoolid
WHERE enrollment.isactive = true 
  AND team.isactive = false
```

### Datos del Email

Cada email incluye:
- **parentName**: Nombre del padre
- **studentName**: Nombre del estudiante
- **teamName**: Nombre del equipo cancelado
- **schoolName**: Nombre de la escuela
- **parentEmail**: Email del padre

## 🎨 Template del Email

El email incluye:
- **Subject**: `Cancellation — [TEAM NAME] — Important Update`
- **Header** con branding de Discipline Rift
- **Mensaje de cancelación** personalizado
- **Información sobre reembolso** ($129 en 3 días hábiles)
- **Contacto** y footer corporativo
- **Responsive design** para móviles
- **Dark mode support**

## 📈 Monitoreo y Logs

### Logs del Sistema

El sistema genera logs detallados:

```
🔍 Buscando estudiantes en equipos cancelados...
✅ Encontrados 29 estudiantes en equipos cancelados
📧 Enviando email a parent@email.com para Volleyball Mixed Elementary...
✅ Email enviado exitosamente a parent@email.com
📊 === RESUMEN DEL ENVÍO ===
📧 Emails enviados: 29
❌ Errores: 0
```

### Verificación de Resultados

La API devuelve información completa:

```json
{
  "success": true,
  "emailsSent": 29,
  "errors": 0,
  "totalProcessed": 29,
  "results": [
    {
      "parentEmail": "parent@email.com",
      "parentName": "María González",
      "teamName": "Volleyball Mixed Elementary",
      "success": true
    }
  ]
}
```

## 🛡️ Seguridad y Validaciones

### Validaciones Implementadas

1. **Configuración**: Verifica variables de entorno antes de ejecutar
2. **Deduplicación**: Evita emails duplicados por padre
3. **Rate Limiting**: Pausa de 1 segundo entre emails
4. **Error Handling**: Manejo robusto de errores de SMTP
5. **Datos Requeridos**: Valida que existan email, nombre del padre y equipo

### Prevención de Errores

- **Preview Mode** obligatorio para verificar antes de enviar
- **Confirmación** con countdown de 5 segundos
- **Límites** opcionales para pruebas controladas
- **Emails de prueba** para validar contenido

## 🔄 Flujo de Trabajo Recomendado

1. **Generar vista previa** del email
2. **Ejecutar en modo preview** para ver la lista
3. **Enviar emails de prueba** a tu dirección
4. **Verificar** que todo funciona correctamente
5. **Ejecutar envío real** con límite pequeño primero
6. **Ejecutar envío completo** cuando esté todo validado

## 📞 Soporte

Si tienes problemas:

1. **Verificar configuración**: Variables de entorno correctas
2. **Verificar servidor**: Next.js ejecutándose
3. **Verificar red**: Conexión a Supabase y Gmail
4. **Revisar logs**: Mensajes de error en consola

Para más ayuda, contacta al equipo de desarrollo.





