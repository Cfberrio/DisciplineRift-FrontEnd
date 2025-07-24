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
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Acceso Administrativo

Para acceder al panel de administración:

1. Visita `/dashboard`
2. Utiliza las credenciales:
   - **Email**: admin@disciplinerift.com
   - **Contraseña**: admin123

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
├── lib/                   # Utilidades y configuraciones
├── hooks/                 # Custom React Hooks
└── public/               # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

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

**Desarrollado con ❤️ para la comunidad de volleyball** 