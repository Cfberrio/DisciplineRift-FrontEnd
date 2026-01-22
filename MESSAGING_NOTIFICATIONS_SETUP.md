# Sistema de Notificaciones de Mensajes Pendientes

## Descripción General

Sistema automatizado que envía notificaciones por email una vez al día (7:00 PM EST) a parents y coaches que tengan mensajes sin responder en el sistema de mensajería.

## Características

- ✅ Ejecución automática diaria a las 7:00 PM EST
- ✅ Notifica solo a quien debe responder (según el último mensaje enviado)
- ✅ Incluye extracto del mensaje y contador de mensajes pendientes
- ✅ Link directo al chat específico
- ✅ Prevención de duplicados (una notificación por día por conversación)
- ✅ Sin threshold de tiempo (notifica todos los mensajes pendientes)

## Arquitectura

### Componentes

1. **Vercel Cron Job**: Ejecuta automáticamente el endpoint a las 7:00 PM EST (00:00 UTC)
2. **API Endpoint**: `/api/cron/send-pending-message-notifications`
3. **Email Service**: Funciones en `lib/email-service.ts`
4. **Base de Datos**: Tabla `message_notification_log` para tracking

### Flujo de Ejecución

```
1. Vercel Cron (7:00 PM EST)
   ↓
2. GET /api/cron/send-pending-message-notifications
   ↓
3. Validación de CRON_SECRET
   ↓
4. Query de conversaciones activas (parent-coach-team)
   ↓
5. Para cada conversación:
   - Obtener último mensaje
   - Verificar si ya se notificó hoy
   - Determinar quién debe recibir notificación
   - Calcular mensajes no leídos
   - Enviar email
   - Registrar en log
   ↓
6. Retornar estadísticas (enviados, errores, total)
```

## Configuración

### Variables de Entorno Requeridas

#### Variables Existentes (ya configuradas)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

#### Nueva Variable (IMPORTANTE)

**`CRON_SECRET`**: Token de seguridad para autenticar requests del cron job.

### Cómo Generar CRON_SECRET

Ejecuta en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Esto generará algo como:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Agregar a .env.local (Desarrollo)

Crea o edita `.env.local`:

```env
# Existing variables...
NEXT_PUBLIC_SUPABASE_URL=your_url_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# New: Cron Secret
CRON_SECRET=tu_secreto_generado_aqui
```

### Agregar a Vercel (Producción)

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega nueva variable:
   - **Name**: `CRON_SECRET`
   - **Value**: (pega el secreto generado)
   - **Environment**: Production, Preview, Development
4. Guarda y redeploy si es necesario

## Estructura de Base de Datos

### Tabla: message_notification_log

```sql
CREATE TABLE public.message_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teamid UUID NOT NULL,
  parentid UUID NOT NULL,
  coachid UUID NOT NULL,
  notified_role TEXT NOT NULL CHECK (notified_role IN ('parent', 'coach')),
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_id UUID REFERENCES message(id) ON DELETE CASCADE
);
```

**Propósito**: Prevenir duplicados - solo envía una notificación por día para el mismo mensaje.

## Testing

### Prueba Local

```bash
# 1. Asegúrate de tener CRON_SECRET en .env.local
# 2. Inicia el servidor de desarrollo
npm run dev

# 3. En otra terminal, ejecuta:
curl -H "Authorization: Bearer TU_CRON_SECRET_AQUI" \
  http://localhost:3000/api/cron/send-pending-message-notifications
```

### Respuesta Esperada

```json
{
  "success": true,
  "notificationsSent": 3,
  "errors": 0,
  "totalConversations": 5
}
```

### Verificar Logs en Producción

1. Ve a Vercel Dashboard
2. Tu Proyecto → Deployments → (último deployment)
3. Functions → Logs
4. Busca `/api/cron/send-pending-message-notifications`
5. Revisa los console.logs del endpoint

## Horario del Cron Job

### Configuración Actual
- **Schedule**: `"0 0 * * *"` (cron syntax)
- **Timezone**: UTC
- **Hora Local**: 7:00 PM EST (12:00 AM UTC del día siguiente)

### Ajustar Horario (si es necesario)

Edita `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-pending-message-notifications",
      "schedule": "0 0 * * *"  // Cambiar aquí
    }
  ]
}
```

**Ejemplos de schedules:**
- `"0 0 * * *"` - Midnight UTC (7 PM EST)
- `"0 1 * * *"` - 1 AM UTC (8 PM EST)
- `"30 23 * * *"` - 11:30 PM UTC (6:30 PM EST)

## Lógica de Notificación

