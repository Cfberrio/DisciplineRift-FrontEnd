# 📧 Configuración del Sistema de Emails de Confirmación

## Descripción General

Este sistema envía automáticamente emails de confirmación de pago estéticamente diseñados a los padres después de completar exitosamente una transacción de registro de estudiante.

## ✨ Características

### ✅ Email Automático Post-Pago
- Se envía automáticamente después de confirmar un pago exitoso en Stripe
- Incluye todos los detalles del team excepto `isactive` y `participants`
- Template HTML responsive y visualmente atractivo

### 📋 Contenido del Email Incluye:
- **Información del Estudiante**: Nombre, grado, contacto de emergencia
- **Detalles del Equipo**: Nombre, descripción, precio, escuela, ubicación
- **Horarios de Entrenamiento**: Fechas, horas, días de la semana, entrenador
- **Confirmación de Pago**: Monto, fecha, ID de sesión
- **Próximos Pasos**: Instrucciones claras para el usuario

## 🛠️ Configuración Requerida

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Gmail SMTP Configuration
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### 2. Configurar Gmail App Password

Para obtener una contraseña de aplicación de Gmail:

1. **Activar 2FA**: Ve a [Google Account Security](https://myaccount.google.com/security)
2. **Generar App Password**: 
   - Ve a "App passwords" 
   - Selecciona "Mail" como aplicación
   - Copia la contraseña de 16 caracteres generada
3. **Usar en .env.local**: Pega la contraseña en `GMAIL_APP_PASSWORD`

### 3. Verificar Configuración

El sistema incluye herramientas de prueba integradas:

1. **Accede al Dashboard Administrativo**: `/dashboard`
2. **Login con credenciales admin**:
   - Email: `admin@disciplinerift.com`
   - Contraseña: `admin123`
3. **Ve a la tab "Email"**
4. **Usar las herramientas de prueba**:
   - "Verificar Configuración": Valida las credenciales SMTP
   - "Enviar Email de Prueba": Envía un email completo de prueba

## 🎯 Flujo de Funcionamiento

### Flujo Automático
```
Usuario completa pago → Stripe confirma → Sistema obtiene datos → Envía email → Usuario recibe confirmación
```

### Puntos de Integración
- **GET** `/api/payment/confirm` - Redirección desde Stripe
- **POST** `/api/payment/confirm` - Confirmación vía API

## 🧪 Endpoints de Prueba

### Verificar Configuración
```bash
GET /api/test-email
```

**Respuesta de éxito:**
```json
{
  "success": true,
  "message": "Email configuration is valid and ready to use",
  "details": "Email configuration is valid"
}
```

### Enviar Email de Prueba
```bash
POST /api/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Respuesta de éxito:**
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com",
  "messageId": "message-id-from-gmail"
}
```

## 🎨 Diseño del Email

### Características Visuales
- **Responsive Design**: Se adapta a móviles y desktop
- **Colores**: Esquema azul profesional con acentos verdes
- **Tipografía**: Segoe UI para legibilidad
- **Iconos**: Emoji y símbolos para claridad visual
- **Secciones**: Organizadas con cards y grids

### Secciones del Template
1. **Header**: Logo, título de confirmación
2. **Resumen de Pago**: Monto destacado y fecha
3. **Información del Estudiante**: Datos personales y emergencia
4. **Detalles del Equipo**: Nombre, escuela, ubicación, precio
5. **Horarios**: Fechas, horas, días, entrenador
6. **Próximos Pasos**: Lista de acciones a seguir
7. **Footer**: Información de contacto y soporte

## 🔧 Mantenimiento

### Logs del Sistema
Los emails son registrados en la consola con:
- ✅ Éxito: `Email sent successfully: message-id`
- ❌ Error: `Error sending email: error-message`

### Manejo de Errores
- Los errores de email **NO interrumpen** el flujo de pago
- Se registran en logs para debugging
- El pago se confirma independientemente del estado del email

### Monitoreo Recomendado
- Verificar logs de envío regularmente
- Probar con diferentes proveedores de email
- Validar que los emails no vayan a spam

## 🚨 Troubleshooting

### Error: "Gmail credentials not configured"
**Solución**: Verificar que `GMAIL_USER` y `GMAIL_APP_PASSWORD` estén en `.env.local`

### Error: "Invalid login"
**Solución**: 
1. Verificar que 2FA esté habilitado en Gmail
2. Regenerar la contraseña de aplicación
3. Usar la nueva contraseña en `.env.local`

### Error: "Connection timeout"
**Solución**:
1. Verificar conexión a internet
2. Comprobar firewall/proxy settings
3. Intentar con otra red

### Emails van a spam
**Solución**:
1. Configurar SPF/DKIM records
2. Usar dominio personalizado
3. Calentar la reputación del dominio

## 📝 Personalización

### Modificar Template
Edita `lib/email-service.ts` en la función `createEmailTemplate()`:

```typescript
// Cambiar colores
const colors = {
  primary: "#1e40af",    // Azul principal
  success: "#10b981",    // Verde de éxito
  warning: "#fbbf24"     // Amarillo de advertencia
}

// Agregar secciones custom
const customSection = `
  <div class="section">
    <h3>Tu Sección Custom</h3>
    <p>Contenido personalizado</p>
  </div>
`
```

### Agregar Datos Adicionales
Modifica las interfaces en `lib/email-service.ts` para incluir más campos:

```typescript
interface TeamData {
  // Campos existentes...
  customField: string
  additionalInfo: string[]
}
```

## 🎯 Próximas Mejoras

- [ ] Templates múltiples por tipo de equipo
- [ ] Envío de recordatorios automáticos
- [ ] Integración con calendarios
- [ ] Notificaciones push
- [ ] Sistema de plantillas visuales
- [ ] Analytics de apertura de emails

## 📞 Soporte

Para problemas con el sistema de emails:

1. **Revisar logs** en la consola del servidor
2. **Usar herramientas de prueba** en el dashboard
3. **Verificar configuración** de Gmail
4. **Contactar soporte técnico** si persisten problemas

---

**Desarrollado con ❤️ para Discipline Rift - Volleyball Registration Platform** 