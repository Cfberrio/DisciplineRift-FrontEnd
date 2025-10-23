# Protección Anti-Spam: Formulario de Aplicación (Join Team)

## 📋 Resumen
Se han aplicado las mismas medidas anti-spam del formulario de contacto al **formulario de aplicación de coaches** (Join Team). Sin afectar la experiencia del usuario, sin CAPTCHAs visibles.

---

## ✅ Medidas Implementadas

### 1. **Vercel BotID** 🤖
- **Ruta protegida**: `/api/apply` agregada a BotIdClient
- **Función**: Detección inteligente de bots antes de procesar la aplicación
- **Resultado**: Bloqueo automático (HTTP 403) para tráfico identificado como bot

### 2. **Campo Honeypot** 🍯
- **Campo agregado**: `company` (oculto del usuario)
- **Comportamiento**: 
  - Si el campo está lleno → retorna HTTP 200 pero NO procesa la aplicación
  - La aplicación se descarta silenciosamente

### 3. **Validaciones Mejoradas** ✔️
- **Longitud mínima**:
  - Nombre: mínimo 2 caracteres
  - Apellido: mínimo 2 caracteres
  - Teléfono: mínimo 10 caracteres
  - Dirección: mínimo 10 caracteres
  - Descripción: mínimo 20 caracteres
- **Email**:
  - Formato válido (regex)
  - **33 dominios desechables bloqueados** (USA/Latam)
- **Sanitización**:
  - Remoción de caracteres peligrosos (`<`, `>`)
  - Trim de espacios en blanco
  - Conversión de email a lowercase

### 4. **Validación de Archivos PDF** 📄
- Máximo 10MB
- Solo PDFs permitidos
- Validación de tipo MIME

---

## 📁 Archivos Modificados

### 1. `components/botid-client.tsx`
```javascript
protect={[
  { path: '/api/contact', method: 'POST' },
  { path: '/api/apply', method: 'POST' }  // ← NUEVO
]}
```
- ✅ Agregada protección para `/api/apply`

### 2. `components/join-team-section.tsx`
- ✅ Agregado campo honeypot `company` al estado del formulario
- ✅ Campo honeypot oculto en el HTML con `className="hidden"`
- ✅ `tabIndex={-1}` y `autoComplete="off"` para evitar autofill
- ✅ Campo enviado con FormData al API

### 3. `app/api/apply/route.ts`
**Cambios principales:**
- ✅ Importado `checkBotId` de `botid/server`
- ✅ Lista de 33 dominios desechables (USA/Latam)
- ✅ Función `isValidEmail()` que valida formato y dominios
- ✅ Función `sanitizeString()` para limpiar inputs
- ✅ **PASO 1**: Verificación BotID al inicio
- ✅ **PASO 2**: Verificación de honeypot
- ✅ **PASO 3**: Validaciones de longitud mínima
- ✅ **PASO 4**: Validación de email y dominios desechables
- ✅ **PASO 5**: Sanitización de todos los inputs
- ✅ Datos sanitizados guardados en la base de datos

---

## 🔐 Flujo de Protección

```
Usuario envía aplicación
         ↓
1. BotID analiza el request
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
5. Sanitizar todos los inputs
         ↓
6. Validar PDF (si existe)
   ├─→ No válido → ❌ HTTP 413/415
   └─→ Válido → ✅ Continúa
         ↓
7. Guardar en base de datos con datos sanitizados
         ↓
8. Subir PDF a Storage (si existe)
         ↓
9. ✅ Enviar email de confirmación
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Detección de bots** | ❌ Ninguna | ✅ BotID activo |
| **Honeypot** | ❌ No | ✅ Campo oculto |
| **Validación email** | ⚠️ Solo formato | ✅ Formato + 33 dominios bloqueados |
| **Validación longitud** | ⚠️ Solo requerido | ✅ Longitudes mínimas específicas |
| **Sanitización** | ⚠️ Solo trim() | ✅ Sanitización + trim() + lowercase |
| **Protección XSS** | ❌ No | ✅ Remoción de < y > |

---

## 🧪 Cómo Probar

### Test 1: Usuario Normal (debe funcionar)
1. Ir a la sección "Join Team"
2. Llenar todos los campos correctamente
3. Enviar
4. ✅ Debe recibir mensaje de éxito y email de confirmación

### Test 2: Honeypot (debe ignorarse)
```javascript
const formData = new FormData()
formData.append('firstName', 'Test')
formData.append('lastName', 'User')
formData.append('email', 'test@test.com')
formData.append('number', '1234567890')
formData.append('currentAddre', '123 Test Street')
formData.append('description', 'This is a test description for the application')
formData.append('company', 'Spam Company') // ← Honeypot lleno

fetch('/api/apply', {
  method: 'POST',
  body: formData
})
```
✅ Retorna 200 pero NO guarda en la base de datos

### Test 3: Email Desechable (debe rechazar)
1. Intentar aplicar con `test@tempmail.com`
2. ❌ Debe rechazar con "Please provide a valid email address"

### Test 4: Campos Muy Cortos (debe rechazar)
1. Nombre de 1 carácter → ❌ Rechazado
2. Descripción de 10 caracteres → ❌ Rechazado
3. Dirección de 5 caracteres → ❌ Rechazado

---

## 🎯 Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| 🚫 **Sin CAPTCHA** | No afecta la UX - usuarios no ven captchas |
| 🤖 **Multi-capa** | BotID + Honeypot + Validaciones robustas |
| 🔒 **Seguro** | Sanitización previene XSS y SQL injection |
| ⚡ **Rápido** | Sin latencia notable para usuarios reales |
| 📈 **Completo** | Mismas protecciones que el formulario de contacto |

---

## 🆘 Troubleshooting

### Aplicaciones legítimas son rechazadas
1. Verificar que los mensajes de error sean claros
2. Verificar longitudes mínimas (descripción: 20 chars)
3. Verificar que el email no esté en la lista de dominios desechables

### Honeypot se activa para usuarios reales
1. Verificar que `className="hidden"` esté presente
2. Verificar que `tabIndex={-1}` esté configurado
3. No usar `display: none` en CSS

### BotID bloquea tráfico legítimo
1. Revisar logs de Vercel
2. Verificar que `isVerifiedBot` permita bots buenos
3. Contactar soporte de Vercel si persiste

---

## 📝 Notas Importantes

### Dominios USA/Colombia
La lista de dominios desechables incluye los más populares en Estados Unidos y América Latina, considerando que esos son los mercados principales.

### Validación de Descripción
La descripción requiere **mínimo 20 caracteres** para evitar respuestas genéricas de bots.

### PDF Opcional
El PDF de currículum es **opcional**, pero si se envía, debe cumplir:
- Tipo: `application/pdf`
- Tamaño: Máximo 10MB

---

## ✨ Resultado Final

El formulario de aplicación ahora tiene:
- ✅ Protección idéntica al formulario de contacto
- ✅ Detección automática de bots (BotID)
- ✅ Honeypot invisible
- ✅ Validaciones robustas específicas para aplicaciones
- ✅ Sanitización completa de datos
- ✅ **Sin afectar la experiencia del usuario**

**¡El spam de bots en las aplicaciones debería eliminarse por completo!** 🎉

---

## 🔗 Ver También

- [ANTI_SPAM_IMPLEMENTATION.md](./ANTI_SPAM_IMPLEMENTATION.md) - Protección del formulario de contacto
- Componente: `components/join-team-section.tsx`
- API Handler: `app/api/apply/route.ts`
- Protección BotID: `components/botid-client.tsx`










