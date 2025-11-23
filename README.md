# Discipline Rift - Volleyball Registration Platform

![Discipline Rift](https://img.shields.io/badge/Status-Active-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.2.4-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🏐 Descripción

**Discipline Rift** es una plataforma completa para registro y gestión de entrenamientos de volleyball. Diseñada para academias deportivas, permite a los padres registrar a sus hijos en equipos, realizar pagos seguros y gestionar toda la información de manera eficiente.

## ✨ Características Principales

### 🎯 Para Padres/Usuarios
- **Registro de Estudiantes**: Sistema completo de registro con información médica y de emergencia
- **Selección de Equipos**: Explorar y seleccionar equipos por edad, nivel y ubicación
- **Pagos Seguros**: Integración con Stripe para procesar pagos
- **Dashboard Personal**: Seguimiento del progreso y actividades

### 👨‍💼 Para Administradores
- **Panel de Administración**: Sistema de login con credenciales seguras
- **Gestión de Estudiantes**: CRUD completo de estudiantes registrados
- **Gestión de Equipos**: Administración de equipos y sesiones
- **Reportes y Analytics**: Seguimiento de registros y pagos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe
- **UI Components**: Radix UI + shadcn/ui
- **Animaciones**: Framer Motion / CSS Animations
- **SEO**: next-sitemap, JSON-LD breadcrumbs, optimized metadata

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase
- Cuenta de Stripe

### 1. Clonar el repositorio
```bash
git clone https://github.com/Cfberrio/DisciplineRift-Frontend.git
cd DisciplineRift-Frontend
```

### 2. Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_SECRET_KEY=tu_stripe_secret_key

# Gmail SMTP Configuration (para emails automáticos)
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu_gmail_app_password

# Jobs y Schedulers (opcional)
ENABLE_SCHEDULERS=1              # Habilitar jobs automáticos en desarrollo
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`


## 📱 Funcionalidades

### Flujo de Registro
1. **Búsqueda de Equipos**: Los usuarios buscan equipos por escuela/ubicación
2. **Selección de Equipo**: Eligen el equipo que mejor se adapte a sus necesidades
3. **Autenticación**: Login o registro de cuenta de padre/tutor
4. **Información del Estudiante**: Completar datos del estudiante y contacto de emergencia
5. **Revisión**: Verificar toda la información antes del pago
6. **Pago Seguro**: Procesamiento a través de Stripe
7. **Confirmación**: Mensaje de éxito y acceso al dashboard

### Panel de Administración
- **Gestión de Estudiantes**: Ver, crear, editar y eliminar registros
- **Dashboard de Analytics**: Métricas de registros y pagos
- **Gestión de Equipos**: Administrar equipos y horarios

## 🏗️ Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Panel de administración
│   └── payment/           # Páginas de pago
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   └── ...               # Componentes específicos
├── jobs/                  # Jobs programados y tareas automáticas
├── lib/                   # Utilidades y configuraciones
├── hooks/                 # Custom React Hooks
├── scripts/               # Scripts CLI para mantenimiento
└── public/               # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo y producción
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter

# Jobs y recordatorios automáticos
npm run season-reminders           # Ejecutar recordatorios de temporada
npm run season-reminders:dry-run   # Modo prueba (no envía emails)
npm run season-reminders:test      # Ejecutar con fecha de prueba
```

## 🤖 Jobs Automáticos y Recordatorios

### Recordatorios de Temporada

El sistema incluye un job automático que envía recordatorios por email a los padres cuando la temporada de su equipo está a punto de comenzar.

#### Características:
- **Programación**: Se ejecuta diariamente a las 20:30 (hora de Miami/Nueva York)
- **Criterio**: Envía emails cuando la temporada comienza exactamente en 30 días
- **Deduplicación**: Un email por padre por sesión (aunque tenga múltiples hijos en el mismo equipo)
- **Contenido**: Incluye horario completo de la temporada con fechas y horas específicas

#### Configuración Requerida:
```env
# Supabase para acceso a datos
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Gmail para envío de emails
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu_gmail_app_password
```

#### Ejecución Manual:
```bash
# Ejecutar con fecha actual
npm run season-reminders

# Modo prueba (recomendado para testing)
npm run season-reminders:dry-run

# Ejecutar con fecha específica para testing
TEST_DATE=2024-01-15 npm run season-reminders
```

#### Configuración de Gmail:

1. **Habilitar 2FA** en tu cuenta de Google
2. **Generar App Password**:
   - Ve a [Google Account Security](https://myaccount.google.com/security)
   - Selecciona "App passwords"
   - Selecciona "Mail" como aplicación
   - Copia la contraseña de 16 caracteres
3. **Configurar variables**:
   - `GMAIL_USER`: Tu dirección de Gmail
   - `GMAIL_APP_PASSWORD`: La contraseña de aplicación generada

#### Activación del Scheduler:

- **Producción**: Se activa automáticamente
- **Desarrollo**: Requiere `ENABLE_SCHEDULERS=1` en `.env.local`

#### Logs y Monitoreo:

El job proporciona logs detallados:
- Sesiones encontradas y procesadas
- Enrollments y padres identificados
- Emails enviados exitosamente
- Errores y problemas encontrados

## 🎨 Diseño y UI

- **Design System**: Implementación consistente con Tailwind CSS
- **Componentes**: Sistema de componentes reutilizables con shadcn/ui
- **Responsive**: Diseño completamente adaptable a móviles y desktop
- **Animaciones**: Transiciones suaves y animaciones de entrada

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas soporte, puedes:
- Abrir un Issue en GitHub
- Contactar al equipo de desarrollo

---

---

## 🔍 SEO & Google Sitelinks Setup

### Arquitectura SEO Optimizada

Este proyecto está configurado para maximizar la visibilidad en Google y favorecer la aparición de **sitelinks** (enlaces internos bajo el resultado principal).

#### 📄 Páginas Clave Indexables

Tres páginas principales optimizadas para sitelinks:

- **`/register`** - Registro de estudiantes  
- **`/programs`** - Programas deportivos  
- **`/contact`** - Información de contacto

#### ✅ Características SEO Implementadas

1. **Metadatos Completos**: Title único, meta descriptions, canonical URLs, Open Graph, Twitter Cards
2. **JSON-LD Breadcrumbs**: Breadcrumbs estructurados en cada página (Home → [Página])
3. **Navegación Interna Clara**: Enlaces prominentes desde la Home con anchor text descriptivo
4. **Sitemap.xml Automático**: Generado en cada build con prioridades configuradas
5. **robots.txt Optimizado**: Permite indexación de páginas públicas, bloquea privadas

#### 🚀 Post-Deploy: Google Search Console

Después de desplegar en Vercel:

1. **Verificar dominio**: https://search.google.com/search-console
2. **Enviar sitemap**: https://www.disciplinerift.com/sitemap.xml
3. **Solicitar indexación**: Para /, /register, /programs, /contact

#### ⏱️ Tiempo Estimado para Sitelinks

- **1-2 semanas**: Indexación completa
- **1-3 meses**: Posible aparición de sitelinks
- **3-6 meses**: Sitelinks consolidados

> Los sitelinks son generados automáticamente por Google. Mantén la estructura clara y los enlaces internos.

---

**Desarrollado con ❤️ para la comunidad de volleyball** 
