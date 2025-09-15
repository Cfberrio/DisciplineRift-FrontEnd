# 📧 Sistema de Preview de Correos - Discipline Rift

## Descripción
Este sistema permite generar previews HTML de los correos de recordatorio de temporada para probar y visualizar cómo se verán los emails antes de ser enviados a los padres.

## ✅ Archivos Restaurados

### Scripts de Preview
- ✅ `generate-1week-september-18-preview.js` - Preview específico para September 18, 2025
- ✅ `generate-1week-september-19-preview.js` - Preview específico para September 19, 2025  
- ✅ `generate-email-preview.js` - Script genérico que acepta cualquier fecha

### Scripts NPM Agregados
```json
{
  "preview-september-18": "node generate-1week-september-18-preview.js",
  "preview-september-19": "node generate-1week-september-19-preview.js", 
  "generate-email-preview": "node generate-email-preview.js"
}
```

## 🚀 Uso

### Scripts Específicos por Fecha
```bash
# Preview para September 18, 2025
npm run preview-september-18

# Preview para September 19, 2025  
npm run preview-september-19
```

### Script Genérico (Recomendado)
```bash
# Usar fecha por defecto (2025-09-19)
npm run generate-email-preview

# Especificar fecha personalizada
npm run generate-email-preview 2025-09-20
npm run generate-email-preview 2025-10-15
npm run generate-email-preview 2024-12-01
```

## 📋 Requisitos

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Dependencias (Ya instaladas)
- `@supabase/supabase-js` - Cliente de Supabase
- `luxon` - Manejo de fechas y timezones
- `dotenv` - Variables de entorno

## 📁 Archivos Generados

Los scripts generan archivos HTML en el directorio del proyecto:

### Scripts Específicos
- `real-1week-september-18-preview.html` (desde preview-september-18)
- `real-1week-september-19-preview.html` (desde preview-september-19)

### Script Genérico  
- `email-preview-YYYYMMDD.html` (formato: email-preview-20250919.html)

## 🔍 Qué Hace el Script

1. **Conecta a Supabase** usando las variables de entorno
2. **Busca sesiones** que inician en la fecha especificada
3. **Encuentra inscripciones activas** para esas sesiones
4. **Resuelve datos** de estudiantes y padres
5. **Construye el horario** de temporada completo
6. **Genera HTML** usando el template de email
7. **Guarda archivo** de preview para visualización

## 📧 Contenido del Email Preview

El preview incluye:
- ✅ Header con branding de Discipline Rift
- ✅ Badge de "1-Week Reminder"  
- ✅ Información del padre (nombre)
- ✅ Nombre del equipo
- ✅ Fecha de inicio de temporada
- ✅ Horario completo de temporada con fechas específicas
- ✅ Footer con información de contacto
- ✅ Diseño responsive y visualmente atractivo

## 🎯 Casos de Uso

### Para Desarrolladores
```bash
# Probar email para fecha específica durante desarrollo
npm run generate-email-preview 2025-01-15
```

### Para Testing
```bash
# Generar previews para fechas conocidas con datos
npm run preview-september-19  # Sabemos que tiene datos
```

### Para Debugging
```bash
# El script muestra información detallada en consola:
# - Número de sesiones encontradas
# - Información del equipo y padre procesado  
# - Nombre del archivo generado
```

## ⚠️ Solución de Problemas

### "No hay sesiones para esa fecha"
- Verificar que existan sesiones en la base de datos para esa fecha
- Usar fechas como 2025-09-19 que sabemos que tienen datos

### "No hay inscripciones activas"
- El script intentará procesar múltiples sesiones automáticamente
- Si ninguna tiene inscripciones activas, no se generará preview

### "Error de configuración de Supabase"
- Verificar que `.env.local` exista y tenga las variables correctas
- Verificar que las URLs y keys de Supabase sean válidas

## 📚 Scripts Relacionados

El sistema también incluye otros scripts de email:
- `npm run season-reminders` - Envío real de recordatorios
- `npm run test-email` - Pruebas de configuración SMTP
- `npm run test-payment-email` - Preview de emails de pago

## 🎨 Personalización

Para modificar el template del email, editar la función `createSeasonReminderEmailHtml()` en cualquiera de los scripts de preview.
