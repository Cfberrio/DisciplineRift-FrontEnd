// Script para generar preview del correo de recordatorio de 1 semana para sesiones del Thursday 18 September 2025
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Configuración de Supabase faltante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Timezone
const TIMEZONE = 'America/New_York';

/**
 * Función robusta para parsear días de la semana
 */
function parseDaysOfWeek(daysOfWeek) {
  if (!daysOfWeek || typeof daysOfWeek !== 'string') {
    return [];
  }

  const dayMapping = {
    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
    'friday': 5, 'saturday': 6, 'sunday': 7,
    'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4,
    'fri': 5, 'sat': 6, 'sun': 7,
    'm': 1, 't': 2, 'w': 3, 'r': 4, 'f': 5, 's': 6, 'u': 7,
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4,
    'viernes': 5, 'sábado': 6, 'domingo': 7
  };

  const cleanDays = daysOfWeek
    .toLowerCase()
    .split(/[,;|\s\/]+/)
    .map(day => day.trim())
    .filter(day => day.length > 0);

  const weekdays = new Set();
  
  for (const day of cleanDays) {
    const weekday = dayMapping[day];
    if (weekday) {
      weekdays.add(weekday);
    }
  }

  return Array.from(weekdays).sort();
}

/**
 * Construye el HTML del horario de temporada
 */
function buildSeasonScheduleHtml(session, timezone = TIMEZONE) {
  try {
    const startDate = DateTime.fromISO(session.startdate, { zone: timezone });
    const endDate = session.enddate 
      ? DateTime.fromISO(session.enddate, { zone: timezone })
      : startDate;

    const weekdays = parseDaysOfWeek(session.daysofweek);
    
    if (weekdays.length === 0) {
      const startDateTime = startDate.set({
        hour: parseInt(session.starttime.split(':')[0]),
        minute: parseInt(session.starttime.split(':')[1] || '0')
      });
      
      const endDateTime = startDate.set({
        hour: parseInt(session.endtime.split(':')[0]),
        minute: parseInt(session.endtime.split(':')[1] || '0')
      });

      const formattedDate = startDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-US' });
      const formattedTime = `${startDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })} – ${endDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })}`;
      
      return `<li>${formattedDate.split(', ')[0]}, ${formattedDate.split(', ')[1]}, ${formattedTime}</li>`;
    }

    const scheduleItems = [];
    let currentDate = startDate;

    while (currentDate <= endDate && scheduleItems.length < 100) {
      const currentWeekday = currentDate.weekday;
      
      if (weekdays.includes(currentWeekday)) {
        const startDateTime = currentDate.set({
          hour: parseInt(session.starttime.split(':')[0]),
          minute: parseInt(session.starttime.split(':')[1] || '0')
        });
        
        const endDateTime = currentDate.set({
          hour: parseInt(session.endtime.split(':')[0]),
          minute: parseInt(session.endtime.split(':')[1] || '0')
        });

        const formattedDate = startDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-US' });
        const formattedTime = `${startDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })} – ${endDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })}`;
        
        scheduleItems.push(`<li>${formattedDate.split(', ')[0]}, ${formattedDate.split(', ')[1]}, ${formattedTime}</li>`);
      }
      
      currentDate = currentDate.plus({ days: 1 });
    }

    return scheduleItems.length > 0 ? scheduleItems.join('') : '<li>Schedule to be confirmed</li>';
  } catch (error) {
    console.error('Error en buildSeasonScheduleHtml:', error);
    return '<li>Schedule to be confirmed</li>';
  }
}

