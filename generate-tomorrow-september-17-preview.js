const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');
const fs = require('fs');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Funciones helper (copiadas del archivo principal)
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

function buildSeasonScheduleHtml(session) {
  try {
    const startDate = DateTime.fromISO(session.startdate, { zone: 'America/New_York' });
    const endDate = session.enddate 
      ? DateTime.fromISO(session.enddate, { zone: 'America/New_York' })
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

// Template del email (mismo que en sendSeasonReminders.ts)
function createSeasonReminderEmailHtml(emailData) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Season Reminder</title>
    <style>
      @media (max-width: 600px) {
        .container { width: 100% !important; }
        .content { padding: 20px !important; }
        .header { padding: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="min-height:100vh;">
      <tr>
        <td style="padding:20px;vertical-align:top;">
          <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.2);overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td class="header" style="background:linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);padding:30px;text-align:center;">
                <div style="background:rgba(255,255,255,0.15);border-radius:50px;display:inline-block;padding:12px 24px;margin-bottom:16px;">
                  <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:1px;">🏐 DISCIPLINE RIFT</span>
                </div>
                <h1 style="color:#ffffff;font-size:28px;font-weight:bold;margin:0;text-shadow:0 2px 4px rgba(0,0,0,0.2);">
                  Tomorrow's the Big Day! ${emailData.teamName} Season Begins
                </h1>
                <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;">
                  Day Before Reminder
                </p>
              </td>
            </tr>

            <!-- Main content -->
            <tr>
              <td class="content" style="padding:40px;">
                <div style="text-align:center;margin-bottom:32px;">
                  <div style="background:linear-gradient(135deg, #dc2626 0%, #ef4444 100%);color:#ffffff;padding:16px 24px;border-radius:50px;display:inline-block;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                    🎉 Tomorrow's the Big Day!
                  </div>
                </div>

                <p style="margin:0 0 24px 0;font-size:18px;line-height:28px;color:#374151;text-align:center;">
                  Hi <strong style="color:#1e40af;">${emailData.parentName}</strong>,
                </p>
                
                <div style="background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:12px;padding:24px;margin:0 0 32px 0;border-left:4px solid #3b82f6;">
                  <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#475569;">
                    The wait is almost over — tomorrow we kick off the Discipline Rift season for <strong style="color:#1e40af;">${emailData.teamName}</strong>!
                  </p>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#475569;">
                    We can't wait to see the players in action.
                  </p>
                </div>

               <div style="background:#ffffff;border:2px solid #e5e7eb;border-radius:12px;padding:24px;margin:0 0 32px 0;">
                 <h3 style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;display:flex;align-items:center;justify-content:center;">
                   <span style="background:linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);color:#ffffff;padding:8px 16px;border-radius:20px;margin-right:12px;">📋</span>
                   Season Schedule
                 </h3>
                 <div style="border-top:2px solid #e5e7eb;padding-top:20px;">
                   <ul style="margin:0;padding:0;list-style:none;font-size:15px;line-height:24px;color:#475569;">
                     ${emailData.scheduleHtml.replace(/<li>/g, '<li style="margin:0 0 8px 0;padding:8px 12px;background:#ffffff;border-radius:6px;border-left:3px solid #3b82f6;">').replace(/<\/li>/g, '</li>')}
                   </ul>
                 </div>
               </div>

               <div style="text-align:center;margin:32px 0;">
                 <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#ffffff;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                   <h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;">See you tomorrow!</h4>
                   <p style="margin:0;font-size:16px;opacity:0.9;">
                     Discipline Rift Team
                   </p>
                 </div>
               </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:14px;color:#6b7280;">
                  You're receiving this because your child is enrolled in our Discipline Rift program.
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

async function generatePreview() {
  try {
    console.log('🎯 Generando preview para sesiones del Wednesday, September 17, 2025');
    
    // Simular que estamos 1 día antes del 17 de septiembre
    const testDate = DateTime.fromISO('2025-09-16', { zone: 'America/New_York' });
    const targetDate = testDate.plus({ days: 1 }); // 2025-09-17
    
    console.log(`📅 Fecha simulada actual: ${testDate.toFormat('yyyy-MM-dd')}`);
    console.log(`🔍 Buscando sesiones que inician el: ${targetDate.toFormat('yyyy-MM-dd')}`);
    
    console.log('\n🔍 Consultando sesiones del Wednesday 17 September...');

    // Buscar sesiones que empiecen el 17 de septiembre de 2025 con equipos activos
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select(`
        sessionid, 
        teamid, 
        startdate, 
        enddate, 
        starttime, 
        endtime, 
        daysofweek,
        team!inner(teamid, isactive)
      `)
      .eq('startdate', '2025-09-17')
      .eq('team.isactive', true);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return;
    }

    if (!sessions || sessions.length === 0) {
      console.log('❌ No se encontraron sesiones para Wednesday 17 September 2025 con equipos activos');
      return;
    }

    console.log(`✅ Encontradas ${sessions.length} sesiones con equipos activos`);

    // Tomar la primera sesión como ejemplo
    const firstSession = sessions[0];
    console.log(`📋 Usando sesión: ${firstSession.sessionid} del equipo: ${firstSession.teamid}`);

    // Buscar inscripciones activas
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollment')
      .select('enrollmentid, studentid')
      .eq('teamid', firstSession.teamid)
      .eq('isactive', true)
      .limit(1);

    if (enrollmentsError || !enrollments || enrollments.length === 0) {
      console.log('❌ No se encontraron inscripciones activas');
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
    const { data: parent, error: parentError } = await supabase
      .from('parent')
      .select('parentid, firstname, lastname, email')
      .eq('parentid', students.parentid)
      .single();

    if (parentError || !parent) {
      console.log('❌ No se encontró el padre');
      return;
    }

    // Buscar nombre del equipo
    const { data: team, error: teamError } = await supabase
      .from('team')
      .select('name')
      .eq('teamid', firstSession.teamid)
      .single();

    const teamName = team?.name || `Team ${firstSession.teamid.slice(-8)}`;

    // Obtener todas las sesiones del equipo para el schedule
    const { data: allTeamSessions, error: teamSessionsError } = await supabase
      .from('session')
      .select('startdate, enddate, starttime, endtime, daysofweek')
      .eq('teamid', firstSession.teamid)
      .order('startdate', { ascending: true });

    console.log('\n📧 === PREVIEW DEL EMAIL ===');
    console.log(`Para: ${parent.email}`);
    console.log(`Padre: ${parent.firstname} ${parent.lastname}`);
    console.log(`Equipo: ${teamName}`);
    console.log(`Fecha de inicio de temporada: ${DateTime.fromISO(firstSession.startdate, { zone: 'America/New_York' }).toLocaleString(DateTime.DATE_FULL, { locale: 'en-US' })}`);

    // Preparar datos del email
    const emailData = {
      parentName: parent.firstname,
      teamName: teamName,
      startDate: DateTime.fromISO(firstSession.startdate, { zone: 'America/New_York' }).toLocaleString(DateTime.DATE_FULL, { locale: 'en-US' }),
      scheduleHtml: buildSeasonScheduleHtml(firstSession)
    };

    // Generar HTML
    const htmlContent = createSeasonReminderEmailHtml(emailData);

    // Guardar archivo
    const fileName = 'tomorrow-preview-sept17-2025.html';
    fs.writeFileSync(fileName, htmlContent);
    console.log(`\n✅ Preview guardado en: ${fileName}`);
    console.log('\n📋 Horario incluido:');
    console.log(emailData.scheduleHtml.replace(/<li>/g, '• ').replace(/<\/li>/g, ''));

    console.log('\n🎯 === RESUMEN ===');
    console.log(`Subject: Tomorrow's the Big Day! ${teamName} Season Begins`);
    console.log(`Para enviar a: ${enrollments.length} inscripciones activas en el equipo`);
    
  } catch (error) {
    console.error('Error generating preview:', error);
  }
}

generatePreview();
