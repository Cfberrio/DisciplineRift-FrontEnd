#!/usr/bin/env npx tsx

/**
 * Script para crear datos de prueba usando equipos existentes
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { DateTime } from 'luxon';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const TIMEZONE = 'America/New_York';

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

async function testWithExistingData() {
  try {
    console.log('🧪 === PRUEBA CON DATOS EXISTENTES ===');
    
    const supabase = createSupabaseClient();
    const now = DateTime.now().setZone(TIMEZONE);
    const testDate = now.plus({ days: 30 }).toISODate(); // 30 días en el futuro
    
    console.log(`📅 Fecha objetivo para sesión: ${testDate}`);
    
    // 1. Buscar un equipo existente
    console.log('🔍 Buscando equipos existentes...');
    const { data: existingTeams, error: teamsError } = await supabase
      .from('team')
      .select('teamid, name')
      .limit(5);
    
    if (teamsError) {
      console.error('❌ Error buscando equipos:', teamsError);
      return;
    }
    
    if (!existingTeams || existingTeams.length === 0) {
      console.log('❌ No hay equipos existentes. Crea al menos un equipo primero.');
      return;
    }
    
    console.log(`✅ Encontrados ${existingTeams.length} equipos:`);
    existingTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.teamid})`);
    });
    
    // Usar el primer equipo
    const selectedTeam = existingTeams[0];
    console.log(`🎯 Usando equipo: ${selectedTeam.name}`);
    
    // 2. Crear padre de prueba
    const testParentId = randomUUID();
    const timestamp = now.toFormat('HHmmss');
    console.log('👨‍👩‍👧‍👦 Creando padre de prueba...');
    
    const { data: parent, error: parentError } = await supabase
      .from('parent')
      .insert({
        parentid: testParentId,
        firstname: 'Juan',
        lastname: 'TestPrueba',
        email: `test.reminder.${timestamp}@example.com`, // Email único
        phone: `555-${timestamp}` // Teléfono único
      })
      .select()
      .single();
    
    if (parentError) {
      console.error('❌ Error creando padre:', parentError);
      return;
    }
    
    console.log('✅ Padre creado:', parent.firstname, parent.lastname);
    
    // 3. Crear estudiante de prueba
    const testStudentId = randomUUID();
    console.log('👨‍🎓 Creando estudiante de prueba...');
    
    const { data: student, error: studentError } = await supabase
      .from('student')
      .insert({
        studentid: testStudentId,
        parentid: testParentId,
        firstname: 'María',
        lastname: 'TestPrueba',
        dob: '2008-06-15',
        grade: '10th Grade',
        ecname: 'Ana TestPrueba',
        ecphone: `556-${timestamp}`,
        ecrelationship: 'Aunt'
      })
      .select()
      .single();
    
    if (studentError) {
      console.error('❌ Error creando estudiante:', studentError);
      return;
    }
    
    console.log('✅ Estudiante creado:', student.firstname, student.lastname);
    
    // 4. Omitir coach por ahora
    console.log('⚠️ Omitiendo asignación de coach para simplificar la prueba');
    
    // 5. Crear sesión de prueba
    const testSessionId = randomUUID();
    console.log('📅 Creando sesión de prueba...');
    
    const sessionData = {
      sessionid: testSessionId,
      teamid: selectedTeam.teamid,
      startdate: testDate,
      enddate: now.plus({ days: 60 }).toISODate(),
      starttime: '18:00',
      endtime: '19:30',
      daysofweek: 'Monday,Wednesday,Friday',
      repeat: 'weekly'
      // Omitiendo coachid por ahora
    };
    
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .insert(sessionData)
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Error creando sesión:', sessionError);
      return;
    }
    
    console.log('✅ Sesión creada:', session.startdate, 'al', session.enddate);
    
    // 6. Crear inscripción activa
    const testEnrollmentId = randomUUID();
    console.log('📝 Creando inscripción de prueba...');
    
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollment')
      .insert({
        enrollmentid: testEnrollmentId,
        studentid: testStudentId,
        teamid: selectedTeam.teamid,
        isactive: true
      })
      .select()
      .single();
    
    if (enrollmentError) {
      console.error('❌ Error creando inscripción:', enrollmentError);
      return;
    }
    
    console.log('✅ Inscripción creada:', enrollment.enrollmentid);
    
    // 7. Resumen
    console.log('\n📊 === RESUMEN DE DATOS DE PRUEBA ===');
    console.log(`👨‍👩‍👧‍👦 Padre: ${parent.firstname} ${parent.lastname} (${parent.email})`);
    console.log(`👨‍🎓 Estudiante: ${student.firstname} ${student.lastname}`);
    console.log(`🏐 Equipo: ${selectedTeam.name} (existente)`);
    console.log(`📅 Sesión: ${session.startdate} - ${session.enddate}`);
    console.log(`⏰ Horario: ${session.starttime} - ${session.endtime}`);
    console.log(`📆 Días: ${session.daysofweek}`);
    console.log(`✅ Inscripción activa: ${enrollment.isactive}`);
    
    console.log('\n🎯 === COMANDO PARA PRUEBA ===');
    console.log(`Para probar el sistema, ejecuta:`);
    console.log(`npm run season-reminders -- --date=${now.toISODate()}`);
    console.log(`\nEsto debería:`);
    console.log(`1. Encontrar la sesión que inicia el ${testDate}`);
    console.log(`2. Identificar al padre: ${parent.email}`);
    console.log(`3. Enviar un email de recordatorio`);
    console.log(`4. Registrar el intento en la tabla reminder_attempts`);
    
    return {
      parentId: testParentId,
      studentId: testStudentId,
      teamId: selectedTeam.teamid,
      sessionId: testSessionId,
      enrollmentId: testEnrollmentId,
      testDate,
      parentEmail: parent.email,
      teamName: selectedTeam.name
    };
    
  } catch (error) {
    console.error('💥 Error en prueba:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    console.log('🧹 === LIMPIANDO DATOS DE PRUEBA ===');
    
    const supabase = createSupabaseClient();
    
    // Limpiar datos específicos de prueba
    const cleanupTasks = [
      { table: 'enrollment', field: 'studentid', value: 'in.(select studentid from student where lastname = \'TestPrueba\')' },
      { table: 'session', field: 'sessionid', value: 'in.(select sessionid from session where startdate > current_date + interval \'25 days\')' },
      { table: 'student', field: 'lastname', value: 'eq.TestPrueba' },
      { table: 'parent', field: 'lastname', value: 'eq.TestPrueba' },
    ];
    
    for (const task of cleanupTasks) {
      try {
        let query = supabase.from(task.table).delete();
        
        if (task.value.startsWith('eq.')) {
          query = query.eq(task.field, task.value.substring(3));
        } else if (task.value.startsWith('like.')) {
          query = query.like(task.field, task.value.substring(5));
        } else {
          console.log(`⚠️ Saltando limpieza compleja para ${task.table}`);
          continue;
        }
        
        const { error } = await query;
        
        if (!error) {
          console.log(`✅ Limpiado tabla ${task.table}`);
        } else {
          console.log(`⚠️ Error limpiando ${task.table}:`, error.message);
        }
      } catch (cleanupError) {
        console.log(`⚠️ Error en limpieza de ${task.table}:`, cleanupError);
      }
    }
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('💥 Error limpiando datos de prueba:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isCleanup = args.includes('--cleanup');
  
  if (isCleanup) {
    await cleanupTestData();
  } else {
    await testWithExistingData();
  }
}

// Manejar señales de interrupción
process.on('SIGINT', () => {
  console.log('\n⚠️ Operación interrumpida');
  process.exit(0);
});

// Ejecutar
main().catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
