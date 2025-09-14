// Script para probar el email de cancelación con email real
console.log('🚀 Iniciando prueba con email real...');

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testWithRealEmail() {
  try {
    console.log('\n📧 Enviando email de prueba al equipo "prueba"...');
    console.log('Esto enviará el email a: cfberrio@uninorte.edu.co');
    console.log('(Cristian Berrio del equipo "prueba")');
    
    const testEmailData = {
      preview: false,
      testEmail: 'cfberrio@uninorte.edu.co', // Email real del equipo prueba
      limit: 1
    };

    console.log('\n⏳ Enviando...');
    const response = await makeRequest('/api/send-cancellation-emails', 'POST', testEmailData);
    
    console.log(`\n📊 Status: ${response.status}`);
    console.log('📋 Resultado:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.emailsSent > 0) {
      console.log('\n✅ ¡Email enviado exitosamente!');
      console.log('🔍 Revisa tu bandeja de entrada (y spam) en cfberrio@uninorte.edu.co');
    } else if (response.data.errors > 0) {
      console.log('\n❌ Error enviando email:');
      if (response.data.results && response.data.results[0]) {
        console.log(`Error: ${response.data.results[0].error}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testWithRealEmail();




