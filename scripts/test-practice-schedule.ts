#!/usr/bin/env npx tsx

/**
 * Script para probar la generación correcta del horario de práctica
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { buildPracticeOccurrences, formatTimeES } from '../lib/schedule/buildPracticeOccurrences';

function testPracticeSchedule() {
  console.log('🧪 === PRUEBA DE GENERACIÓN DE HORARIO DE PRÁCTICA ===');
  
  // Datos de prueba basados en tu imagen
  // Si la primera práctica es el miércoles 17 de septiembre, 
  // entonces el startDate debe ser 2025-09-17
  const testParams = {
    startDate: '2025-09-17', // Primera práctica: miércoles 17 de septiembre  
    endDate: '2025-10-23',   // Debe finalizar el 23 de octubre
    daysOfWeek: ['Wednesday'], // Solo miércoles
    startTime: '15:15',
    endTime: '16:15',
    location: 'Orlando, FL',
    coachName: 'Ranya',
    timezone: 'America/New_York'
  };
  
  console.log('📋 Parámetros de prueba:');
  console.log(`   Fecha inicio: ${testParams.startDate}`);
  console.log(`   Fecha fin: ${testParams.endDate}`);
  console.log(`   Días: ${testParams.daysOfWeek.join(', ')}`);
  console.log(`   Horario: ${testParams.startTime} - ${testParams.endTime}`);
  console.log(`   Zona horaria: ${testParams.timezone}`);
  
  console.log('\n🔄 Generando horario...');
  
  const occurrences = buildPracticeOccurrences(testParams);
  
  console.log(`\n📊 Generadas ${occurrences.length} sesiones:`);
  console.log('==========================================');
  
  occurrences.forEach((occurrence, index) => {
    const timeFormatted = formatTimeES(occurrence.time);
    console.log(`${index + 1}. ${occurrence.formattedDateES}`);
    console.log(`   Hora: ${timeFormatted}`);
    console.log(`   Día de la semana: ${occurrence.dayOfWeek}`);
    console.log(`   Fecha objeto: ${occurrence.date.toDateString()}`);
    console.log(`   ISO Date: ${occurrence.date.toISOString().split('T')[0]}`);
    console.log('   ---');
  });
  
  console.log('\n🎯 === VERIFICACIÓN ESPERADA ===');
  console.log('La primera sesión debe ser:');
  console.log('   - Fecha: Wednesday, 17 September, 2025');
  console.log('   - NO Wednesday, 16 September, 2025 (un día antes)');
  console.log('');
  console.log('La última sesión debe ser aproximadamente:');
  console.log('   - Fecha: Wednesday, 22 October, 2025');
  console.log('   - (El 23 de octubre es jueves, no miércoles)');
  
  // Verificar la primera fecha
  if (occurrences.length > 0) {
    const firstDate = occurrences[0];
    const expectedDateStr = firstDate.formattedDateES;
    
    console.log('\n✅ === RESULTADO ===');
    console.log(`Primera fecha generada: ${expectedDateStr}`);
    
    if (expectedDateStr.includes('17')) {
      console.log('✅ ¡CORRECTO! La fecha muestra el día 17');
    } else if (expectedDateStr.includes('16')) {
      console.log('❌ ERROR: La fecha muestra el día 16 (un día antes)');
    } else {
      console.log('⚠️ ATENCIÓN: Verificar fecha manualmente');
    }
    
    // Mostrar información adicional de debugging
    console.log('\n🔍 === DEBUGGING INFO ===');
    console.log(`Date object: ${firstDate.date}`);
    console.log(`getDate(): ${firstDate.date.getDate()}`);
    console.log(`getDay(): ${firstDate.date.getDay()} (0=Sunday, 3=Wednesday)`);
    console.log(`toString(): ${firstDate.date.toString()}`);
  }
  
  return occurrences;
}

// Ejecutar prueba
try {
  const result = testPracticeSchedule();
  console.log(`\n🎉 Prueba completada. Se generaron ${result.length} sesiones.`);
} catch (error) {
  console.error('💥 Error en la prueba:', error);
}
