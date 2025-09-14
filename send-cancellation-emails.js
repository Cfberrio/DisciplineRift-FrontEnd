/**
 * Script para enviar emails de cancelación de equipos
 * 
 * Este script envía emails a padres cuyos hijos están en equipos cancelados
 * (team.isactive = false) pero cuyas inscripciones siguen activas (enrollment.isactive = true)
 * 
 * Uso:
 * node send-cancellation-emails.js [--preview] [--test-email=tu@email.com] [--limit=5]
 * 
 * Opciones:
 * --preview: Solo muestra qué emails se enviarían sin enviarlos realmente
 * --test-email: Envía todos los emails a esta dirección en lugar de a los padres reales
 * --limit: Limita el número de emails a enviar (útil para pruebas)
 */

// Cargar variables de entorno si no están disponibles
if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  } catch (error) {
    console.warn('⚠️ No se pudo cargar dotenv, asegúrate de que las variables de entorno estén configuradas');
  }
}

const https = require('https');

// Configuración
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/send-cancellation-emails`;

/**
 * Parsea los argumentos de línea de comandos
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    preview: false,
    testEmail: null,
    limit: null
  };

  args.forEach(arg => {
    if (arg === '--preview') {
      options.preview = true;
    } else if (arg.startsWith('--test-email=')) {
      options.testEmail = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Uso: node send-cancellation-emails.js [opciones]

Opciones:
  --preview              Solo muestra qué emails se enviarían (no los envía)
  --test-email=EMAIL     Envía todos los emails a esta dirección
  --limit=N             Limita el número de emails a enviar
  --help, -h            Muestra esta ayuda

Ejemplos:
  node send-cancellation-emails.js --preview
  node send-cancellation-emails.js --test-email=test@example.com --limit=3
  node send-cancellation-emails.js
      `);
      process.exit(0);
    }
  });

  return options;
}

/**
 * Realiza una petición HTTP POST
 */
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const requestModule = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = requestModule.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonResponse
          });
        } catch (error) {
          reject(new Error(`Error parsing JSON response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 === INICIANDO SCRIPT DE EMAILS DE CANCELACIÓN ===\n');
    
    const options = parseArgs();
    
    // Mostrar configuración
    console.log('📋 Configuración:');
    console.log(`   Modo: ${options.preview ? 'PREVIEW (no enviar emails)' : 'ENVÍO REAL'}`);
    if (options.testEmail) console.log(`   Email de prueba: ${options.testEmail}`);
    if (options.limit) console.log(`   Límite: ${options.limit} emails`);
    console.log(`   Endpoint: ${API_ENDPOINT}\n`);

    // Verificar configuración de variables de entorno
    console.log('🔧 Verificando configuración...');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GMAIL_USER',
      'GMAIL_APP_PASSWORD'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables de entorno faltantes:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\nAsegúrate de tener un archivo .env.local con todas las variables requeridas.');
      process.exit(1);
    }
    
    console.log('✅ Configuración verificada\n');

    // Confirmar envío si no es preview
    if (!options.preview) {
      console.log('⚠️  ADVERTENCIA: Estás a punto de enviar emails reales de cancelación.');
      console.log('   Si quieres solo ver qué emails se enviarían, usa --preview');
      console.log('   Si quieres enviar emails de prueba, usa --test-email=tu@email.com\n');
      
      // Dar tiempo para cancelar
      console.log('Iniciando en 5 segundos... (Ctrl+C para cancelar)');
      for (let i = 5; i > 0; i--) {
        process.stdout.write(`\r${i}... `);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('\n');
    }

    // Realizar la petición
    console.log('📤 Enviando petición al servidor...\n');
    
    const response = await makeRequest(API_ENDPOINT, {
      preview: options.preview,
      testEmail: options.testEmail,
      limit: options.limit
    });

    if (response.status !== 200) {
      console.error(`❌ Error del servidor (${response.status}):`, response.data);
      process.exit(1);
    }

    const result = response.data;

    // Mostrar resultados
    if (result.success) {
      console.log('✅ Operación completada exitosamente\n');
      
      if (options.preview) {
        console.log('📋 PREVIEW - Emails que se enviarían:');
        console.log(`📊 Total: ${result.count} emails\n`);
        
        if (result.students && result.students.length > 0) {
          result.students.forEach((student, index) => {
            console.log(`${index + 1}. ${student.parentName} (${student.parentEmail})`);
            console.log(`   Estudiante: ${student.studentName}`);
            console.log(`   Equipo: ${student.teamName}`);
            console.log(`   Escuela: ${student.schoolName}\n`);
          });
        }
      } else {
        console.log('📊 Resumen del envío:');
        console.log(`📧 Emails enviados: ${result.emailsSent}`);
        console.log(`❌ Errores: ${result.errors}`);
        console.log(`📋 Total procesados: ${result.totalProcessed}\n`);
        
        if (result.results && result.results.length > 0) {
          console.log('📝 Detalle de resultados:');
          result.results.forEach((res, index) => {
            const status = res.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${res.parentEmail} - ${res.teamName}`);
            if (!res.success && res.error) {
              console.log(`     Error: ${res.error}`);
            }
          });
        }
      }
      
      console.log('\n🎉 Proceso completado exitosamente');
      
    } else {
      console.error('❌ Error en la operación:', result.message);
      if (result.error) console.error('   Error:', result.error);
      if (result.errors) {
        console.error('   Errores de configuración:');
        result.errors.forEach(error => console.error(`     - ${error}`));
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Error fatal:', error.message);
    console.error('\nPor favor verifica:');
    console.error('1. Que el servidor Next.js esté ejecutándose');
    console.error('2. Que las variables de entorno estén configuradas');
    console.error('3. Que la conexión a internet funcione correctamente');
    process.exit(1);
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error no capturado:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArgs };




