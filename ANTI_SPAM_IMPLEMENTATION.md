# Implementación de Medidas Anti-Spam para Formulario de Contacto

## 📋 Resumen
Se han implementado múltiples capas de protección anti-spam para el formulario de contacto sin afectar la experiencia del usuario. No se requieren CAPTCHAs visibles.

---

## ✅ Medidas Implementadas

### 1. **Vercel BotID** 🤖
- **Paquete instalado**: `botid`
- **Función**: Detección inteligente de bots usando análisis de comportamiento
- **Ubicación**: Verificación en el API handler antes de procesar cualquier solicitud
- **Resultado**: Bloqueo automático (HTTP 403) para tráfico identificado como bot

### 2. **Campo Honeypot** 🍯
- **Campo agregado**: `company` (oculto del usuario)
- **Estrategia**: Los bots suelen completar todos los campos, incluyendo los ocultos
- **Comportamiento**: 
  - Si el campo está lleno → se retorna HTTP 200 pero NO se procesa el mensaje
  - Los bots piensan que tuvieron éxito, pero el mensaje se descarta silenciosamente

### 3. **Validaciones Mejoradas** ✔️
- **Longitud mínima**:
  - Nombre: mínimo 2 caracteres
  - Mensaje: mínimo 10 caracteres
- **Email**:
  - Formato válido (regex)
  - Bloqueo de dominios desechables (15+ dominios conocidos)
- **Sanitización**:
  - Remoción de caracteres peligrosos (`<`, `>`)
  - Trim de espacios en blanco

### 4. **Email Sender Seguro** 📧
- **Campo `From`**: Siempre usa el email del dominio (`GMAIL_USER`)
- **Campo `replyTo`**: Contiene el email del usuario (sanitizado)
- **Beneficio**: Previene spoofing y problemas de entregabilidad

---

## 📁 Archivos Modificados

### 1. `package.json`
- ✅ Agregada dependencia `botid`

### 2. `next.config.mjs`
```javascript
import { withBotId } from 'botid/next/config'
export default withBotId(nextConfig)
```
- ✅ Configuración de BotID envolviendo la config de Next.js
- ⚠️ **Importante**: El import debe ser desde `botid/next/config`, no solo `botid`

### 3. `components/botid-client.tsx` (NUEVO)
```javascript
import { BotIdClient } from 'botid/client'

<BotIdClient protect={[{ path: '/api/contact', method: 'POST' }]} />
```
- ✅ Componente cliente que protege la ruta del formulario de contacto
- ⚠️ **Importante**: El import debe ser desde `botid/client`

### 4. `app/layout.tsx`
```javascript
import BotIdProtection from "@/components/botid-client"
// ...
<BotIdProtection />
```
- ✅ BotID agregado al layout principal para protección global

### 5. `components/contact-section.tsx`
- ✅ Agregado campo honeypot `company` al estado del formulario
- ✅ Campo honeypot oculto en el HTML con `className="hidden"`
- ✅ `tabIndex={-1}` y `autoComplete="off"` para evitar que usuarios reales lo completen

### 6. `app/api/contact/route.ts`
**Cambios principales:**
- ✅ Importado `checkBotId` de `botid/server`
- ✅ Lista de dominios desechables (`DISPOSABLE_EMAIL_DOMAINS`)
- ✅ Función `isValidEmail()` que valida formato y dominios
- ✅ Función `sanitizeString()` para limpiar inputs
- ✅ **PASO 1**: Verificación BotID al inicio
- ✅ **PASO 2**: Verificación de honeypot
- ✅ **PASO 3**: Validaciones de longitud mínima
- ✅ **PASO 4**: Validación de email y dominios desechables
- ✅ **PASO 5**: Sanitización de todos los inputs
- ✅ Email sender seguro: `from` usa dominio, `replyTo` usa email del usuario

---

## 🔐 Cómo Funciona (Flujo de Protección)

```
Usuario envía formulario
         ↓
1. BotID analiza el request (navegador, comportamiento, etc.)
   ├─→ Bot detectado → ❌ HTTP 403 (bloqueado)
   └─→ Humano → ✅ Continúa
         ↓
2. Verificar campo honeypot "company"
   ├─→ Campo lleno → ❌ HTTP 200 (ignorado silenciosamente)
   └─→ Campo vacío → ✅ Continúa
         ↓
3. Validar longitud mínima de campos
   ├─→ No cumple → ❌ HTTP 400 con mensaje de error
   └─→ Cumple → ✅ Continúa
         ↓
4. Validar email (formato + dominio desechable)
   ├─→ Inválido o desechable → ❌ HTTP 400
   └─→ Válido → ✅ Continúa
         ↓
5. Sanitizar todos los inputs (remover < y >)
         ↓
6. Enviar email con configuración segura
         ↓
7. ✅ Guardar en base de datos (si existe la tabla)
```

