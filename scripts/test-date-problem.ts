#!/usr/bin/env npx tsx

/**
 * Script para replicar el problema específico de fechas
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { buildPracticeOccurrences, formatTimeES } from '../lib/schedule/buildPracticeOccurrences';

function testDateProblem() {
  console.log('🔍 === PRUEBA DEL PROBLEMA DE FECHAS ===');
  
  // Simulemos el escenario exacto: si el usuario dice que debería ser 
  // "miércoles 18 de septiembre" pero en realidad 18 es jueves
  console.log('\n📅 Verificando qué día es 18 de septiembre de 2025:');
  const date18 = new Date(2025, 8, 18); // Septiembre es mes 8 (0-indexed)
  console.log(`18 de septiembre de 2025 es: ${date18.toLocaleDateString('en-US', { weekday: 'long' })}`);
  
  // Ahora probemos con diferentes startDates para ver el comportamiento
  const testCases = [
    {
      name: 'Caso 1: startDate = 2025-09-18 (jueves)',
      startDate: '2025-09-18',
      endDate: '2025-10-23',
      daysOfWeek: ['Wednesday']
    },
    {
      name: 'Caso 2: startDate = 2025-09-17 (miércoles)', 
      startDate: '2025-09-17',
      endDate: '2025-10-23',
      daysOfWeek: ['Wednesday']
    },
    {
      name: 'Caso 3: startDate = 2025-09-16 (martes)',
      startDate: '2025-09-16', 
      endDate: '2025-10-23',
      daysOfWeek: ['Wednesday']
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${testCase.name}:`);
    console.log('='.repeat(50));
    
    const params = {
      startDate: testCase.startDate,
      endDate: testCase.endDate,
      daysOfWeek: testCase.daysOfWeek,
      startTime: '15:15',
      endTime: '16:15',
      location: 'Orlando, FL',
      coachName: 'Ranya',
      timezone: 'America/New_York'
    };
    
    const occurrences = buildPracticeOccurrences(params);
    
    if (occurrences.length > 0) {
      const first = occurrences[0];
      console.log(`Primera práctica: ${first.formattedDateES}`);
      console.log(`Fecha del objeto Date: ${first.date.getDate()} (día del mes)`);
      console.log(`Día de la semana: ${first.dayOfWeek}`);
      
      // Verificar si hay un problema de timezone
      const utcDate = first.date.toISOString().split('T')[0];
      const localDate = `${first.date.getFullYear()}-${String(first.date.getMonth() + 1).padStart(2, '0')}-${String(first.date.getDate()).padStart(2, '0')}`;
      console.log(`UTC ISO: ${utcDate}`);
      console.log(`Local ISO: ${localDate}`);
      
      if (utcDate !== localDate) {
        console.log('⚠️ DIFERENCIA DETECTADA entre UTC y local');
      }
    } else {
      console.log('❌ No se generaron sesiones');
    }
  });
  
  console.log('\n🧪 === PRUEBA CON DATOS COMO VIENEN DE SUPABASE ===');
  
  // Simulemos cómo vienen los datos de Supabase (posiblemente con timezone issues)
  const supabaseSimulation = {
    startdate: '2025-09-18', // Como varchar desde Supabase
    enddate: '2025-10-23',
    starttime: '15:15:00',   // Como time desde Supabase  
    endtime: '16:15:00',
    daysofweek: 'Wednesday'
  };
  
  console.log('Datos simulados de Supabase:');
  console.log(JSON.stringify(supabaseSimulation, null, 2));
  
  // Procesarlos como lo hace el código actual
  const daysOfWeekArray = supabaseSimulation.daysofweek.split(',').map(d => d.trim());
  
  const finalParams = {
    startDate: supabaseSimulation.startdate,
    endDate: supabaseSimulation.enddate,
    daysOfWeek: daysOfWeekArray,
    startTime: supabaseSimulation.starttime.substring(0, 5), // Quitar segundos
    endTime: supabaseSimulation.endtime.substring(0, 5),
    location: 'Orlando, FL',
    coachName: 'Ranya',
    timezone: 'America/New_York'
  };
  
  console.log('\nParámetros procesados:');
  console.log(JSON.stringify(finalParams, null, 2));
  
  const finalOccurrences = buildPracticeOccurrences(finalParams);
  
  console.log('\n📋 Resultado final:');
  if (finalOccurrences.length > 0) {
    const first = finalOccurrences[0];
    console.log(`Primera fecha: ${first.formattedDateES}`);
    console.log(`¿Es el día 18?: ${first.formattedDateES.includes('18') ? 'SÍ' : 'NO'}`);
    console.log(`¿Es el día 17?: ${first.formattedDateES.includes('17') ? 'SÍ' : 'NO'}`);
    
    if (first.formattedDateES.includes('17')) {
      console.log('✅ CORRECTO: Muestra el 17 (miércoles)');
    } else if (first.formattedDateES.includes('18')) {
      console.log('❌ PROBLEMA: Muestra el 18 (pero 18 es jueves, no miércoles)');
    }
  }
}

// Ejecutar prueba
try {
  testDateProblem();
} catch (error) {
  console.error('💥 Error en la prueba:', error);
}
