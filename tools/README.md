# Herramientas de Desarrollo

Esta carpeta contiene herramientas y scripts auxiliares para el desarrollo del proyecto.

## Scripts de Email:

- **generate-email-preview.js** - Generador principal de vistas previas de email
- **generate-1week-september-18-preview.js** - Preview específico para septiembre 18
- **generate-1week-september-19-preview.js** - Preview específico para septiembre 19

## Uso:

Estos scripts son utilizados para generar y probar templates de email antes de enviarlos en producción.

```bash
node tools/generate-email-preview.js
```

## Nota:

Estas herramientas son específicas para el sistema de emails de DisciplineRift y requieren las dependencias del proyecto principal.
