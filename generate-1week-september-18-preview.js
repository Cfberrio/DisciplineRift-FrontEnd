require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { DateTime } = require('luxon');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simular fecha actual como si fuéramos 7 días antes (September 11, 2025)
const testDate = DateTime.fromISO('2025-09-11', { zone: 'America/New_York' });
const targetStartDate = testDate.plus({ days: 7 }).toISODate(); // 2025-09-18

console.log('🎯 Generando preview para sesiones del Thursday, September 18, 2025');
console.log('📅 Fecha simulada actual:', testDate.toISODate());
console.log('🔍 Buscando sesiones que inician el:', targetStartDate);

function buildSeasonScheduleHtml(sessions) {
  if (!sessions || sessions.length === 0) {
    return '<li>Schedule to be confirmed</li>';
  }

  return sessions.map(session => {
    const practices = JSON.parse(session.practice_dates || '[]');
    if (!practices || practices.length === 0) {
      return '<li>Schedule to be confirmed</li>';
    }

    return practices.map(practice => {
      // Crear objetos Date y establecer explícitamente las horas para evitar problemas de timezone
      const startDate = new Date(practice.start);
      startDate.setHours(12, 0, 0, 0); // Establecer a mediodía
      
      const endDate = new Date(practice.end);
      endDate.setHours(12, 0, 0, 0); // Establecer a mediodía

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short", 
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York"
      }).format(startDate);

      const startTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York"
      }).format(new Date(practice.start));

      const endTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric", 
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York"
      }).format(new Date(practice.end));

      const location = practice.location || session.location || 'Location TBD';
      const coach = practice.coach_name || session.coach_name || 'Coach TBD';

      return `
        <li style="margin-bottom: 12px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">${formattedDate}</div>
          <div style="color: #64748b; font-size: 14px; margin-bottom: 2px;">⏰ ${startTime} – ${endTime}</div>
          <div style="color: #64748b; font-size: 14px; margin-bottom: 2px;">📍 ${location}</div>
          <div style="color: #64748b; font-size: 14px;">👨‍🏫 Coach ${coach}</div>
        </li>
      `;
    }).join('');
  }).join('');
}

