# 🔧 Guía de Solución de Problemas - Sistema de Correos

## 🚨 Problema: Los correos de confirmación no se están enviando

Esta guía te ayudará a diagnosticar y resolver problemas con el sistema de envío de correos electrónicos de confirmación de pago.

---

## 📋 Diagnóstico Rápido

### Paso 1: Ejecutar el Script de Diagnóstico

```bash
npm run diagnose-emails
```

Este script verificará:
- ✅ Variables de entorno configuradas
- ✅ Conexión con Gmail SMTP
- ✅ Envío de email de prueba
- ✅ Registros recientes pendientes de pago

---

## 🔍 Causas Comunes y Soluciones

### 1. ⚠️ Variables de Entorno No Configuradas

**Síntomas:**
- Los logs muestran: `❌ Gmail credentials not configured!`
- El diagnóstico muestra: `GMAIL_USER: ❌ NO CONFIGURADO`

**Solución Local (.env.local):**

```bash
# Verifica que tu archivo .env.local tenga estas variables:
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicación
```

**Solución en Vercel (Producción):**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto "DisciplineRift-FrontEnd"
3. Ve a **Settings** → **Environment Variables**
4. Agrega o verifica estas variables:
   - `GMAIL_USER` = tu-email@gmail.com
   - `GMAIL_APP_PASSWORD` = tu_contraseña_de_aplicación
5. **IMPORTANTE:** Después de agregar/modificar variables, haz un **Redeploy**:
   - Ve a **Deployments**
   - Click en los "..." del último deployment
   - Selecciona **Redeploy**

---

### 2. 🔐 Contraseña de Aplicación de Gmail Inválida o Expirada

**Síntomas:**
- Error: `Invalid login: 535-5.7.8 Username and Password not accepted`
- La conexión Gmail falla en el diagnóstico

**Solución:**

1. **Generar nueva contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Debes tener la autenticación de 2 factores habilitada
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "DisciplineRift" como nombre
   - Copia la contraseña de 16 caracteres (sin espacios)

2. **Actualizar la variable de entorno:**
   ```bash
   # En .env.local (local)
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # Quita los espacios
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx     # Debe ser así
   ```

3. **Actualizar en Vercel:**
   - Settings → Environment Variables
   - Edita `GMAIL_APP_PASSWORD`
   - Pega la nueva contraseña (sin espacios)
   - **Redeploy** el proyecto

---

### 3. 🚫 Autenticación de 2 Factores No Habilitada

**Síntoma:**
- No puedes generar contraseñas de aplicación en Google

**Solución:**

1. Ve a: https://myaccount.google.com/security
2. Habilita la "Verificación en 2 pasos"
3. Una vez habilitada, podrás generar contraseñas de aplicación

---

### 4. 📊 Límites de Envío de Gmail Alcanzados

**Síntomas:**
- Error: `Daily sending quota exceeded`
- Los emails funcionaban pero dejaron de enviarse

**Límites de Gmail:**
- **Gmail personal:** ~500 emails/día
- **Google Workspace:** ~2000 emails/día

**Solución temporal:**
- Espera 24 horas para que se restablezca el límite

**Solución permanente:**
- Considera usar SendGrid, AWS SES o Resend para mayor volumen

---

### 5. 🌐 Problema de Conexión de Red (Vercel)

**Síntomas:**
- Error: `ETIMEDOUT` o `ECONNREFUSED`

**Solución:**
1. Verifica que Vercel no tenga problemas: https://www.vercel-status.com/
2. Revisa los logs en Vercel:
   - Ve a tu proyecto → **Logs** 
   - Busca errores relacionados con "email" o "Gmail"

---

## 🧪 Probar el Sistema de Correos

### Opción 1: Usar el Endpoint de Debug

```bash
# GET: Verificar configuración
curl https://tu-dominio.com/api/debug-email?enrollment_id=ENROLLMENT_ID

# POST: Enviar email de prueba
curl -X POST https://tu-dominio.com/api/debug-email \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "testEmail": "tu-email@example.com"
  }'
```

### Opción 2: Script de Diagnóstico Local

```bash
npm run diagnose-emails
```

---

## 📝 Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] **Variables de Entorno Configuradas**
  - [ ] `GMAIL_USER` en .env.local
  - [ ] `GMAIL_APP_PASSWORD` en .env.local
  - [ ] `GMAIL_USER` en Vercel
  - [ ] `GMAIL_APP_PASSWORD` en Vercel

- [ ] **Contraseña de Aplicación**
  - [ ] Autenticación de 2 factores habilitada
  - [ ] Contraseña de aplicación generada
  - [ ] Contraseña sin espacios
  - [ ] Contraseña actualizada en Vercel

- [ ] **Redeploy Realizado**
  - [ ] Después de cambiar variables en Vercel
  - [ ] Esperado 2-3 minutos para propagación

- [ ] **Pruebas**
  - [ ] Script de diagnóstico ejecutado
  - [ ] Email de prueba enviado exitosamente
  - [ ] Verificado en bandeja de entrada

---

## 🔧 Comandos Útiles

```bash
# Diagnóstico completo del sistema
npm run diagnose-emails

# Probar envío de email simple
npm run test-email

# Ver logs en tiempo real (Vercel)
vercel logs --follow

# Verificar variables de entorno en Vercel
vercel env ls
```

---

## 📞 Si Nada Funciona

Si después de seguir todos los pasos anteriores el problema persiste:

1. **Revisar logs de Vercel:**
   ```bash
   vercel logs --follow
   ```

2. **Verificar que nodemailer esté instalado:**
   ```bash
   npm list nodemailer
   ```

3. **Revisar el código de error específico** en:
   - `app/api/payment/confirm/route.ts` (líneas 44-350)
   - Los logs mostrarán exactamente qué está fallando

4. **Alternativa temporal:** Usa otro servicio de email:
   - SendGrid
   - AWS SES
   - Resend
   - Postmark

---

## 📊 Monitoreo y Prevención

### Configurar Alertas

1. **Vercel:**
   - Settings → Integrations → Add Slack/Discord
   - Recibe notificaciones de errores

2. **Gmail:**
   - Revisa periódicamente el uso de cuota
   - Considera Google Workspace para mayor límite

### Logs Importantes

Los siguientes mensajes en logs indican problemas:

```
❌ Gmail credentials not configured!
❌ CRITICAL: EMAIL SYSTEM NOT CONFIGURED
❌ Error sending email:
❌ Failed to send payment confirmation email
```

---

## 🎯 Resumen de Acciones Inmediatas

1. ✅ Ejecuta: `npm run diagnose-emails`
2. ✅ Verifica variables en Vercel Dashboard
3. ✅ Genera nueva contraseña de aplicación si es necesario
4. ✅ **REDEPLOY** en Vercel después de cambios
5. ✅ Espera 2-3 minutos y prueba un pago de prueba
6. ✅ Verifica que lleguen los correos a ambos destinatarios:
   - Padre/tutor
   - disciplinerift@gmail.com

---

## 📚 Recursos Adicionales

- [Contraseñas de Aplicación de Google](https://myaccount.google.com/apppasswords)
- [Documentación de Nodemailer](https://nodemailer.com/)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Límites de Gmail](https://support.google.com/mail/answer/22839)

---

**Última actualización:** 12 de Noviembre, 2025












