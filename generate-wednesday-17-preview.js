const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function createSeasonReminderEmailHtml(emailData) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tomorrow's the Big Day! ${emailData.teamName} Season Begins</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background-color:#f8fafc;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
        <!-- Header with gradient background -->
        <div style="background:linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:#ffffff;font-size:28px;font-weight:bold;margin:0;text-shadow:0 2px 4px rgba(0,0,0,0.2);">
                Tomorrow's the Big Day! ${emailData.teamName} Season Begins
            </h1>
            <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;">
                Day Before Reminder
            </p>
        </div>

        <!-- Main content -->
        <div style="padding:32px;">
            <!-- Greeting -->
            <div style="text-align:center;margin-bottom:32px;">
                <div style="background:linear-gradient(135deg, #dc2626 0%, #ef4444 100%);color:#ffffff;padding:16px 24px;border-radius:50px;display:inline-block;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                    🎉 Tomorrow's the Big Day!
                </div>
            </div>

            <!-- Personal greeting -->
            <h2 style="margin:0 0 16px 0;font-size:24px;font-weight:bold;color:#1e293b;">
                Hi ${emailData.parentName}!
            </h2>

            <!-- Main message -->
            <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#475569;">
                The wait is almost over — tomorrow we kick off the Discipline Rift season for <strong style="color:#1e40af;">${emailData.teamName}</strong>!
            </p>
            
            <p style="margin:0;font-size:16px;line-height:26px;color:#475569;">
                We can't wait to see the players in action.
            </p>

            <!-- Season Schedule Section -->
            <div style="background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #3b82f6;">
                <h3 style="margin:0 0 16px 0;font-size:20px;font-weight:bold;color:#1e293b;">
                    📅 Season Schedule
                </h3>
                <div style="background:#ffffff;border-radius:8px;padding:16px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    ${emailData.practiceOccurrences.map(occurrence => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                            <span style="font-weight:500;color:#374151;">${occurrence.formattedDate}</span>
                            <span style="color:#6b7280;font-size:14px;">${emailData.timeRange}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Student info -->
            <div style="background:#fef3c7;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #f59e0b;">
                <p style="margin:0;font-size:14px;color:#92400e;">
                    <strong>Student:</strong> ${emailData.studentName}
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
            <h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;">See you tomorrow!</h4>
            <p style="margin:0;font-size:16px;opacity:0.9;">
                Discipline Rift Team
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

async function generatePreview() {
  try {
    console.log('🚀 === GENERANDO PREVIEW PARA WEDNESDAY 17 SEPTEMBER 2025 ===');
    
    // Simular fecha del 16 de septiembre (un día antes)
    const nowNY = DateTime.fromObject({ 
      year: 2025, 
      month: 9, 
      day: 16, 
      hour: 10 
    }, { zone: 'America/New_York' });
    
    const targetDateNY = nowNY.plus({ days: 1 }).toISODate(); // 2025-09-17
    console.log(`📅 Fecha simulada actual (NY): ${nowNY.toISODate()}`);
    console.log(`🎯 Buscando sesiones que inician en: ${targetDateNY}`);

    // 1. Buscar sesiones con equipos activos
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
        team!inner(teamid, isactive, name)
      `)
      .eq('startdate', targetDateNY)
      .eq('team.isactive', true)
      .limit(1000);

    if (sessionsError) {
      throw new Error(`Error consultando sesiones: ${sessionsError.message}`);
    }

    console.log(`📊 Encontradas ${sessions?.length || 0} sesiones con equipos activos`);

    if (!sessions || sessions.length === 0) {
      console.log('❌ No hay sesiones para Wednesday 17 September 2025');
      return;
    }

    // Tomar la primera sesión para el preview
    const session = sessions[0];
    console.log(`🏐 Usando sesión: ${session.sessionid} del equipo: ${session.team.name}`);

    // 2. Buscar inscripciones activas para esta sesión
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        studentid,
        isactive,
        student!inner(studentid, parentid, firstname, lastname),
        parent!inner(parentid, firstname, lastname, email)
      `)
      .eq('sessionid', session.sessionid)
      .eq('isactive', true)
      .limit(1000);

    if (enrollmentsError) {
      throw new Error(`Error consultando inscripciones: ${enrollmentsError.message}`);
    }

    console.log(`👥 Encontradas ${enrollments?.length || 0} inscripciones activas`);

    if (!enrollments || enrollments.length === 0) {
      console.log('❌ No hay inscripciones activas para esta sesión');
      return;
    }

    // Tomar la primera inscripción para el preview
    const enrollment = enrollments[0];
    
    // 3. Generar horarios de práctica
    const startDate = DateTime.fromISO(session.startdate, { zone: 'America/New_York' });
    const endDate = DateTime.fromISO(session.enddate, { zone: 'America/New_York' });
    
    const practiceOccurrences = [];
    let currentDate = startDate;
    const daysOfWeek = session.daysofweek.split(',').map(d => parseInt(d.trim()));
    
    while (currentDate <= endDate && practiceOccurrences.length < 10) {
      if (daysOfWeek.includes(currentDate.weekday)) {
        practiceOccurrences.push({
          formattedDate: currentDate.toLocaleString({ 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }, { locale: 'en-US' })
        });
      }
      currentDate = currentDate.plus({ days: 1 });
    }

    // 4. Generar datos del email
    const emailData = {
      parentName: `${enrollment.parent.firstname} ${enrollment.parent.lastname}`,
      teamName: session.team.name,
      studentName: `${enrollment.student.firstname} ${enrollment.student.lastname}`,
      startDate: startDate.toLocaleString({ 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }, { locale: 'en-US' }),
      timeRange: `${session.starttime} - ${session.endtime}`,
      practiceOccurrences: practiceOccurrences
    };

    console.log('📧 Datos del email:');
    console.log(`   - Padre: ${emailData.parentName}`);
    console.log(`   - Email: ${enrollment.parent.email}`);
    console.log(`   - Equipo: ${emailData.teamName}`);
    console.log(`   - Estudiante: ${emailData.studentName}`);
    console.log(`   - Fecha inicio: ${emailData.startDate}`);
    console.log(`   - Horario: ${emailData.timeRange}`);

    // 5. Generar HTML del preview
    const emailHtml = createSeasonReminderEmailHtml(emailData);
    
    // 6. Guardar el preview
    const fs = require('fs');
    const previewFileName = 'wednesday-17-september-preview.html';
    fs.writeFileSync(previewFileName, emailHtml);
    
    console.log('✅ Preview generado exitosamente');
    console.log(`📁 Archivo guardado como: ${previewFileName}`);
    console.log(`📧 Subject: Tomorrow's the Big Day! ${emailData.teamName} Season Begins`);
    console.log(`📧 Para: ${emailData.parentName} (${enrollment.parent.email})`);

  } catch (error) {
    console.error('❌ Error generando preview:', error.message);
  }
}

// Ejecutar
generatePreview();
