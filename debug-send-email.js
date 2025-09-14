// Script para debuggear el envío de emails
// Ejecutar con: node debug-send-email.js

const fetch = require('node-fetch');

async function debugSendEmail() {
  try {
    console.log('🔍 === DEBUGGING EMAIL SEND ===\n');

    const baseUrl = 'http://localhost:3000';

    // Primero probemos un preview para ver el error detallado
    console.log('📧 Probando modo preview...');
    
    try {
      const previewResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preview: true,
          limit: 1
        }),
      });

      console.log(`Status: ${previewResponse.status}`);
      
      const responseText = await previewResponse.text();
      console.log('Response:', responseText);

      if (!previewResponse.ok) {
        console.log('❌ Preview también falló');
        return;
      }

      const previewData = JSON.parse(responseText);
      console.log('✅ Preview exitoso:', previewData);

      // Ahora probemos envío real con límite de 1
      console.log('\n📧 Probando envío real con 1 email...');
      
      const sendResponse = await fetch(`${baseUrl}/api/send-fall-season-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preview: false,
          limit: 1,
          testEmail: 'test@ejemplo.com' // Email de prueba
        }),
      });

      console.log(`Send Status: ${sendResponse.status}`);
      
      const sendResponseText = await sendResponse.text();
      console.log('Send Response:', sendResponseText);

    } catch (fetchError) {
      console.error('❌ Error en fetch:', fetchError);
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

debugSendEmail();


