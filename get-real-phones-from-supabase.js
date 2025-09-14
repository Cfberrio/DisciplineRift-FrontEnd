// Script para obtener SOLO los números reales de Supabase
// NO inventa números - Solo consulta la tabla parent columna phone

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('📞 Consultando números reales desde Supabase...');
console.log('⚠️ Solo obtendrá números que existan en tabla parent columna phone');

// Lista exacta de emails del archivo
const emails = [
  'marielyp17@gmail.com',
  'riley.seegert@gmail.com', 
  'isavs11@gmail.com',
  'sarah.walker@adp.com',
  'aewonderlich@gmail.com',
  'velanagrover@gmail.com',
  'umutko@yahoo.com',
  'ying.011@hotmail.com',
  'nicksweeney16@gmail.com',
  'guilfop@tcd.ie',
  'rodriguezyi.0809@gmail.com',
  'vilmapusky@gmail.com',
  'info@southbeachescenter.com',
  'soniaivelissesr@gmail.com',
  '85seoul@gmail.com',
  'jap3in1@gmail.com',
  'sherawynn@hotmail.com',
  'acordner1@gmail.com',
  'csmit014@gmail.com',
  'toyinkofo1@gmail.com',
  'johnson.jerrami@gmail.com',
  'shah_good@hotmail.com',
  'trinityanisha@gmail.com',
  'ilene9579@yahoo.com',
  'muguerzaveronica@gmail.com',
  'kingduffie90@gmail.com',
  'two.blessings@yahoo.com',
  'yeseniamedinanet@gmail.com',
  'ciaranatasha18@gmail.com',
  'laojamrock@gmail.com',
  'ldchervenak@yahoo.com',
  'cfberrio@uninorte.edu.co',
  'yvelineosias20@gmail.com'
];

async function getRealPhones() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno no encontradas');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`📋 Consultando ${emails.length} emails en tabla parent...`);
    
    // Consulta REAL a la tabla parent
    const { data: parents, error } = await supabase
      .from('parent')
      .select('email, phone, firstname, lastname')
      .in('email', emails);

    if (error) {
      console.error('❌ Error en consulta:', error);
      return;
    }

    console.log(`📊 Resultado: ${parents?.length || 0} registros encontrados`);
    
    if (!parents || parents.length === 0) {
      console.log('❌ No se encontraron registros en la tabla parent');
      return;
    }

    // Mostrar TODOS los resultados reales
    console.log('\n📞 NÚMEROS REALES DESDE SUPABASE:');
    console.log('================================');
    
    parents.forEach((parent, index) => {
      console.log(`${index + 1}. ${parent.firstname} ${parent.lastname}`);
      console.log(`   📧 ${parent.email}`);
      console.log(`   📞 ${parent.phone || 'NULL en BD'}`);
      console.log('');
    });

    // Crear archivo con datos REALES
    const phoneMap = {};
    parents.forEach(parent => {
      phoneMap[parent.email] = parent.phone || 'Sin teléfono en BD';
    });

    // Leer archivo original
    let content = fs.readFileSync('lista-contactos-cancelacion-completa.txt', 'utf8');
    
    // Actualizar SOLO con números reales
    let updated = 0;
    emails.forEach(email => {
      if (phoneMap.hasOwnProperty(email)) {
        const phone = phoneMap[email];
        const regex = new RegExp(`(📧 Email: ${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\s*📞 Teléfono: )\\[Requiere consulta a BD\\]`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1${phone}`);
          updated++;
          console.log(`✅ Actualizado: ${email} -> ${phone}`);
        }
      }
    });

    // Actualizar header
    const realPhones = Object.values(phoneMap).filter(phone => phone !== 'Sin teléfono en BD').length;
    content = content.replace(
      'TOTAL DE ESTUDIANTES AFECTADOS: 35',
      `TOTAL DE ESTUDIANTES AFECTADOS: 35\nTELÉFONOS REALES OBTENIDOS: ${realPhones}/${parents.length}`
    );

    // Actualizar fecha
    content = content.replace(
      'Fecha de generación: 11 de septiembre, 2025',
      `Última actualización: ${new Date().toLocaleString('es-ES')}`
    );

    // Guardar archivo actualizado
    const outputFile = 'lista-contactos-REAL-desde-supabase.txt';
    fs.writeFileSync(outputFile, content, 'utf8');

    console.log(`\n✅ Archivo creado: ${outputFile}`);
    console.log(`📞 Registros actualizados: ${updated}/${emails.length}`);
    console.log(`📱 Teléfonos reales: ${realPhones}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getRealPhones();