---

## 🚀 Para Desplegar en Vercel

### Variables de Entorno Requeridas
Asegúrate de tener estas variables configuradas en Vercel:

```bash
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-password-de-aplicacion
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Comandos de Despliegue
```bash
# Build local para verificar
npm run build

# Deploy a Vercel (automático si está conectado a Git)
git add .
git commit -m "feat: Implementar protección anti-spam con BotID y honeypot"
git push origin main
```

---

## 📊 Beneficios de Esta Implementación

| Beneficio | Descripción |
|-----------|-------------|
| 🚫 **Sin CAPTCHA** | No afecta la UX - usuarios no ven captchas molestos |
| 🤖 **Multi-capa** | Varias defensas: BotID + Honeypot + Validaciones |
| 🔒 **Seguro** | Email sender correcto, sanitización de inputs |
| ⚡ **Rápido** | BotID es muy eficiente, no agrega latencia notable |
| 📈 **Escalable** | Funciona en producción sin problemas de rendimiento |

---

## 🧪 Cómo Probar

### Test 1: Usuario Normal (debe funcionar)
1. Ir a la página de contacto
2. Llenar nombre (>2 chars), email válido, mensaje (>10 chars)
3. Enviar
4. ✅ Debe recibir mensaje de éxito

### Test 2: Honeypot (debe ignorarse)
1. Abrir DevTools → Console
2. Ejecutar:
```javascript
fetch('/api/contact', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test',
    email: 'test@test.com',
    message: 'Test message here',
    company: 'Spam Company' // ← Honeypot lleno
  })
})
```
3. ✅ Retorna 200 pero NO envía email

### Test 3: Validaciones (debe rechazar)
1. Intentar enviar con:
   - Nombre de 1 carácter → ❌ Rechazado
   - Mensaje de 5 caracteres → ❌ Rechazado
   - Email `test@tempmail.com` → ❌ Rechazado (dominio desechable)

---

## 📝 Notas Adicionales

### Nota sobre App Router vs Pages Router
El proyecto usa **App Router** (Next.js 13+), no Pages Router como se mencionó inicialmente. La implementación se adaptó correctamente para App Router.

### Dominios Desechables
La lista actual incluye 15 dominios comunes. Puedes agregar más en:
```
DisciplineRift-FrontEnd/app/api/contact/route.ts
→ Constante DISPOSABLE_EMAIL_DOMAINS
```

### Logs en Consola
El API handler incluye logs detallados:
- `🚫 Bot detected by BotID` → BotID bloqueó
- `🚫 Honeypot triggered` → Honeypot activado
- `✅ Contact email sent successfully` → Email enviado correctamente

---

## 🆘 Troubleshooting

### BotID no funciona
1. Verificar que `botid` esté instalado: `npm list botid`
2. Verificar que `withBotId` esté en `next.config.mjs` con el import correcto: `import { withBotId } from 'botid/next/config'`
3. Verificar que `<BotIdProtection />` esté en el layout
4. **Errores de import**: Los imports deben ser específicos:
   - Config: `import { withBotId } from 'botid/next/config'`
   - Cliente: `import { BotIdClient } from 'botid/client'`
   - Servidor: `import { checkBotId } from 'botid/server'`

### Honeypot siempre se activa
1. Verificar que el campo esté oculto con `className="hidden"`
2. No usar `display: none` en CSS (algunos frameworks lo detectan)
3. Verificar que `tabIndex={-1}` esté presente

### Emails no se envían
1. Verificar variables de entorno en Vercel
2. Verificar logs del API handler
3. El sistema retorna 200 incluso si falla el email (UX)

---

## ✨ Resultado Final

El formulario de contacto ahora está protegido contra spam con:
- ✅ Detección automática de bots (BotID)
- ✅ Honeypot invisible
- ✅ Validaciones robustas
- ✅ Email sender seguro
- ✅ **Sin afectar la experiencia del usuario**

**¡El spam de bots debería reducirse significativamente!** 🎉

