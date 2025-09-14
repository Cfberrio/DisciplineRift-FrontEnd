// Script para generar preview del correo de recordatorio de 1 semana para sesiones del Wednesday 17 September 2025
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
        const timeRange = `${startDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })} – ${endDateTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })}`;
        
        scheduleItems.push(`<li>${formattedDate.split(' at ')[0]}, ${timeRange}</li>`);
      }
      
      currentDate = currentDate.plus({ days: 1 });
    }

    return scheduleItems.length > 0 ? scheduleItems.join('\n       ') : '<li>Schedule to be confirmed</li>';
  } catch (error) {
    console.error('Error building season schedule HTML:', error);
    return '<li>Schedule to be confirmed</li>';
  }
}

/**
 * Genera el HTML del email de recordatorio de 1 semana
 */
function createSeasonReminderEmailHtml(emailData) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Season Reminder</title>
    <style>
      @media (max-width: 600px) {
        .container { width: 100% !important; margin: 0 !important; }
        .content { padding: 20px !important; }
        .header { padding: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="min-height:100vh;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.1);">
            
            <!-- Header with logo and brand -->
            <tr>
              <td class="header" style="background:linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);padding:30px;text-align:center;">
                <div style="background:rgba(255,255,255,0.15);border-radius:50px;display:inline-block;padding:12px 24px;margin-bottom:16px;">
                  <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:1px;">🏐 DISCIPLINE RIFT</span>
                </div>
                <h1 style="color:#ffffff;font-size:28px;font-weight:bold;margin:0;text-shadow:0 2px 4px rgba(0,0,0,0.2);">
                  Just 1 Week Until ${emailData.teamName} Season Kickoff!
                </h1>
                <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;">
                  1-Week Reminder
                </p>
              </td>
            </tr>

            <!-- Main content -->
            <tr>
              <td class="content" style="padding:40px;">
                <div style="text-align:center;margin-bottom:32px;">
                  <div style="background:linear-gradient(135deg, #dc2626 0%, #ef4444 100%);color:#ffffff;padding:16px 24px;border-radius:50px;display:inline-block;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                    ⏰ Just 1 Week to Go!
                  </div>
                </div>

                <p style="margin:0 0 24px 0;font-size:18px;line-height:28px;color:#374151;text-align:center;">
                  Hi <strong style="color:#1e40af;">${emailData.parentName}</strong>,
                </p>
                
                <div style="background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:12px;padding:24px;margin:0 0 32px 0;border-left:4px solid #3b82f6;">
                  <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#475569;">
                    We're just one week away from the start of our Discipline Rift season for <strong style="color:#1e40af;">${emailData.teamName}</strong> on <strong style="color:#dc2626;">${emailData.startDate}</strong>!
                  </p>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#475569;">
                    Make sure to remind their teacher about the season and have everything ready for an exciting season ahead.
                  </p>
                </div>

                <div style="background:#ffffff;border:2px solid #e5e7eb;border-radius:12px;padding:24px;margin:0 0 32px 0;">
                  <h3 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;display:flex;align-items:center;justify-content:center;">
                    <span style="background:linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);color:#ffffff;padding:8px 16px;border-radius:20px;margin-right:12px;">📋</span>
                    Season Schedule
                  </h3>
                  <div style="background:#f8fafc;border-radius:8px;padding:20px;">
                    <ul style="margin:0;padding:0;list-style:none;font-size:15px;line-height:24px;color:#475569;">
                      ${emailData.scheduleHtml.replace(/<li>/g, '<li style="margin:0 0 8px 0;padding:8px 12px;background:#ffffff;border-radius:6px;border-left:3px solid #3b82f6;">').replace(/<\/li>/g, '</li>')}
                </ul>
                  </div>
                </div>

                <div style="text-align:center;margin:32px 0;">
                  <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#ffffff;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                    <h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;">See you on the court!</h4>
                    <p style="margin:0;font-size:16px;opacity:0.9;">
                      Discipline Rift Team
                    </p>
                  </div>
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
    console.log('🔍 Generando preview del correo de recordatorio de 1 semana para September 17, 2025...');

    // Fecha objetivo: Wednesday, September 17, 2025
    const targetDate = '2025-09-17';
    
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
    const fileName = 'real-1week-september-17-preview.html';
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

