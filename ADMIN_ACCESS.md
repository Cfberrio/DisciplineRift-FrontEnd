# 🔐 Admin Analytics Access

## Credenciales de Acceso

**URL de Login:** `/admin/login`

- **Usuario:** `admin@disciplinerift.com`
- **Contraseña:** `Disciplinerift2025`

## Acceso Rápido

1. Navega a `https://tudominio.com/admin/login`
2. Ingresa las credenciales
3. Serás redirigido automáticamente a `/admin/analytics`

## Características

### ✅ Autenticación
- Login protegido con email y contraseña
- Sesión guardada en localStorage
- Redirección automática si no estás autenticado

### 📊 Analytics Dashboard
- Integración completa con **Vercel Analytics**
- Tracking automático de todas las páginas del sitio
- Métricas disponibles:
  - Visitantes únicos
  - Page views
  - Top páginas
  - Referrers
  - Dispositivos (Desktop/Mobile/Tablet)
  - Ubicaciones geográficas

### 🔒 Seguridad
- Las rutas `/admin/analytics` están protegidas
- Requiere autenticación válida
- Botón de cerrar sesión disponible

## Ver Métricas Completas

Las métricas detalladas se visualizan en el **Vercel Dashboard**:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Click en la pestaña "Analytics"

## Notas Técnicas

- **Componente usado:** `@vercel/analytics/react`
- **Tracking:** Se ejecuta en todo el sitio web automáticamente
- **Delay:** Los datos pueden tardar hasta 24 horas en aparecer después del primer deploy

## Estructura de Archivos

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          # Página de login
│   └── analytics/
│       └── page.tsx          # Dashboard de analytics
└── layout.tsx                # Analytics agregado globalmente
```

## Cerrar Sesión

Click en el botón **"Cerrar Sesión"** en la esquina superior derecha del dashboard de analytics.


