// Cargar variables de entorno si no están disponibles (para scripts CLI)
if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  } catch (error) {
    // dotenv no disponible, continuar sin él
  }
}

import { DateTime } from 'luxon';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { registerReminderAttempt, updateReminderAttemptStatus } from '../lib/retry-scheduler';

// Interfaces para tipado
interface SessionData {
  sessionid: string;
  teamid: string;
  startdate: string;
  enddate: string | null;
  starttime: string;
  endtime: string;
  daysofweek: string;
}

interface EnrollmentData {
  enrollmentid: string;
  studentid: string;
}

interface StudentData {
  studentid: string;
  parentid: string;
  firstname: string;
  lastname: string;
}

interface ParentData {
  parentid: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface TeamData {
  teamid: string;
  teamname?: string;
  name?: string;
}

interface EmailData {
  parentName: string;
  teamName: string;
  startDate: string;
  scheduleHtml: string;
}

// Configuración
const TIMEZONE = 'America/New_York';

// Cliente de Supabase usando la clave anónima (RLS habilitado)
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Transportador de email reutilizando la configuración existente
const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Función robusta para parsear días de la semana
 * Acepta múltiples formatos: "Mon,Tue,Wed", "m, tue, wednesday", etc.
 */
function parseDaysOfWeek(daysOfWeek: string): number[] {
  if (!daysOfWeek || typeof daysOfWeek !== 'string') {
    return [];
  }

  const dayMapping: { [key: string]: number } = {
    // Nombres completos en inglés
    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
    'friday': 5, 'saturday': 6, 'sunday': 7,
    
    // Abreviaciones de 3 letras
    'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4,
    'fri': 5, 'sat': 6, 'sun': 7,
    
    // Abreviaciones de 1 letra
    'm': 1, 't': 2, 'w': 3, 'r': 4, 'f': 5, 's': 6, 'u': 7,
    
    // Nombres en español (por si acaso)
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4,
    'viernes': 5, 'sábado': 6, 'domingo': 7
  };

  // Limpiar y dividir por múltiples separadores
  const cleanDays = daysOfWeek
    .toLowerCase()
    .split(/[,;|\s\/]+/)
    .map(day => day.trim())
    .filter(day => day.length > 0);

  const weekdays = new Set<number>();
  
  for (const day of cleanDays) {
    const weekday = dayMapping[day];
    if (weekday) {
      weekdays.add(weekday);
    }
  }

  return Array.from(weekdays).sort();
}

/**
 * Construye el HTML del horario de temporada con todas las ocurrencias
 */
function buildSeasonScheduleHtml(
  session: SessionData,
  timezone: string = TIMEZONE
): string {
  try {
    const startDate = DateTime.fromISO(session.startdate, { zone: timezone });
    const endDate = session.enddate 
      ? DateTime.fromISO(session.enddate, { zone: timezone })
      : startDate; // Si no hay enddate, solo incluir el día de inicio

    const weekdays = parseDaysOfWeek(session.daysofweek);
    
    // Si no hay días específicos, incluir el día de inicio
    if (weekdays.length === 0) {
      const startDateTime = startDate.set({
        hour: parseInt(session.starttime.split(':')[0]),
        minute: parseInt(session.starttime.split(':')[1] || '0')
      });
      
      const endDateTime = startDate.set({
        hour: parseInt(session.endtime.split(':')[0]),
        minute: parseInt(session.endtime.split(':')[1] || '0')
      });

      const formattedDate = startDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
      const formattedTime = `${startDateTime.toLocaleString(DateTime.TIME_SIMPLE)} – ${endDateTime.toLocaleString(DateTime.TIME_SIMPLE)}`;
      
      return `<li>${formattedDate.split(', ')[0]}, ${formattedDate.split(', ')[1]}, ${formattedTime}</li>`;
    }

    const scheduleItems: string[] = [];
    let currentDate = startDate;

    // Iterar día por día desde startDate hasta endDate
    while (currentDate <= endDate && scheduleItems.length < 100) { // Límite de seguridad
      const currentWeekday = currentDate.weekday;
      
      if (weekdays.includes(currentWeekday)) {
        // Crear DateTime con las horas específicas
        const startDateTime = currentDate.set({
          hour: parseInt(session.starttime.split(':')[0]),
          minute: parseInt(session.starttime.split(':')[1] || '0')
        });
        
        const endDateTime = currentDate.set({
          hour: parseInt(session.endtime.split(':')[0]),
          minute: parseInt(session.endtime.split(':')[1] || '0')
        });

        // Formatear como "Tuesday, Jan 21, 6:00 PM – 7:00 PM"
        const formattedDate = startDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
        const timeRange = `${startDateTime.toLocaleString(DateTime.TIME_SIMPLE)} – ${endDateTime.toLocaleString(DateTime.TIME_SIMPLE)}`;
        
        scheduleItems.push(`<li>${formattedDate.split(' at ')[0]}, ${timeRange}</li>`);
      }
      
      currentDate = currentDate.plus({ days: 1 });
    }

    return scheduleItems.length > 0 ? scheduleItems.join('\n       ') : '<li>Horario por confirmar</li>';
  } catch (error) {
    console.error('Error building season schedule HTML:', error);
    return '<li>Horario por confirmar</li>';
  }
}

/**
 * Genera el HTML del email de recordatorio de temporada
 */
function createSeasonReminderEmailHtml(emailData: EmailData): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Season Reminder</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f9fc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
                  Hi <strong>${emailData.parentName}</strong>,
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
                  This is your reminder that our <strong>Discipline Rift</strong> season for <strong>${emailData.teamName}</strong> begins in one month on
                  <strong>${emailData.startDate}</strong>!
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
                  Get ready for another great season of skill development, growth, and fun.
                </p>
                <h3 style="margin:24px 0 8px 0;font-size:18px;line-height:26px;color:#111827;">Season Schedule</h3>
                <ul style="margin:0 0 16px 20px;padding:0;font-size:16px;line-height:24px;color:#111827;">
                  ${emailData.scheduleHtml}
                </ul>
                <p style="margin:0 0 4px 0;font-size:16px;line-height:24px;">Can't wait!</p>
                <p style="margin:0;font-size:16px;line-height:24px;"><strong>Discipline Rift Team</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Función principal para ejecutar el job de recordatorios de temporada
 */
export async function runSeasonReminders(opts?: { now?: Date }): Promise<void> {
  console.log('🚀 === INICIANDO JOB DE RECORDATORIOS DE TEMPORADA ===');
  
  try {
    // Calcular fecha objetivo (hoy + 30 días en zona horaria de Nueva York)
    const nowNY = opts?.now 
      ? DateTime.fromJSDate(opts.now).setZone(TIMEZONE)
      : DateTime.now().setZone(TIMEZONE);
    
    const targetDateNY = nowNY.plus({ days: 30 }).toISODate();
    
    console.log(`📅 Fecha actual (NY): ${nowNY.toISODate()}`);
    console.log(`🎯 Buscando sesiones que inician en: ${targetDateNY}`);

    const supabase = createSupabaseClient();
    const transporter = createEmailTransporter();

    // 1. Buscar sesiones que inician exactamente en 30 días
    console.log('🔍 Consultando sesiones...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select('sessionid, teamid, startdate, enddate, starttime, endtime, daysofweek')
      .eq('startdate', targetDateNY)
      .limit(1000);

    if (sessionsError) {
      throw new Error(`Error consultando sesiones: ${sessionsError.message}`);
    }

    console.log(`📊 Encontradas ${sessions?.length || 0} sesiones`);

    if (!sessions || sessions.length === 0) {
      console.log('✅ No hay sesiones para recordar hoy');
      return;
    }

    const emailsSent = new Set<string>(); // Para deduplicar emails por (parentid|sessionid)
    let totalEmailsSent = 0;
    let totalErrors = 0;

    // Procesar cada sesión
    for (const session of sessions) {
      console.log(`\n🏐 Procesando sesión ${session.sessionid} del equipo ${session.teamid}`);

      try {
        // 2. Buscar inscripciones activas para este equipo
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollment')
          .select('enrollmentid, studentid')
          .eq('teamid', session.teamid)
          .eq('isactive', true)
          .limit(10000);

        if (enrollmentsError) {
          console.error(`❌ Error consultando inscripciones: ${enrollmentsError.message}`);
          totalErrors++;
          continue;
        }

        if (!enrollments || enrollments.length === 0) {
          console.log(`ℹ️ No hay inscripciones activas para el equipo ${session.teamid}`);
          continue;
        }

        console.log(`👥 Encontradas ${enrollments.length} inscripciones activas`);

        // 3. Buscar estudiantes
        const studentIds = enrollments.map(e => e.studentid);
        const { data: students, error: studentsError } = await supabase
          .from('student')
          .select('studentid, parentid, firstname, lastname')
          .in('studentid', studentIds);

        if (studentsError) {
          console.error(`❌ Error consultando estudiantes: ${studentsError.message}`);
          totalErrors++;
          continue;
        }

        if (!students || students.length === 0) {
          console.log(`ℹ️ No se encontraron estudiantes`);
          continue;
        }

        // 4. Buscar padres
        const parentIds = [...new Set(students.map(s => s.parentid))];
        const { data: parents, error: parentsError } = await supabase
          .from('parent')
          .select('parentid, firstname, lastname, email')
          .in('parentid', parentIds);

        if (parentsError) {
          console.error(`❌ Error consultando padres: ${parentsError.message}`);
          totalErrors++;
          continue;
        }

        if (!parents || parents.length === 0) {
          console.log(`ℹ️ No se encontraron padres`);
          continue;
        }

        // 5. Buscar nombre del equipo (opcional)
        let teamName = `Team ${session.teamid}`;
        try {
          const { data: teamData } = await supabase
            .from('team')
            .select('teamname, name')
            .eq('teamid', session.teamid)
            .single();
          
          if (teamData) {
            teamName = teamData.teamname || teamData.name || teamName;
          }
        } catch (error) {
          console.log(`ℹ️ No se pudo obtener el nombre del equipo, usando fallback: ${teamName}`);
        }

        // 6. Construir el horario de temporada
        const scheduleHtml = buildSeasonScheduleHtml(session);

        // 7. Enviar emails (deduplicando por parent + session)
        for (const parent of parents) {
          if (!parent.email) {
            console.log(`⚠️ Padre ${parent.parentid} sin email, saltando`);
            continue;
          }

          const emailKey = `${parent.parentid}|${session.sessionid}`;
          if (emailsSent.has(emailKey)) {
            console.log(`🔄 Email ya enviado a padre ${parent.parentid} para sesión ${session.sessionid}`);
            continue;
          }

          // Registrar intento antes de enviar
          const scheduledTime = nowNY.toJSDate();
          await registerReminderAttempt(
            session.sessionid,
            parent.parentid,
            'season_reminder',
            scheduledTime,
            'pending'
          );

          try {
            const startDate = DateTime.fromISO(session.startdate, { zone: TIMEZONE })
              .toLocaleString(DateTime.DATE_FULL);

            const emailData: EmailData = {
              parentName: parent.firstname,
              teamName,
              startDate,
              scheduleHtml
            };

            const htmlContent = createSeasonReminderEmailHtml(emailData);
            const textContent = htmlContent
              .replace(/<[^>]*>/g, '') // Remover tags HTML
              .replace(/{{scheduleHtml}}/g, scheduleHtml.replace(/<li>/g, '- ').replace(/<\/li>/g, '\n'));

            const mailOptions = {
              from: {
                name: 'Discipline Rift',
                address: process.env.GMAIL_USER!,
              },
              to: parent.email,
              subject: `${teamName} Season Starts in One Month! Discipline Rift`,
              html: htmlContent,
              text: textContent
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado a ${parent.email} (${result.messageId})`);
            
            // Marcar intento como exitoso
            await updateReminderAttemptStatus(
              session.sessionid,
              parent.parentid,
              'season_reminder',
              'sent',
              undefined,
              result.messageId
            );
            
            emailsSent.add(emailKey);
            totalEmailsSent++;

          } catch (emailError) {
            console.error(`❌ Error enviando email a ${parent.email}:`, emailError);
            
            // Marcar intento como fallido
            await updateReminderAttemptStatus(
              session.sessionid,
              parent.parentid,
              'season_reminder',
              'failed',
              emailError instanceof Error ? emailError.message : 'Unknown email error'
            );
            
            totalErrors++;
          }
        }

      } catch (sessionError) {
        console.error(`❌ Error procesando sesión ${session.sessionid}:`, sessionError);
        totalErrors++;
      }
    }

    // Resumen final
    console.log('\n📊 === RESUMEN DEL JOB ===');
    console.log(`🎯 Sesiones procesadas: ${sessions.length}`);
    console.log(`📧 Emails enviados: ${totalEmailsSent}`);
    console.log(`❌ Errores: ${totalErrors}`);
    console.log('✅ Job completado exitosamente');

  } catch (error) {
    console.error('💥 Error fatal en el job de recordatorios de temporada:', error);
    throw error;
  }
}

// Función para verificar la configuración antes de ejecutar
export async function checkSeasonRemindersConfig(): Promise<boolean> {
  try {
    // Verificar Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configuración de Supabase faltante');
      console.error('  Requeridas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return false;
    }

    // Verificar Gmail
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Configuración de Gmail faltante');
      console.error('  Requeridas: GMAIL_USER, GMAIL_APP_PASSWORD');
      return false;
    }

    console.log('✅ Configuración validada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return false;
  }
}
