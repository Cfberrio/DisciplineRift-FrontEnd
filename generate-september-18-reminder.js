#!/usr/bin/env node

// Script para generar preview de recordatorios para Thursday, September 18, 2025
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const TIMEZONE = 'America/New_York';

// Fecha específica: Thursday, September 18, 2025
const targetDate = '2025-09-18';

console.log(`🎯 Buscando sesiones que inician exactamente el: ${targetDate} (Thursday, September 18, 2025)`);

// Función para parsear días de la semana
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

// Función para construir el horario de temporada
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

    while (currentDate <= endDate && scheduleItems.length < 10) {
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

// Template del email
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
                  Your Season Starts Soon!
                </h1>
                <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;">
                  30-Day Reminder
                </p>
              </td>
            </tr>

            <!-- Main content -->
            <tr>
              <td class="content" style="padding:40px;">
                <div style="text-align:center;margin-bottom:32px;">
                  <div style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:#ffffff;padding:16px 24px;border-radius:50px;display:inline-block;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(245,158,11,0.3);">
                    📅 30 Days to Go
                  </div>
                </div>

                <p style="margin:0 0 24px 0;font-size:18px;line-height:28px;color:#374151;text-align:center;">
                  Hi <strong style="color:#1e40af;">${emailData.parentName}</strong>,
                </p>
                
                <div style="background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:12px;padding:24px;margin:0 0 32px 0;border-left:4px solid #3b82f6;">
                  <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#475569;">
                    This is your reminder that the <strong style="color:#1e40af;">${emailData.teamName}</strong> 
                    season begins in exactly one month on <strong style="color:#dc2626;">${emailData.startDate}</strong>.
                  </p>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#475569;">
                    Get ready for another great season filled with skill development, growth, and fun!
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
                    <h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;">We're Excited!</h4>
                    <p style="margin:0;font-size:16px;opacity:0.9;">
                      See you on the courts soon
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

async function getSeptember18SessionData() {
  try {
    console.log('🔍 Consultando sesiones que empiezan el Thursday, September 18, 2025...');
    
    // Buscar sesiones que inician exactamente el 18 de septiembre
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select('sessionid, teamid, startdate, enddate, starttime, endtime, daysofweek')
      .eq('startdate', targetDate)
      .limit(1000);

    if (sessionsError) {
      throw new Error(`Error consultando sesiones: ${sessionsError.message}`);
    }

    console.log(`📊 Encontradas ${sessions?.length || 0} sesiones para el 18 de septiembre`);

    if (!sessions || sessions.length === 0) {
      console.log('❌ No hay sesiones que empiecen el 18 de septiembre de 2025');
      return { sessions: [], enrollmentData: [] };
    }

    // Para cada sesión, buscar inscripciones activas
    const allEnrollmentData = [];
    
    for (const session of sessions) {
      console.log(`🏐 Procesando sesión ${session.sessionid} del equipo ${session.teamid}`);

      // Buscar inscripciones activas para este equipo
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollment')
        .select('enrollmentid, studentid')
        .eq('teamid', session.teamid)
        .eq('isactive', true);

      if (enrollmentsError || !enrollments || enrollments.length === 0) {
        console.log(`ℹ️ No hay inscripciones activas para el equipo ${session.teamid}`);
        continue;
      }

      console.log(`👥 Encontradas ${enrollments.length} inscripciones activas para ${session.teamid}`);

      // Buscar estudiantes
      const studentIds = enrollments.map(e => e.studentid);
      const { data: students, error: studentsError } = await supabase
        .from('student')
        .select('studentid, parentid, firstname, lastname')
        .in('studentid', studentIds);

      if (studentsError || !students) {
        console.log(`ℹ️ No se encontraron estudiantes para el equipo ${session.teamid}`);
        continue;
      }

      // Buscar padres únicos
      const parentIds = [...new Set(students.map(s => s.parentid))];
      const { data: parents, error: parentsError } = await supabase
        .from('parent')
        .select('parentid, firstname, lastname, email')
        .in('parentid', parentIds);

      if (parentsError || !parents) {
        console.log(`ℹ️ No se encontraron padres para el equipo ${session.teamid}`);
        continue;
      }

      // Buscar nombre del equipo
      let teamName = `Team ${session.teamid.slice(-8)}`;
      try {
        const { data: teamData } = await supabase
          .from('team')
          .select('name')
          .eq('teamid', session.teamid)
          .single();
        
        if (teamData) {
          teamName = teamData.name || teamName;
        }
      } catch (error) {
        console.log(`ℹ️ No se pudo obtener nombre del equipo ${session.teamid}`);
      }

      // Agregar datos de esta sesión
      allEnrollmentData.push({
        session,
        teamName,
        students,
        parents,
        enrollmentCount: enrollments.length
      });
    }

    return { sessions, enrollmentData: allEnrollmentData };

  } catch (error) {
    console.error('💥 Error en getSeptember18SessionData:', error);
    return { sessions: [], enrollmentData: [] };
  }
}

async function main() {
  console.log('🚀 Generando preview para recordatorios del Thursday, September 18, 2025...');
  
  const { sessions, enrollmentData } = await getSeptember18SessionData();
  
  if (enrollmentData.length === 0) {
    console.log('❌ No se encontraron datos para generar preview');
    return;
  }

  // Tomar el primer equipo con inscripciones para el preview
  const firstTeamData = enrollmentData[0];
  const firstParent = firstTeamData.parents[0];

  // Construir el horario de temporada
  const scheduleHtml = buildSeasonScheduleHtml(firstTeamData.session);

  // Formatear fecha de inicio
  const startDate = DateTime.fromISO(firstTeamData.session.startdate, { zone: TIMEZONE })
    .toLocaleString(DateTime.DATE_FULL, { locale: 'en-US' });

  const emailData = {
    parentName: firstParent.firstname,
    teamName: firstTeamData.teamName,
    startDate,
    scheduleHtml
  };

  const htmlContent = createSeasonReminderEmailHtml(emailData);
  
  // Guardar el HTML
  fs.writeFileSync('real-september-18-preview.html', htmlContent);
  console.log('✅ Preview generado: real-september-18-preview.html');
  
  // Mostrar resumen completo
  console.log('\n📊 === RESUMEN COMPLETO DE SESIONES DEL 18 DE SEPTIEMBRE ===');
  
  let totalEmails = 0;
  enrollmentData.forEach((data, index) => {
    console.log(`\n🏐 ${index + 1}. Equipo: ${data.teamName}`);
    console.log(`   📧 Padres que recibirán email: ${data.parents.length}`);
    console.log(`   👨‍🎓 Estudiantes inscritos: ${data.enrollmentCount}`);
    console.log(`   ⏰ Horario: ${data.session.starttime} - ${data.session.endtime}`);
    console.log(`   📆 Días: ${data.session.daysofweek}`);
    totalEmails += data.parents.length;
  });

  console.log(`\n📊 === TOTALES ===`);
  console.log(`🎯 Total de sesiones: ${sessions.length}`);
  console.log(`🏐 Equipos con inscripciones activas: ${enrollmentData.length}`);
  console.log(`📧 Total de emails que se enviarían: ${totalEmails}`);
  
  console.log(`\n📧 === DATOS DEL PREVIEW ===`);
  console.log(`Padre: ${firstParent.firstname} ${firstParent.lastname}`);
  console.log(`Email: ${firstParent.email}`);
  console.log(`Equipo: ${firstTeamData.teamName}`);
  console.log(`Fecha: ${startDate}`);
}

main().catch(console.error);













