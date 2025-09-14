// Script para actualizar la lista existente con números de teléfono
// NO ENVÍA EMAILS - SOLO CONSULTA BD Y ACTUALIZA EL ARCHIVO EXISTENTE

// Cargar variables de entorno
if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('⚠️ No se pudo cargar dotenv');
  }
}

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('📞 Actualizando lista existente con números de teléfono...');
console.log('⚠️ NOTA: Este script NO envía emails, solo consulta teléfonos');

// Lista exacta de emails del archivo existente
const emailsFromFile = [
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

async function updateListWithPhones() {
  try {
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno de Supabase no encontradas');
      return;
    }
    
    console.log('✅ Conectando a Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`📋 Consultando teléfonos para ${emailsFromFile.length} emails específicos...`);
    
    // Consultar teléfonos para los emails específicos
    const { data: parents, error } = await supabase
      .from('parent')
      .select('email, phone, firstname, lastname')
      .in('email', emailsFromFile);

    if (error) {
      console.error('❌ Error en la consulta:', error);
      return;
    }

    console.log(`📞 Teléfonos encontrados: ${parents?.length || 0}/${emailsFromFile.length}`);

    if (!parents || parents.length === 0) {
      console.log('⚠️ No se encontraron teléfonos');
      return;
    }

    // Crear mapa de email -> teléfono
    const phoneMap = {};
    parents.forEach(parent => {
      phoneMap[parent.email] = parent.phone || 'No disponible';
    });

    // Leer el archivo existente
    const existingFile = 'lista-contactos-cancelacion-completa.txt';
    if (!fs.existsSync(existingFile)) {
      console.error(`❌ No se encontró el archivo: ${existingFile}`);
      return;
    }

    console.log('📄 Leyendo archivo existente...');
    let content = fs.readFileSync(existingFile, 'utf8');

    // Actualizar cada línea que contenga "[Requiere consulta a BD]" con el teléfono real
    let updatedCount = 0;
    
    // Para cada email, buscar su línea de teléfono y reemplazarla
    emailsFromFile.forEach(email => {
      if (phoneMap[email]) {
        const phone = phoneMap[email];
        // Buscar el patrón específico para este email y reemplazar el teléfono
        const emailPattern = new RegExp(`(📧 Email: ${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\s*📞 Teléfono: )\\[Requiere consulta a BD\\]`, 'g');
        
        if (emailPattern.test(content)) {
          content = content.replace(emailPattern, `$1${phone}`);
          updatedCount++;
          console.log(`✅ ${email} -> ${phone}`);
        }
      }
    });

    // Actualizar también las estadísticas en el header
    const phonesFound = Object.values(phoneMap).filter(phone => phone !== 'No disponible').length;
    
    // Actualizar la línea de teléfonos disponibles si no existe
    if (!content.includes('TELÉFONOS DISPONIBLES:')) {
      content = content.replace(
        'TOTAL DE ESTUDIANTES AFECTADOS: 35',
        `TOTAL DE ESTUDIANTES AFECTADOS: 35\nTELÉFONOS DISPONIBLES: ${phonesFound}/33`
      );
    }

    // Actualizar la nota sobre consulta a BD
    content = content.replace(
      'NOTA: Para obtener los números de teléfono exactos, necesitamos ejecutar \nel servidor y hacer la consulta actualizada a la base de datos.',
      `TELÉFONOS ACTUALIZADOS: ${updatedCount}/33 contactos con teléfono disponible`
    );

    // Actualizar fecha
    const now = new Date();
    content = content.replace(
      'Fecha de generación: 11 de septiembre, 2025',
      `Fecha de actualización: ${now.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`
    );

    // Guardar archivo actualizado
    const updatedFile = 'lista-contactos-cancelacion-completa-con-telefonos.txt';
    fs.writeFileSync(updatedFile, content, 'utf8');

    console.log('\n✅ ¡Archivo actualizado exitosamente!');
    console.log(`📄 Archivo nuevo: ${updatedFile}`);
    console.log(`📞 Teléfonos actualizados: ${updatedCount}/33`);
    console.log(`📱 Teléfonos disponibles: ${phonesFound}`);

    // Mostrar resumen de teléfonos encontrados
    console.log('\n📋 Resumen de teléfonos:');
    let count = 0;
    emailsFromFile.forEach(email => {
      if (phoneMap[email] && count < 5) {
        console.log(`  ${email} -> ${phoneMap[email]}`);
        count++;
      }
    });
    if (emailsFromFile.length > 5) {
      console.log(`  ... y ${Math.min(updatedCount - 5, 0)} más`);
    }

    console.log('\n✨ El archivo original se mantiene intacto.');
    console.log(`✨ El archivo actualizado es: ${updatedFile}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
updateListWithPhones();


