// Script simple para obtener teléfonos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const emails = [
  'marielyp17@gmail.com', 'riley.seegert@gmail.com', 'isavs11@gmail.com',
  'sarah.walker@adp.com', 'aewonderlich@gmail.com', 'velanagrover@gmail.com',
  'umutko@yahoo.com', 'ying.011@hotmail.com', 'nicksweeney16@gmail.com',
  'guilfop@tcd.ie', 'rodriguezyi.0809@gmail.com', 'vilmapusky@gmail.com',
  'info@southbeachescenter.com', 'soniaivelissesr@gmail.com', '85seoul@gmail.com',
  'jap3in1@gmail.com', 'sherawynn@hotmail.com', 'acordner1@gmail.com',
  'csmit014@gmail.com', 'toyinkofo1@gmail.com', 'johnson.jerrami@gmail.com',
  'shah_good@hotmail.com', 'trinityanisha@gmail.com', 'ilene9579@yahoo.com',
  'muguerzaveronica@gmail.com', 'kingduffie90@gmail.com', 'two.blessings@yahoo.com',
  'yeseniamedinanet@gmail.com', 'ciaranatasha18@gmail.com', 'laojamrock@gmail.com',
  'ldchervenak@yahoo.com', 'cfberrio@uninorte.edu.co', 'yvelineosias20@gmail.com'
];

async function run() {
  try {
    console.log('Consultando teléfonos...');
    const { data: parents } = await supabase
      .from('parent')
      .select('email, phone, firstname, lastname')
      .in('email', emails);

    console.log(`Teléfonos encontrados: ${parents?.length || 0}/${emails.length}`);
    
    if (parents) {
      parents.forEach(p => {
        console.log(`${p.email} -> ${p.phone || 'No disponible'}`);
      });
    }
    
    // Crear mapa de teléfonos
    const phoneMap = {};
    if (parents) {
      parents.forEach(p => {
        phoneMap[p.email] = p.phone || 'No disponible';
      });
    }

    // Leer archivo existente
    let content = fs.readFileSync('lista-contactos-cancelacion-completa.txt', 'utf8');
    let updates = 0;

    // Actualizar teléfonos
    emails.forEach(email => {
      if (phoneMap[email]) {
        const regex = new RegExp(`(📧 Email: ${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\s*📞 Teléfono: )\\[Requiere consulta a BD\\]`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1${phoneMap[email]}`);
          updates++;
        }
      }
    });

    // Actualizar header
    content = content.replace(
      'TOTAL DE ESTUDIANTES AFECTADOS: 35',
      `TOTAL DE ESTUDIANTES AFECTADOS: 35\nTELÉFONOS ACTUALIZADOS: ${updates}/33`
    );

    // Guardar archivo
    fs.writeFileSync('lista-contactos-con-telefonos-actualizados.txt', content, 'utf8');
    console.log(`Archivo actualizado con ${updates} teléfonos`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();


