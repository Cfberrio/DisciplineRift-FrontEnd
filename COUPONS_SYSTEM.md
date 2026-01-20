# Sistema de Cupones

## Descripción General

Sistema completo de gestión de cupones de descuento para los programas de Discipline Rift. Permite crear, activar/desactivar y validar códigos promocionales con porcentajes de descuento.

## Estructura de Base de Datos

### Tabla: `coupon`

```sql
create table public.coupon (
  couponid uuid not null default gen_random_uuid (),
  code text not null,
  percentage integer not null,
  isactive boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint coupon_pkey primary key (couponid),
  constraint coupon_code_key unique (code),
  constraint coupon_code_upper check ((code = upper(code))),
  constraint coupon_percentage_check check (
    (
      (percentage >= 0)
      and (percentage <= 100)
    )
  )
) TABLESPACE pg_default;
```

**Campos:**
- `couponid`: Identificador único (UUID)
- `code`: Código del cupón (único, siempre en mayúsculas)
- `percentage`: Porcentaje de descuento (0-100)
- `isactive`: Estado del cupón (activo/inactivo)
- `created_at`: Fecha de creación

**Constraints:**
- `coupon_code_key`: Garantiza códigos únicos
- `coupon_code_upper`: Fuerza códigos en mayúsculas
- `coupon_percentage_check`: Valida porcentaje entre 0-100

## API Routes

### 1. Listar Cupones
**Endpoint:** `GET /api/coupons/list`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "coupons": [
    {
      "couponid": "uuid",
      "code": "DESCUENTO25",
      "percentage": 25,
      "isactive": true,
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### 2. Crear Cupón
**Endpoint:** `POST /api/coupons/create`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "code": "VERANO2024",
  "percentage": 30
}
```

**Respuesta:**
```json
{
  "coupon": {
    "couponid": "uuid",
    "code": "VERANO2024",
    "percentage": 30,
    "isactive": true,
    "created_at": "2024-01-20T10:00:00Z"
  },
  "message": "Coupon created successfully"
}
```

**Validaciones:**
- El código es obligatorio
- El porcentaje debe estar entre 0 y 100
- El código se convierte automáticamente a mayúsculas
- No se permiten códigos duplicados

### 3. Activar/Desactivar Cupón
**Endpoint:** `PATCH /api/coupons/toggle`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "couponid": "uuid",
  "isactive": false
}
```

**Respuesta:**
```json
{
  "coupon": {
    "couponid": "uuid",
    "code": "VERANO2024",
    "percentage": 30,
    "isactive": false,
    "created_at": "2024-01-20T10:00:00Z"
  },
  "message": "Coupon deactivated successfully"
}
```

### 4. Validar Cupón
**Endpoint:** `POST /api/coupons/validate`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "code": "VERANO2024"
}
```

**Respuesta (Válido):**
```json
{
  "valid": true,
  "coupon": {
    "couponid": "uuid",
    "code": "VERANO2024",
    "percentage": 30
  },
  "message": "Coupon is valid"
}
```

**Respuesta (Inválido):**
```json
{
  "valid": false,
  "message": "Invalid or inactive coupon code"
}
```

## Interfaz de Usuario

### Ubicación
`/dashboard/coupons`

### Características

1. **Dashboard de Estadísticas**
   - Contador de cupones activos
   - Contador de cupones inactivos

2. **Lista de Cupones**
   - Vista de todos los cupones
   - Indicador visual de estado (activo/inactivo)
   - Información detallada: código, porcentaje, fecha de creación
   - Botón para activar/desactivar

3. **Formulario de Creación**
   - Campo para código (se convierte a mayúsculas automáticamente)
   - Campo para porcentaje (0-100)
   - Validación en tiempo real
   - Mensajes de error claros

4. **Navegación**
   - Icono de ticket en el sidebar
   - Acceso desde menú principal

## Seguridad

- Todas las operaciones requieren autenticación (excepto validación)
- Se utiliza Supabase Service Role Key para operaciones administrativas
- Los códigos se fuerzan a mayúsculas a nivel de base de datos
- Validación de porcentajes a nivel de base de datos y API

## Uso en Checkout

Para integrar los cupones en el flujo de pago:

1. El usuario ingresa un código de cupón
2. Se llama a `/api/coupons/validate` con el código
3. Si es válido, se aplica el porcentaje de descuento al total
4. El descuento se muestra en el resumen de pago

**Ejemplo de cálculo:**
```typescript
const originalPrice = 100
const discountPercentage = 25 // del cupón validado
const discountAmount = originalPrice * (discountPercentage / 100)
const finalPrice = originalPrice - discountAmount
// finalPrice = 75
```

## Consideraciones Futuras

Posibles mejoras para el sistema:

1. **Fecha de expiración**: Agregar campos `valid_from` y `valid_until`
2. **Límite de usos**: Agregar campo `max_uses` y tabla de tracking
3. **Aplicabilidad**: Restringir cupones a ciertos equipos/escuelas
4. **Historial de uso**: Tabla de auditoría con `coupon_usage`
5. **Stacking**: Definir si se pueden combinar múltiples cupones

## Archivos Creados/Modificados

### Nuevos Archivos
- `app/api/coupons/list/route.ts`
- `app/api/coupons/create/route.ts`
- `app/api/coupons/toggle/route.ts`
- `app/api/coupons/validate/route.ts`
- `app/dashboard/coupons/page.tsx`
- `COUPONS_SYSTEM.md`

### Archivos Modificados
- `lib/supabase.ts` - Agregada interfaz `Coupon`
- `app/dashboard/layout.tsx` - Agregado item de navegación "Coupons"
