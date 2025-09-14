// Script para probar las consultas de base de datos directamente
// Ejecutar con: node test-database-query.js

// Configurar variables de entorno
try {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} catch (error) {
  console.log('⚠️ dotenv no disponible, usando variables de entorno del sistema');
}

const { createClient } = require('@supabase/supabase-js');

async function testDatabaseQueries() {
  try {
    console.log('🚀 === PROBANDO CONSULTAS DE BASE DE DATOS ===\n');

    // Verificar configuración
    console.log('🔧 Verificando configuración de Supabase...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables de Supabase no configuradas');
      console.log(`  - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
      console.log(`  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅' : '❌'}`);
      return;
    }

    console.log('✅ Variables de Supabase configuradas\n');

    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Paso 1: Probar tabla Newsletter
    console.log('📧 Probando tabla Newsletter...');
    
    try {
      const { data: newsletters, error: newsletterError } = await supabase
        .from('Newsletter')
        .select('email')
        .limit(5);

      if (newsletterError) {
        console.log('❌ Error en Newsletter:', newsletterError.message);
        
        // Probar con 'newsletter' en minúsculas
        console.log('🔄 Probando con "newsletter" en minúsculas...');
        const { data: newsletters2, error: newsletterError2 } = await supabase
          .from('newsletter')
          .select('email')
          .limit(5);
          
        if (newsletterError2) {
          console.log('❌ Error también con minúsculas:', newsletterError2.message);
        } else {
          console.log(`✅ Tabla 'newsletter' encontrada con ${newsletters2?.length || 0} registros`);
          console.log('📋 Primeros emails:', newsletters2?.slice(0, 3).map(n => n.email));
        }
      } else {
        console.log(`✅ Tabla Newsletter encontrada con ${newsletters?.length || 0} registros`);
        console.log('📋 Primeros emails:', newsletters?.slice(0, 3).map(n => n.email));
      }
    } catch (newsletterErr) {
      console.log('❌ Error consultando Newsletter:', newsletterErr.message);
    }

    console.log('');

    // Paso 2: Probar tabla Team
    console.log('🏐 Probando tabla Team...');
    
    try {
      const { data: teams, error: teamError } = await supabase
        .from('team')
        .select('teamid, name, isactive')
        .limit(5);

      if (teamError) {
        console.log('❌ Error en Team:', teamError.message);
      } else {
        console.log(`✅ Tabla Team encontrada con ${teams?.length || 0} registros`);
        const activeTeams = teams?.filter(t => t.isactive) || [];
        console.log(`📊 Teams activos: ${activeTeams.length}`);
        console.log('📋 Primeros teams:', teams?.slice(0, 3).map(t => `${t.name} (${t.isactive ? 'activo' : 'inactivo'})`));
      }
    } catch (teamErr) {
      console.log('❌ Error consultando Team:', teamErr.message);
    }

    console.log('');

    // Paso 3: Probar tabla Enrollment
    console.log('📝 Probando tabla Enrollment...');
    
    try {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollment')
        .select('enrollmentid, isactive, teamid')
        .limit(5);

      if (enrollmentError) {
        console.log('❌ Error en Enrollment:', enrollmentError.message);
      } else {
        console.log(`✅ Tabla Enrollment encontrada con ${enrollments?.length || 0} registros`);
        const inactiveEnrollments = enrollments?.filter(e => !e.isactive) || [];
        console.log(`📊 Enrollments inactivos: ${inactiveEnrollments.length}`);
        console.log('📋 Primeros enrollments:', enrollments?.slice(0, 3).map(e => `${e.enrollmentid} (${e.isactive ? 'activo' : 'inactivo'})`));
      }
    } catch (enrollmentErr) {
      console.log('❌ Error consultando Enrollment:', enrollmentErr.message);
    }

    console.log('');

    // Paso 4: Probar consulta compleja (similar a la del endpoint)
    console.log('🔍 Probando consulta compleja...');
    
    try {
      const { data: complexQuery, error: complexError } = await supabase
        .from('enrollment')
        .select(`
          enrollmentid,
          isactive,
          student:studentid (
            studentid,
            firstname,
            lastname,
            parent:parentid (
              parentid,
              firstname,
              lastname,
              email
            )
          ),
          team:teamid (
            teamid,
            name,
            isactive
          )
        `)
        .eq('isactive', false)
        .limit(3);

      if (complexError) {
        console.log('❌ Error en consulta compleja:', complexError.message);
      } else {
        console.log(`✅ Consulta compleja exitosa: ${complexQuery?.length || 0} resultados`);
        
        if (complexQuery && complexQuery.length > 0) {
          complexQuery.forEach((enrollment, index) => {
            const student = enrollment.student;
            const team = enrollment.team;
            const parent = student?.parent;
            
            console.log(`📋 Resultado ${index + 1}:`);
            console.log(`  - Student: ${student?.firstname} ${student?.lastname}`);
            console.log(`  - Parent: ${parent?.firstname} ${parent?.lastname} (${parent?.email})`);
            console.log(`  - Team: ${team?.name} (${team?.isactive ? 'activo' : 'inactivo'})`);
            console.log(`  - Enrollment activo: ${enrollment.isactive}`);
          });
        }
      }
    } catch (complexErr) {
      console.log('❌ Error en consulta compleja:', complexErr.message);
    }

    console.log('\n✅ Prueba de base de datos completada');

  } catch (error) {
    console.error('\n💥 Error general:', error);
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  testDatabaseQueries();
}

module.exports = { testDatabaseQueries };