function createSeasonReminderEmailHtml(emailData) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1-Week Season Reminder - ${emailData.teamName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .reminder-badge {
            background-color: #dc2626;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
            display: inline-block;
        }
        .content {
            padding: 30px 20px;
        }
        .countdown {
            text-align: center;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid #f59e0b;
        }
        .countdown h2 {
            margin: 0;
            font-size: 28px;
            color: #92400e;
            font-weight: 800;
        }
        .team-info {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 12px;
            border-left: 6px solid #3b82f6;
            margin: 20px 0;
        }
        .schedule-section {
            margin: 25px 0;
        }
        .schedule-section h3 {
            color: #1e40af;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .schedule-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .footer {
            background-color: #1f2937;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            color: #92400e;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 20px;
            }
            .countdown h2 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏐 Discipline Rift</h1>
            <div class="reminder-badge">1-Week Reminder</div>
        </div>
        
        <div class="content">
            <div class="countdown">
                <h2>⏰ Just 1 Week to Go!</h2>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi <strong style="color: #1e40af;">${emailData.parentName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.7; margin-bottom: 20px;">
                We're just one week away from the start of our Discipline Rift season for <strong style="color: #1e40af;">${emailData.teamName}</strong> on <strong style="color: #dc2626;">${emailData.startDate}</strong>! Make sure to remind their teacher about the season and have everything ready for an exciting season ahead.
            </p>
            
            <div class="team-info">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Team Information</h3>
                <p style="margin: 8px 0;"><strong>Team:</strong> ${emailData.teamName}</p>
                <p style="margin: 8px 0;"><strong>Student:</strong> ${emailData.studentName}</p>
                <p style="margin: 8px 0;"><strong>Season Start:</strong> ${emailData.startDate}</p>
            </div>
            
            <div class="schedule-section">
                <h3>📅 Season Schedule</h3>
                <ul class="schedule-list">
                    ${emailData.scheduleHtml}
                </ul>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-top: 25px; text-align: center; font-weight: 600;">
                See you on the court!<br>
                Discipline Rift Team
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Discipline Rift</strong></p>
            <p style="font-size: 14px; color: #9ca3af;">Developing champions on and off the court</p>
        </div>
    </div>
</body>
</html>
  `;
}

async function generatePreview() {
  try {
    console.log('\n🔍 Consultando sesiones del Thursday 18 September...');
    
    // Buscar sesiones que empiezan el 18 de septiembre de 2025
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        team_id,
        start_date,
        location,
        coach_name,
        practice_dates,
        team:teams(name)
      `)
      .eq('start_date', targetStartDate);

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return;
    }

    console.log(`📊 Encontradas ${sessions.length} sesiones para el ${targetStartDate}`);

    if (sessions.length === 0) {
      console.log('⚠️ No se encontraron sesiones para esa fecha');
      return;
    }

    // Tomar la primera sesión con inscripciones para el preview
    let selectedSession = null;
    let enrollments = [];

    for (const session of sessions) {
      console.log(`\n🏐 Verificando sesión ${session.id} del equipo ${session.team_id}`);
      
      const { data: sessionEnrollments, error: enrollError } = await supabase
        .from('enrollment')
        .select(`
          id,
          student_id,
          parent_id,
          isactive,
          student:students(first_name, last_name),
          parent:parents(first_name, last_name, email)
        `)
        .eq('team_id', session.team_id)
        .eq('isactive', true);

      if (enrollError) {
        console.error('❌ Error fetching enrollments:', enrollError);
        continue;
      }

      console.log(`👥 Encontradas ${sessionEnrollments.length} inscripciones activas`);

      if (sessionEnrollments.length > 0) {
        selectedSession = session;
        enrollments = sessionEnrollments;
        break;
      }
    }

    if (!selectedSession) {
      console.log('⚠️ No se encontraron sesiones con inscripciones activas');
      return;
    }

    // Obtener el nombre del equipo
    const teamName = selectedSession.team?.name || `Team ${selectedSession.team_id}`;
    console.log(`✅ Equipo seleccionado: ${teamName}`);

    // Tomar el primer enrollment para el preview
    const sampleEnrollment = enrollments[0];
    const parentName = `${sampleEnrollment.parent.first_name} ${sampleEnrollment.parent.last_name}`;
    const studentName = `${sampleEnrollment.student.first_name} ${sampleEnrollment.student.last_name}`;

    // Formatear la fecha de inicio
    const startDate = DateTime.fromISO(selectedSession.start_date, { zone: 'America/New_York' })
      .toLocaleString(DateTime.DATE_FULL, { locale: 'en-US' });

    // Generar el HTML del schedule
    const scheduleHtml = buildSeasonScheduleHtml([selectedSession]);

    const emailData = {
      parentName: parentName,
      studentName: studentName,
      teamName: teamName,
      startDate: startDate,
      scheduleHtml: scheduleHtml
    };

    // Generar el HTML del email
    const emailHtml = createSeasonReminderEmailHtml(emailData);

    // Guardar el preview
    fs.writeFileSync('real-1week-september-18-preview.html', emailHtml);

    console.log('\n✅ Preview generado exitosamente!');
    console.log('📧 Datos del preview:');
    console.log(`   - Padre: ${parentName}`);
    console.log(`   - Estudiante: ${studentName}`);
    console.log(`   - Equipo: ${teamName}`);
    console.log(`   - Fecha inicio: ${startDate}`);
    console.log(`   - Total inscripciones activas: ${enrollments.length}`);
    console.log('📁 Archivo: real-1week-september-18-preview.html');

  } catch (error) {
    console.error('❌ Error generando preview:', error);
  }
}

generatePreview();
