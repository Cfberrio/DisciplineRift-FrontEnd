# 📧 Configuración del Sistema de Contacto por Email

Este documento explica cómo configurar el sistema de envío de emails para el formulario de contacto.

## ✅ Funcionalidades Implementadas

- ✅ Formulario de contacto con validación
- ✅ API para procesar envíos (/api/contact)
- ✅ Integración con Gmail SMTP para envío de emails
- ✅ Estados de carga y mensajes de error/éxito
- ✅ Envío automático a cberrio04@gmail.com
- ✅ Almacenamiento opcional en base de datos

## 🚀 Configuración de Gmail SMTP (Configurado)

### Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# Gmail SMTP Configuration for Contact Form
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=wpcg fqsk ewtd afqd
```

### Cómo Configurar Gmail SMTP

1. **Activar 2FA en Gmail**: Ve a [Google Account Security](https://myaccount.google.com/security)
2. **Generar App Password**: 
   - Ve a "App passwords" 
   - Selecciona "Mail" como aplicación
   - Usa la contraseña proporcionada: `wpcg fqsk ewtd afqd`
3. **Configurar Email**: Usa tu email de Gmail para `GMAIL_USER`

## 📧 Configuración del Email

### Remitente
- **From**: Discipline Rift Contact Form <tu-email@gmail.com>
- **To**: cberrio04@gmail.com
- **ReplyTo**: email del usuario que envía el formulario

### Contenido del Email
El email incluye:
- Nombre del usuario
- Email del usuario
- Asunto (si se selecciona)
- Mensaje
- Fecha y hora de envío

## 📧 Configuración del Sistema SMTP

### Configuración Actual
El sistema usa **Gmail SMTP** con nodemailer:

- **Servicio**: Gmail SMTP
- **Puerto**: 587 (TLS)
- **Autenticación**: App Password
- **Destinatario**: cberrio04@gmail.com

## 🏗️ Estructura de la Base de Datos (Opcional)

Si quieres almacenar los envíos en la base de datos, crea esta tabla en Supabase:

```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- 'sent', 'failed', 'pending'
);

-- Opcional: índices para mejor rendimiento
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
```

## 🧪 Pruebas

### Modo de Desarrollo
- Si no hay configuración de email, los mensajes se logean en la consola
- El formulario siempre muestra mensaje de éxito para buena UX
- Los datos se intentan guardar en la base de datos si está disponible

### Validaciones
- ✅ Nombre requerido
- ✅ Email requerido y formato válido
- ✅ Mensaje requerido
- ✅ Asunto opcional

## 🚨 Solución de Problemas

### Error: "Gmail SMTP credentials not configured"
1. Verifica que `GMAIL_USER` y `GMAIL_APP_PASSWORD` estén en `.env.local`
2. Asegúrate de que la App Password sea correcta: `wpcg fqsk ewtd afqd`
3. Confirma que el email de Gmail tenga 2FA activado

### Error: "Authentication failed"
1. Verifica que 2FA esté activado en la cuenta de Gmail
2. Regenera la App Password si es necesario
3. Asegúrate de usar la App Password, no la contraseña regular

### Emails no llegan
1. Verifica que cberrio04@gmail.com sea la dirección correcta
2. Revisa la carpeta de spam de Gmail
3. Verifica los logs del servidor en la consola de desarrollo

## 📊 Monitoreo

### Logs del Servidor
Los logs incluyen:
- Información de envíos exitosos
- Errores de configuración SMTP
- IDs de emails enviados por Gmail
- Información del usuario que envía el formulario

### Monitoreo Gmail
- Logs en la consola del servidor
- Verificación manual en cberrio04@gmail.com
- Estado de entrega en tiempo real

## 🔒 Seguridad

- ✅ Validación de entrada
- ✅ Rate limiting (por implementar)
- ✅ Sanitización de datos
- ✅ API keys seguras en variables de entorno

## 📝 Notas

- La API funciona sin configuración de email (modo desarrollo)
- Los mensajes siempre se almacenan localmente para respaldo
- El formulario es responsive y accesible
- Estados de carga mejoran la experiencia del usuario