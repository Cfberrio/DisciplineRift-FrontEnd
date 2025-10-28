# Instrucciones para Crear Imagen Open Graph (og-image.png)

## ⚠️ ACCIÓN REQUERIDA

Actualmente falta la imagen `/public/og-image.png` que se usa para compartir en redes sociales (Facebook, Twitter, LinkedIn, WhatsApp, etc.).

## 📐 Especificaciones Requeridas

### Dimensiones
- **Tamaño**: 1200 x 630 píxeles (ratio 1.91:1)
- **Formato**: PNG o JPG
- **Peso máximo**: 8MB (recomendado < 300KB)
- **Nombre de archivo**: `og-image.png`

### Áreas Seguras
- **Zona segura central**: 1200 x 627 píxeles (contenido principal)
- **Evitar colocar texto importante** en los bordes externos (pueden recortarse en algunas plataformas)

## 🎨 Contenido Recomendado

La imagen debe incluir:

1. **Logo de Discipline Rift** (prominente)
2. **Tagline**: "Youth Sports Development Programs"
3. **Deportes**: Volleyball • Tennis • Pickleball
4. **Call-to-Action**: "Register for Fall 2025"
5. **Fondo atractivo**: Usar colores de marca (#0085B7 - azul DR)

### Ejemplo de Texto

```
DISCIPLINE RIFT
Youth Sports Development Programs

⚽ Volleyball  •  🎾 Tennis  •  🏓 Pickleball

Register Now for Fall 2025
www.disciplinerift.com
```

## 🛠️ Herramientas para Crear la Imagen

### Opción 1: Canva (Recomendado)
1. Ir a [canva.com](https://www.canva.com)
2. Crear diseño personalizado de 1200 x 630 px
3. Usar plantilla "Open Graph" o "Facebook Post"
4. Añadir logo, texto y elementos visuales
5. Exportar como PNG

### Opción 2: Figma
1. Crear frame de 1200 x 630 px
2. Diseñar con elementos de marca
3. Exportar como PNG @2x para alta calidad

### Opción 3: Photoshop/GIMP
1. Nuevo documento 1200 x 630 px, 72 DPI
2. Diseñar según especificaciones
3. Guardar como PNG con optimización web

### Opción 4: Herramientas Online Gratuitas
- [Crello](https://crello.com)
- [Snappa](https://snappa.com)
- [Adobe Express](https://express.adobe.com)

## ✅ Checklist de Calidad

- [ ] Dimensiones exactas: 1200 x 630 px
- [ ] Texto legible en tamaños pequeños (300 x 157 px - vista previa móvil)
- [ ] Contraste adecuado entre texto y fondo
- [ ] Logo visible y reconocible
- [ ] Sin texto en bordes (margen mínimo 40px)
- [ ] Colores de marca aplicados
- [ ] Peso de archivo < 300KB
- [ ] Formato PNG o JPG
- [ ] Guarda como `og-image.png` en `/public/`

## 🧪 Testing

Después de crear la imagen, verifica cómo se ve en:

### Facebook Debugger
https://developers.facebook.com/tools/debug/

### Twitter Card Validator
https://cards-dev.twitter.com/validator

### LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

## 📝 Notas Adicionales

- La imagen actual especificada en los metadatos es `/og-image.png`
- Si cambias el nombre, actualiza también `app/layout.tsx` líneas 44-50
- Considera crear variantes para páginas específicas (ej: `og-image-register.png`)
- Para mejores resultados, usa imágenes de alta calidad de estudiantes en acción

## 🎯 Recursos de Marca

Usa los assets existentes en `/public/`:
- `DISCIPLINE_RIFT_HEROIMAGE.png` - Logo principal
- `DR_LOGO_BLANCO.png` - Logo blanco
- `LOGO DR AZUL.png` - Logo azul
- Color primario: #0085B7 (azul Discipline Rift)

## ⏱️ Tiempo Estimado

- Diseño desde cero: 30-60 minutos
- Usando plantilla: 10-15 minutos
- Optimización y testing: 10 minutos

**Total: ~45 minutos**

---

*Una vez creada la imagen, elimina este archivo de instrucciones.*

