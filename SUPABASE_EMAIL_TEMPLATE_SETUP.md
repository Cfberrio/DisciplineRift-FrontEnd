# Configuración de Plantilla de Email OTP en Supabase

## Problema
Los correos de autenticación OTP no están usando la plantilla personalizada configurada en Supabase.

## Solución: Verificar Configuración en Supabase Dashboard

### Paso 1: Acceder a Email Templates
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a: **Authentication** → **Email Templates**

### Paso 2: Configurar la Plantilla "Magic Link"
La función `signInWithOtp()` usa la plantilla **"Magic Link"** para enviar códigos OTP.

1. Selecciona **"Magic Link"** en el menú lateral
2. Asegúrate de que esté **HABILITADA** (toggle en ON)
3. Verifica que tu plantilla personalizada contenga la variable `{{ .Token }}`

### Paso 3: Variables Disponibles para la Plantilla

Tu plantilla debe incluir estas variables de Supabase:

```html
{{ .Token }}              <!-- Código OTP de 6 dígitos -->
{{ .SiteURL }}           <!-- URL de tu sitio -->
{{ .ConfirmationURL }}   <!-- URL de confirmación (si aplica) -->
{{ .Email }}             <!-- Email del usuario -->
```

### Ejemplo de Plantilla Básica

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tu Código de Acceso</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tu Código de Acceso</h2>
        <p>Hola,</p>
        <p>Tu código de acceso es:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #0085B7;">
            {{ .Token }}
        </h1>
        <p>Este código expirará en 10 minutos.</p>
        <p>Si no solicitaste este código, puedes ignorar este email.</p>
    </div>
</body>
</html>
```

### Paso 4: Verificar Configuración de SMTP (Opcional)

Si estás usando SMTP personalizado:

1. Ve a **Settings** → **Auth**
2. Baja hasta **SMTP Settings**
3. Verifica que:
   - SMTP esté habilitado
   - Host, Port, Username, Password estén configurados correctamente
   - Sender email y Sender name estén configurados

### Paso 5: Probar Envío

Después de configurar:

1. Guarda los cambios en la plantilla
2. Prueba el login en tu aplicación
3. Verifica que el correo llegue con tu plantilla personalizada
4. Revisa los logs en Supabase Dashboard: **Authentication** → **Logs**

## Notas Importantes

- **Por defecto**, Supabase usa plantillas genéricas hasta que habilites las personalizadas
- **Cambios en plantillas** pueden tardar unos minutos en aplicarse
- **Rate limits**: Supabase limita el envío de emails para prevenir spam
- **Modo desarrollo**: En desarrollo local, los emails pueden ir a spam

## Verificar en el Código

El archivo `app/api/auth/send-login-otp/route.ts` usa:

```typescript
await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
  },
});
```

Esta función automáticamente usa la plantilla "Magic Link" configurada en Supabase.

## Troubleshooting

### El correo no llega
1. Verifica la carpeta de spam
2. Revisa los logs de Supabase: Authentication → Logs
3. Verifica que el email del usuario esté correcto

### La plantilla no se aplica
1. Asegúrate de que la plantilla esté **habilitada** (toggle ON)
2. Verifica que guardaste los cambios
3. Espera 1-2 minutos y prueba nuevamente
4. Limpia el cache del navegador

### El código no funciona
1. El código OTP expira en 10 minutos
2. Solo se puede usar una vez
3. Es case-sensitive (solo números en este caso)

## Contacto de Soporte

Si el problema persiste después de seguir estos pasos:
- Revisa los logs de Supabase
- Contacta a soporte de Supabase con el Project ID
- Verifica las variables de entorno en tu proyecto




