// Template del email de recordatorio de 1 semana
function createSeasonReminderEmailHtml(emailData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Just 1 Week Until Season Kickoff!</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;line-height:1.6;background-color:#f8fafc;">
  <table style="width:100%;min-height:100vh;background-color:#f8fafc;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:20px;vertical-align:top;">
        <table style="max-width:600px;margin:0 auto;background-color:white;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="margin:0 0 10px 0;font-size:28px;font-weight:bold;">DISCIPLINE RIFT</h1>
              <p style="margin:0;font-size:16px;opacity:0.9;">Building Champions On and Off the Court</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              
              <!-- Reminder Badge -->
              <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;padding:12px 24px;border-radius:25px;display:inline-block;font-weight:bold;margin:0 0 30px 0;font-size:14px;">
                ⏰ 1-Week Reminder
              </div>

              <!-- Title -->
              <h2 style="font-size:24px;font-weight:bold;color:#1a202c;margin:0 0 20px 0;">Season Kickoff Is Almost Here!</h2>
              
              <!-- Countdown -->
              <div style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);padding:25px;border-radius:15px;text-align:center;margin:30px 0;">
                <div style="font-size:18px;font-weight:bold;color:#2d3748;">⏰ Just 1 Week to Go!</div>
              </div>

              <!-- Greeting -->
              <p style="font-size:16px;color:#4a5568;line-height:1.7;margin:25px 0;">
                Hi <strong>${emailData.parentName}</strong>,
              </p>

              <!-- Main Message -->
              <p style="font-size:16px;color:#4a5568;line-height:1.7;margin:25px 0;">
                We're just one week away from the start of our Discipline Rift season for 
                <strong style="color:#1e40af;">${emailData.teamName}</strong> on 
                <strong style="color:#dc2626;">${emailData.startDate}</strong>! 
                Make sure to remind their teacher about the season and have everything ready for an exciting season ahead.
              </p>

              <!-- Team Info -->
              <div style="background-color:#f7fafc;padding:25px;border-radius:12px;margin:25px 0;">
                <div style="font-size:20px;font-weight:bold;color:#1e40af;margin:0 0 10px 0;">${emailData.teamName}</div>
                <div style="font-size:18px;color:#dc2626;font-weight:600;">Starts: ${emailData.startDate}</div>
              </div>

              <!-- Schedule Section -->
              <div style="margin:30px 0;">
                <h3 style="font-size:18px;font-weight:bold;color:#1a202c;margin:0 0 15px 0;">📅 Season Schedule:</h3>
                <div style="background-color:#f8fafc;border-radius:8px;padding:20px;">
                  <ul style="margin:0;padding-left:20px;color:#4a5568;">
                    ${emailData.scheduleHtml}
                  </ul>
                </div>
              </div>

              <!-- Final Message -->
              <div style="background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);padding:20px;border-radius:12px;text-align:center;margin:25px 0;">
                <div style="font-size:18px;font-weight:bold;color:#744210;">See you on the court!</div>
                <div style="margin-top:10px;font-size:16px;color:#744210;">Discipline Rift Team</div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
              <div style="margin-bottom:20px;">
                <h4 style="color:#1f2937;font-size:18px;font-weight:bold;margin:0 0 12px 0;">Discipline Rift</h4>
                <div style="color:#6b7280;font-size:14px;line-height:20px;">
                  <p style="margin:0 0 4px 0;">📧 Support: info@disciplinerift.com</p>
                  <p style="margin:0 0 4px 0;">📞 Phone: (407) 6147454</p>
                  <p style="margin:0;">🌐 Web: www.disciplinerift.com</p>
                </div>
              </div>
              
              <div style="border-top:1px solid #d1d5db;padding-top:20px;margin-top:20px;">
                <p style="color:#9ca3af;font-size:12px;margin:0;line-height:18px;">
                  This is an automated email. If you have any questions, please don't hesitate to contact us.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Función principal
async function generatePreview() {
  try {
    console.log('🔍 Generando preview del correo de recordatorio de 1 semana para September 18, 2025...');
    console.log('📋 Variables de entorno:');
    console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...`);
    console.log(`   SUPABASE_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NO DEFINIDA'}`);

    // Fecha objetivo: Thursday, September 18, 2025
    const targetDate = '2025-09-18';
    
    console.log(`🎯 Buscando sesiones que inician en: ${targetDate}`);

    // Buscar sesiones que inician en esa fecha
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select('sessionid, teamid, startdate, enddate, starttime, endtime, daysofweek')
      .eq('startdate', targetDate);

    if (sessionsError) {
      throw new Error(`Error consultando sesiones: ${sessionsError.message}`);
    }

    console.log(`📊 Encontradas ${sessions?.length || 0} sesiones`);

    if (!sessions || sessions.length === 0) {
      console.log('❌ No hay sesiones para esa fecha');
      return;
    }

    // Tomar la primera sesión
    const session = sessions[0];
    console.log(`\n🏐 Procesando sesión ${session.sessionid} del equipo ${session.teamid}`);

    // Buscar inscripciones activas
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollment')
      .select('enrollmentid, studentid')
      .eq('teamid', session.teamid)
      .eq('isactive', true)
      .limit(1);

    if (enrollmentsError || !enrollments || enrollments.length === 0) {
      console.log('❌ No hay inscripciones activas para este equipo');
      return;
    }

    // Buscar estudiante
    const { data: students, error: studentsError } = await supabase
      .from('student')
      .select('studentid, parentid, firstname, lastname')
      .eq('studentid', enrollments[0].studentid)
      .single();

    if (studentsError || !students) {
      console.log('❌ No se encontró el estudiante');
      return;
    }

    // Buscar padre
    const { data: parent, error: parentsError } = await supabase
      .from('parent')
      .select('parentid, firstname, lastname, email')
      .eq('parentid', students.parentid)
      .single();

    if (parentsError || !parent) {
      console.log('❌ No se encontró el padre');
      return;
    }

    // Buscar nombre del equipo
    let teamName = `Team ${session.teamid.slice(-8)}`;
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('team')
        .select('name')
        .eq('teamid', session.teamid)
        .single();
      
      if (teamData && teamData.name) {
        teamName = teamData.name;
      }
    } catch (error) {
      console.log(`ℹ️ Usando nombre de equipo fallback: ${teamName}`);
    }

    // Construir el horario de temporada
    const scheduleHtml = buildSeasonScheduleHtml(session);

    // Formatear fecha de inicio
    const startDate = DateTime.fromISO(session.startdate, { zone: TIMEZONE })
      .toLocaleString(DateTime.DATE_FULL, { locale: 'en-US' });

    const emailData = {
      parentName: parent.firstname,
      teamName,
      startDate,
      scheduleHtml
    };

    // Generar HTML
    const htmlContent = createSeasonReminderEmailHtml(emailData);

    // Guardar el preview
    const fs = require('fs');
    const fileName = 'real-1week-september-18-preview.html';
    console.log(`🔨 Guardando archivo: ${fileName}`);
    fs.writeFileSync(fileName, htmlContent);

    console.log(`\n✅ Preview generado exitosamente: ${fileName}`);
    console.log(`📧 Email sería enviado a: ${parent.email} (${parent.firstname})`);
    console.log(`🏐 Equipo: ${teamName}`);
    console.log(`📅 Fecha de inicio: ${startDate}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generatePreview();