### ¿Quién Recibe Notificación?

El sistema identifica el **último mensaje** de cada conversación:

- **Si el parent envió el último mensaje** → Notifica al **coach**
- **Si el coach envió el último mensaje** → Notifica al **parent**

### Contador de Mensajes No Leídos

Se calcula cruzando:
1. Tabla `message` (mensajes del otro rol)
2. Tabla `message_read_status` (mensajes marcados como leídos)

**Fórmula**: `unread = mensajes del otro rol - mensajes en read_status`

### Prevención de Spam

- ✅ Solo envía **una notificación por día** por conversación
- ✅ Se basa en el `last_message_id` para detectar si ya se notificó
- ✅ Reset automático cada día a las 00:00 (inicio del día)

## Contenido del Email

### Para Parents

```
Subject: 💬 You have 2 unread messages - Team Name

Hi John Doe,

You have 2 pending messages from Coach Smith about Volleyball Team A.

Latest Message:
"Hey, can you confirm if Sarah can make it to practice tomorrow?..."

[View Messages →]

This is an automated daily reminder sent at 7:00 PM EST
```

### Para Coaches

```
Subject: 💬 You have 1 unread message - Team Name

Hi Coach Smith,

You have 1 pending message from John Doe about Volleyball Team A.

Latest Message:
"Yes, she'll be there. Thanks for checking!..."

[View Messages →]

This is an automated daily reminder sent at 7:00 PM EST
```

## Troubleshooting

### El cron no se ejecuta

1. Verifica que `vercel.json` tenga la configuración correcta
2. Asegúrate de haber desplegado después de agregar el cron
3. Revisa que tengas Vercel Hobby o superior (los crons requieren plan de pago en algunos casos)

### Error 401 Unauthorized

- Verifica que `CRON_SECRET` esté configurado en Vercel
- Asegúrate de que no tenga espacios extras
- Redespliega después de agregar la variable

### No se envían emails

1. Verifica logs en Vercel para ver qué conversaciones se procesaron
2. Revisa que `GMAIL_USER` y `GMAIL_APP_PASSWORD` estén configurados
3. Verifica que haya conversaciones con mensajes pendientes
4. Revisa tabla `message_notification_log` para ver si ya se notificó hoy

### Emails duplicados

- No debería pasar por el sistema de log
- Si pasa, revisa la tabla `message_notification_log`
- Asegúrate de que el timezone del servidor esté correcto

## Archivos del Sistema

### Código Fuente
- [`app/api/cron/send-pending-message-notifications/route.ts`](app/api/cron/send-pending-message-notifications/route.ts) - Endpoint principal
- [`lib/email-service.ts`](lib/email-service.ts) - Funciones de email (líneas finales)
- [`vercel.json`](vercel.json) - Configuración del cron job

### Base de Datos
- Tabla: `message` - Mensajes del chat
- Tabla: `message_read_status` - Mensajes leídos
- Tabla: `message_notification_log` - Log de notificaciones enviadas
- Tabla: `parent` - Información de parents
- Tabla: `staff` - Información de coaches
- Tabla: `team` - Información de equipos

## Limitaciones de Vercel Hobby

- **Cron Jobs**: 1 cron permitido (suficiente para este caso)
- **Ejecuciones**: Sin límite específico para 1 ejecución diaria
- **Duración**: Máximo 10 segundos por ejecución (suficiente con el delay de 1s por email)

Si tienes muchas conversaciones (>50), considera optimizar o upgrade a Vercel Pro.

## Monitoreo

### Métricas a Revisar

1. **Notificaciones enviadas**: Campo `notificationsSent` en respuesta
2. **Errores**: Campo `errors` en respuesta
3. **Total conversaciones**: Campo `totalConversations` en respuesta

### Logs Útiles

Busca en Vercel logs:
- `"🚀 === STARTING PENDING MESSAGE NOTIFICATIONS ==="`
- `"✅ Notified parent:"` o `"✅ Notified coach:"`
- `"❌ Failed to notify"`
- `"✅ === COMPLETED PENDING MESSAGE NOTIFICATIONS ==="`

## Mantenimiento

### Limpieza de Logs (Opcional)

La tabla `message_notification_log` crecerá con el tiempo. Para limpieza:

```sql
-- Eliminar logs más antiguos de 30 días
DELETE FROM message_notification_log
WHERE sent_at < NOW() - INTERVAL '30 days';
```

Considera crear un cron job adicional o un script manual para esto.

## Soporte

Para problemas o preguntas:
1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Ejecuta prueba local con curl
4. Revisa la tabla `message_notification_log` en Supabase
