#!/usr/bin/env npx tsx

/**
 * Script para debuggear específicamente el problema de la última sesión
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { buildPracticeOccurrences } from '../lib/schedule/buildPracticeOccurrences';

function testEndDateIssue() {
  console.log('🔍 === TEST DEL PROBLEMA DE LA ÚLTIMA SESIÓN ===');
  
  // Caso de prueba: sesiones que van de septiembre 17 a octubre 23
  // Miércoles cada semana
  const testCases = [
    {
      name: "Caso Real (Sep 17 - Oct 23, Miércoles)",
      startDate: '2025-09-17', // Miércoles
      endDate: '2025-10-23',   // Jueves
      daysOfWeek: ['Wednesday'],
      startTime: '15:15',
      endTime: '16:15'
    },
    {
      name: "Caso donde endDate es exactamente miércoles",
      startDate: '2025-09-17', // Miércoles  
      endDate: '2025-10-22',   // Miércoles (exacto)
      daysOfWeek: ['Wednesday'],
      startTime: '15:15',
      endTime: '16:15'
    },
    {
      name: "Caso simple (4 semanas exactas)",
      startDate: '2025-01-01', // Miércoles
      endDate: '2025-01-22',   // Miércoles (3 semanas después)
      daysOfWeek: ['Wednesday'],
      startTime: '15:15',
      endTime: '16:15'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    // Crear fechas correctamente (sin timezone issues)
    const [startYear, startMonth, startDay] = testCase.startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = testCase.endDate.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    console.log(`   Start: ${testCase.startDate} (${startDate.toLocaleDateString('en-US', { weekday: 'long' })})`);
    console.log(`   End: ${testCase.endDate} (${endDate.toLocaleDateString('en-US', { weekday: 'long' })})`);
    console.log(`   Target day: ${testCase.daysOfWeek.join(', ')}`);

    // Calcular qué miércoles deberían incluirse manualmente
    const expectedWednesdays = [];
    
    let currentWed = new Date(startDate);
    while (currentWed <= endDate) {
      if (currentWed.getDay() === 3) { // Wednesday = 3
        expectedWednesdays.push(new Date(currentWed));
      }
      currentWed.setDate(currentWed.getDate() + 1);
    }

    console.log(`   ⏰ Esperados manualmente: ${expectedWednesdays.length} miércoles`);
    expectedWednesdays.forEach((wed, i) => {
      const dateStr = `${wed.getFullYear()}-${String(wed.getMonth() + 1).padStart(2, '0')}-${String(wed.getDate()).padStart(2, '0')}`;
      console.log(`      ${i + 1}. ${dateStr} (${wed.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})`);
    });

    // Usar buildPracticeOccurrences
    const params = {
      startDate: testCase.startDate,
      endDate: testCase.endDate,
      daysOfWeek: testCase.daysOfWeek,
      startTime: testCase.startTime,
      endTime: testCase.endTime,
      location: 'Test Location',
      coachName: 'Test Coach',
      timezone: 'America/New_York'
    };

    const result = buildPracticeOccurrences(params);
    
    console.log(`   📊 Resultado buildPracticeOccurrences: ${result.length} sesiones`);
    result.forEach((session, i) => {
      const dateStr = session.date.toISOString().split('T')[0];
      console.log(`      ${i + 1}. ${dateStr} (${session.formattedDateES})`);
    });

    // Comparar
    if (result.length === expectedWednesdays.length) {
      console.log(`   ✅ CORRECTO: Misma cantidad de sesiones`);
    } else {
      console.log(`   ❌ ERROR: Esperados ${expectedWednesdays.length}, obtenidos ${result.length}`);
      
      if (result.length < expectedWednesdays.length) {
        const lastExpected = expectedWednesdays[expectedWednesdays.length - 1];
        const lastExpectedStr = lastExpected.toISOString().split('T')[0];
        console.log(`   🔍 Falta incluir: ${lastExpectedStr} (${lastExpected.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})`);
      }
    }

    console.log('   ' + '─'.repeat(50));
  });

  // Verificación específica del problema reportado
  console.log('\n🎯 === VERIFICACIÓN ESPECÍFICA DEL PROBLEMA ===');
  console.log('Si tienes en tu base de datos:');
  console.log('- startdate: 2025-09-18 (pero ajustado a 2025-09-17 por ser miércoles)');
  console.log('- enddate: 2025-10-23');
  console.log('- daysofweek: Wednesday');
  console.log('\nLos miércoles entre 2025-09-17 y 2025-10-23 son:');
  
  const startCheck = new Date(2025, 8, 17); // September = 8
  const endCheck = new Date(2025, 9, 23);   // October = 9
  const wednesdays = [];
  
  let current = new Date(startCheck);
  while (current <= endCheck) {
    if (current.getDay() === 3) {
      wednesdays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  wednesdays.forEach((wed, i) => {
    const dateStr = `${wed.getFullYear()}-${String(wed.getMonth() + 1).padStart(2, '0')}-${String(wed.getDate()).padStart(2, '0')}`;
    console.log(`${i + 1}. ${dateStr} (${wed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })})`);
  });
  
  console.log(`\nTotal esperado: ${wednesdays.length} sesiones`);
  console.log('La última sesión DEBERÍA ser: 2025-10-22 (miércoles)');
}

// Ejecutar test
try {
  testEndDateIssue();
} catch (error) {
  console.error('💥 Error en test:', error);
}
