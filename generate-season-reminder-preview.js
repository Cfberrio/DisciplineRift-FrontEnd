#!/usr/bin/env node

// Script para generar un preview del correo de recordatorio de temporada
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulamos la fecha de búsqueda: hoy + 30 días = 16 de septiembre (Tuesday)
const today = new Date('2025-08-17'); // Simular fecha actual
const targetDate = new Date(today);
targetDate.setDate(targetDate.getDate() + 30);
const targetDateString = targetDate.toISOString().split('T')[0]; // 2025-09-16

console.log(`🗓️ Fecha simulada actual: ${today.toISOString().split('T')[0]}`);
console.log(`🎯 Buscando sesiones que inician el: ${targetDateString}`);

// Template del email en inglés
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

// Función simplificada para generar horario en inglés
function generateEnglishSchedule() {
  const startDate = new Date('2025-09-16'); // Tuesday, September 16
  const schedule = [];
  
  // Generar 6 sesiones de ejemplo: Martes y Jueves
  for (let i = 0; i < 6; i++) {
    const sessionDate = new Date(startDate);
    
    if (i % 2 === 0) {
      // Martes
      sessionDate.setDate(startDate.getDate() + (i * 3.5));
    } else {
      // Jueves
      sessionDate.setDate(startDate.getDate() + 2 + ((i - 1) * 3.5));
    }
    
    const dateStr = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
    
    schedule.push(`<li>${dateStr}, 6:00 PM – 8:00 PM</li>`);
  }
  
  return schedule.join('\n       ');
}

async function getSessionStartingOnDate() {
  try {
    console.log('🔍 Buscando sesiones que empiezan el Tuesday, September 16...');
    
    const { data: sessions, error } = await supabase
      .from('session')
      .select(`
        sessionid, teamid, startdate, enddate, starttime, endtime, daysofweek,
        team!inner (
          name,
          school (
            name
          )
        )
      `)
      .eq('startdate', targetDateString)
      .limit(1);

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      return null;
    }

    if (!sessions || sessions.length === 0) {
      console.log('ℹ️ No se encontraron sesiones para esa fecha, usando datos de ejemplo');
      return {
        team: { 
          name: 'Volleyball High School Girls Team',
          school: { name: 'Lincoln High School' }
        },
        startdate: targetDateString,
        starttime: '18:00',
        endtime: '20:00',
        daysofweek: 'Tuesday,Thursday'
      };
    }

    console.log('✅ Sesión encontrada:', sessions[0].team?.name);
    return sessions[0];
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Generando preview del correo de recordatorio de temporada...');
  
  const sessionData = await getSessionStartingOnDate();
  
  if (!sessionData) {
    console.log('❌ No se pudo obtener datos de sesión');
    return;
  }
  
  // Datos del email
  const emailData = {
    parentName: 'Maria Gonzalez',
    teamName: sessionData.team?.name || 'Volleyball Team',
    startDate: new Date(sessionData.startdate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York'
    }),
    scheduleHtml: generateEnglishSchedule()
  };
  
  const htmlContent = createSeasonReminderEmailHtml(emailData);
  
  // Guardar el HTML
  fs.writeFileSync('season-reminder-preview.html', htmlContent);
  console.log('✅ Preview generado: season-reminder-preview.html');
  
  // Mostrar resumen
  console.log('\n📊 Datos del preview:');
  console.log(`Equipo: ${emailData.teamName}`);
  console.log(`Fecha de inicio: ${emailData.startDate}`);
  console.log(`Padre: ${emailData.parentName}`);
}

main().catch(console.error);



