/**
 * Script para enviar campaña de recordatorio de pago incompleto
 * 
 * Este script envía correos de recordatorio a padres que completaron
 * el registro pero no completaron el pago (isactive = false)
 * 
 * Uso:
 * node send-incomplete-payment-campaign.js
 */

const fetch = require('node-fetch');

async function getIncompletePaymentInfo() {
  try {
    console.log("📋 Obteniendo información de padres con pagos incompletos...");
    
    const response = await fetch('http://localhost:3000/api/send-incomplete-payment-reminder', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("📊 === INFORMACIÓN DE PADRES CON PAGOS INCOMPLETOS ===");
      console.log(`   - Total de padres: ${result.count}`);
      console.log(`   - Total de enrollments: ${result.totalEnrollments || 'N/A'}`);
      
      if (result.data && result.data.length > 0) {
        console.log("\n📧 Primeros 3 padres con pagos pendientes:");
        result.data.slice(0, 3).forEach(parent => {
          console.log(`   - ${parent.parentName} (${parent.parentEmail})`);
          console.log(`     └── Hijos sin pagar: ${parent.enrollmentCount}`);
        });
        if (result.data.length > 3) {
          console.log(`   ... y ${result.data.length - 3} padres más`);
        }
      }
      
      return result.count > 0;
    } else {
      console.error("❌ Error obteniendo información:", result.error || result.message);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Error crítico obteniendo información:", error.message);
    return false;
  }
}

async function sendIncompletePaymentReminders() {
  try {
    console.log("🎉 === INICIANDO CAMPAÑA DE RECORDATORIO DE PAGO ===");
    console.log(`🕐 Hora de inicio: ${new Date().toLocaleString()}`);
    
    // Hacer petición al endpoint
    const response = await fetch('http://localhost:3000/api/send-incomplete-payment-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (response.ok && result.emailsSent >= 0) {
      console.log("✅ === CAMPAÑA COMPLETADA ===");
      console.log(`📊 Resumen:`);
      console.log(`   - Total de padres: ${result.totalParents}`);
      console.log(`   - Correos enviados: ${result.emailsSent}`);
      console.log(`   - Correos fallidos: ${result.errors}`);
      
      if (result.results && result.results.length > 0) {
        const successful = result.results.filter(r => r.success);
        const failed = result.results.filter(r => !r.success);
        
        if (successful.length > 0) {
          console.log("\n✅ Correos enviados exitosamente:");
          successful.forEach(email => {
            console.log(`   - ${email.email}`);
          });
        }
        
        if (failed.length > 0) {
          console.log("\n❌ Correos fallidos:");
          failed.forEach(email => {
            console.log(`   - ${email.email}: ${email.error}`);
          });
        }
      }
      
    } else {
      console.error("❌ === CAMPAÑA FALLIDA ===");
      console.error(`Error: ${result.error || result.message}`);
      if (result.details) {
        console.error(`Detalles: ${result.details}`);
      }
    }
    
    console.log(`🕐 Hora de finalización: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error("❌ === ERROR CRÍTICO EN LA CAMPAÑA ===");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Función para enviar email de prueba
async function sendTestEmail() {
  const testEmail = 'cberrio04@gmail.com'; // Email de prueba
  
  try {
    console.log(`🧪 Enviando email de prueba a: ${testEmail}`);
    
    const response = await fetch('http://localhost:3000/api/test-incomplete-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testEmail })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Email de prueba enviado exitosamente!");
      console.log(`📬 Message ID: ${result.messageId}`);
    } else {
      console.error("❌ Error enviando email de prueba:", result.error);
      console.error("Detalles:", result.details);
    }
    
  } catch (error) {
    console.error("❌ Error crítico enviando prueba:", error.message);
  }
}

// Función para verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/test-incomplete-payment', {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Función principal
async function main() {
  console.log("🚀 === SCRIPT CAMPAÑA RECORDATORIO DE PAGO INCOMPLETO ===");
  console.log("");
  
  // Verificar que el servidor esté corriendo
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error("❌ El servidor Next.js no está corriendo en localhost:3000");
    console.log("💡 Ejecuta: npm run dev");
    process.exit(1);
  }
  
  console.log("✅ Servidor detectado en localhost:3000");
  console.log("");
  
  // Obtener información previa
  const hasIncompletePayments = await getIncompletePaymentInfo();
  
  if (!hasIncompletePayments) {
    console.log("ℹ️ No hay padres con pagos incompletos para contactar.");
    process.exit(0);
  }
  
  console.log("");
  console.log("🎯 Opciones disponibles:");
  console.log("1. Enviar email de PRUEBA (recomendado primero)");
  console.log("2. Enviar campaña REAL a todos los padres");
  console.log("3. Cancelar");
  console.log("");
  
  // Simulamos selección de opción 1 para prueba
  console.log("Ejecutando opción 1: Email de prueba...");
  await sendTestEmail();
  
  console.log("");
  console.log("📧 Revisa tu email para confirmar que el template se ve bien.");
  console.log("💡 Si todo está correcto, ejecuta el script nuevamente y selecciona la opción 2.");
}

// Ejecutar el script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Error crítico:", error);
    process.exit(1);
  });
}

module.exports = { 
  sendIncompletePaymentReminders, 
  getIncompletePaymentInfo,
  sendTestEmail 
};
