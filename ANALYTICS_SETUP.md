# 📊 Analytics Setup Guide

## Resumen de Opciones

Tienes **2 formas** de ver tus analytics:

### **Opción 1: Solo Vercel Dashboard (MÁS SIMPLE)** ✅
- **Ventaja:** Ya está funcionando, cero configuración adicional
- **Desventaja:** Tienes que ir a vercel.com cada vez
- **Recomendado para:** Si no quieres configurar nada extra

### **Opción 2: Analytics en tu Dashboard Admin (MÁS COMPLETO)** ⭐
- **Ventaja:** Ves todo desde tu propio dashboard en `/admin/analytics`
- **Desventaja:** Requiere configurar la API de Vercel (5 minutos)
- **Recomendado para:** Si quieres tener todo centralizado

---

## 🚀 Opción 1: Usar Vercel Dashboard Directamente

### Ya está configurado ✅
El componente `<Analytics />` ya está instalado y funcionando en todo tu sitio.

### Cómo ver los datos:
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto "DisciplineRift-FrontEnd"
3. Click en la pestaña **"Analytics"**
4. Listo! Verás:
   - Visitantes únicos
   - Page views
   - Top páginas
   - Referrers
   - Dispositivos
   - Ubicaciones

---

## 🎯 Opción 2: Analytics en tu Dashboard Admin

### Paso 1: Obtener Token de Vercel

1. Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click en **"Create Token"**
3. Nombre del token: `Analytics API`
4. Scope: Selecciona **"Full Account"** o solo los proyectos que necesites
5. Expiration: **No Expiration** (para que no caduque)
6. Click en **"Create"**
7. **Copia el token** (solo lo verás una vez)

### Paso 2: Obtener Team ID y Project ID

#### Team ID:
1. Ve a tu dashboard de Vercel
2. La URL será algo como: `vercel.com/[team-name]/dashboard`
3. El `team-name` es tu **Team ID**

O también:
1. Ve a [vercel.com/account](https://vercel.com/account)
2. En "General" verás tu **Team ID**

#### Project ID:
1. Ve a tu proyecto en Vercel
2. Settings → General
3. Copia el **Project ID** (es un hash largo como `prj_abc123...`)

### Paso 3: Configurar Variables de Entorno

Abre tu archivo `.env.local` y agrega estas variables:

```bash
# Analytics API Configuration
VERCEL_ANALYTICS_TOKEN=tu_token_aqui
VERCEL_TEAM_ID=tu_team_id_aqui
VERCEL_PROJECT_ID=tu_project_id_aqui
ADMIN_AUTH_TOKEN=admin-token-123
```

**Ejemplo:**
```bash
VERCEL_ANALYTICS_TOKEN=vercel_abc123def456ghi789jkl012mno345pqr678stu901vwx234
VERCEL_TEAM_ID=team_abc123def456
VERCEL_PROJECT_ID=prj_abc123def456ghi789
ADMIN_AUTH_TOKEN=admin-token-123
```

### Paso 4: Reiniciar el Servidor

```bash
# Para el servidor de desarrollo actual
# Luego reinícialo:
npm run dev
```

### Paso 5: Verificar

1. Ve a `http://localhost:3000/admin/login`
2. Login con:
   - **Email:** `admin@disciplinerift.com`
   - **Password:** `Disciplinerift2025`
3. Serás redirigido a `/admin/analytics`
4. Deberías ver tus datos reales de analytics!

---

## 📊 ¿Qué datos verás en tu Dashboard?

### Métricas Principales:
- **Visitantes Únicos:** Personas que han visitado tu sitio
- **Page Views:** Total de páginas vistas
- **Desktop:** Visitantes desde computadora
- **Mobile:** Visitantes desde celular

### Secciones Detalladas:
- **Top Páginas:** Las 10 páginas más visitadas
- **Países:** De dónde vienen tus visitantes
- **Dispositivos:** Desktop vs Mobile vs Tablet
- **Períodos:** 24h, 7 días, 30 días, 90 días

---

## 🔧 Troubleshooting

### Problema: "Analytics not configured"
**Solución:** Verifica que las 4 variables de entorno estén correctas en `.env.local`

### Problema: "Unauthorized" o 401 Error
**Solución:** 
1. Verifica que el token de Vercel sea correcto
2. Verifica que el token tenga permisos suficientes
3. Regenera el token si es necesario

### Problema: "Could not find a relationship"
**Solución:** 
1. Verifica que el `VERCEL_PROJECT_ID` sea correcto
2. Verifica que el `VERCEL_TEAM_ID` sea correcto
3. Asegúrate de que el proyecto esté en el team correcto

### Problema: Los datos no aparecen
**Solución:**
1. Los datos pueden tardar hasta 24 horas en aparecer después del primer deploy
2. Verifica que el sitio haya tenido visitas reales
3. Prueba visitando el sitio en modo incognito varias veces

---

## 🔒 Seguridad

### Variables Sensibles
**NUNCA** subas a GitHub las siguientes variables:
- `VERCEL_ANALYTICS_TOKEN`
- `ADMIN_AUTH_TOKEN`

### Recomendaciones:
1. Mantén `.env.local` en `.gitignore`
2. En producción, configura las variables en Vercel:
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega todas las variables necesarias

---

## 📈 Comparación Final

| Característica | Opción 1: Vercel Dashboard | Opción 2: Tu Dashboard |
|----------------|---------------------------|------------------------|
| **Configuración** | ✅ Ya está listo | ⚙️ 5 minutos |
| **Datos en tiempo real** | ✅ Sí | ✅ Sí |
| **Ubicación** | vercel.com | tu-sitio.com/admin/analytics |
| **Métricas avanzadas** | ✅ Más completas | 📊 Principales |
| **Costo** | 🆓 Gratis | 🆓 Gratis |
| **Mantenimiento** | 🔧 Cero | 🔧 Mínimo |

---

## 🎯 Recomendación

**Para empezar:** Usa la **Opción 1** (Vercel Dashboard) porque ya está funcionando.

**Para el futuro:** Configura la **Opción 2** cuando quieras tener todo centralizado en un solo lugar.

**Lo mejor:** Usa ambas! Vercel Dashboard para análisis profundo, y tu Dashboard para métricas rápidas del día a día.

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas con la configuración, revisa:
1. Que todas las variables de entorno estén correctas
2. Que el servidor esté reiniciado después de agregar las variables
3. Que el token de Vercel tenga permisos suficientes
4. Los logs en la consola del navegador (F12)



