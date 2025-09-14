// Script para probar el envío de emails de Fall Season
// Ejecutar con: node test-fall-season-email.js

// Configurar variables de entorno
try {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} catch (error) {
  console.log('⚠️ dotenv no disponible, usando variables de entorno del sistema');
}

async function testFallSeasonEmail() {
  try {
    console.log('🚀 === PROBANDO SISTEMA DE EMAIL FALL SEASON ===\n');

    // Paso 1: Verificar configuración
    console.log('🔧 Verificando configuración...');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GMAIL_USER',
      'GMAIL_APP_PASSWORD'
    ];

    let allConfigured = true;
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`  ✅ ${varName}: configurado`);
      } else {
        console.log(`  ❌ ${varName}: FALTA`);
        allConfigured = false;
      }
    });

    if (!allConfigured) {
      console.log('\n❌ Faltan variables de entorno. Verifica tu .env.local');
      return;
    }

    console.log('\n✅ Todas las variables de entorno están configuradas\n');

    // Paso 2: Probar obtener padres calificados (modo preview)
    console.log('📋 Probando obtención de padres calificados...');
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    console.log(`🌐 Usando base URL: ${baseUrl}`);

    try {
      const getResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
      }

      const getData = await getResponse.json();
      console.log('\n📊 Resultado de padres calificados:');
      console.log(`  - Total encontrados: ${getData.count}`);
      console.log(`  - Primeros 3 padres:`, getData.parents?.slice(0, 3));

      if (getData.count === 0) {
        console.log('\n⚠️ No se encontraron padres calificados.');
        console.log('   Esto significa que no hay padres que cumplan todas las condiciones:');
        console.log('   1. Email en tabla Newsletter');
        console.log('   2. Enrollment con isactive = false');
        console.log('   3. Team del enrollment con isactive = true');
        return;
      }

      // Paso 3: Probar modo preview
      console.log('\n📧 Probando modo preview...');
      
      const previewResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preview: true,
          limit: 5
        }),
      });

      if (!previewResponse.ok) {
        throw new Error(`HTTP ${previewResponse.status}: ${previewResponse.statusText}`);
      }

      const previewData = await previewResponse.json();
      console.log('\n📋 Resultado del preview:');
      console.log(`  - Modo preview: ${previewData.preview}`);
      console.log(`  - Padres en preview: ${previewData.count}`);
      console.log(`  - Emails que se enviarían:`, previewData.parents?.map(p => p.email));

      console.log('\n✅ ¡Prueba completada exitosamente!');
      console.log('\n🎯 Para enviar emails reales:');
      console.log('   POST /api/send-fall-season-email');
      console.log('   Body: { "preview": false, "limit": 10 }');
      console.log('\n🧪 Para probar con email específico:');
      console.log('   Body: { "preview": false, "testEmail": "tu-email@ejemplo.com", "limit": 1 }');

    } catch (fetchError) {
      console.error('\n❌ Error en la prueba de API:', fetchError);
      console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
      console.log('   npm run dev');
      console.log('   o verifica que VERCEL_URL esté configurado correctamente');
    }

  } catch (error) {
    console.error('\n💥 Error general en la prueba:', error);
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  testFallSeasonEmail();
}

module.exports = { testFallSeasonEmail };


