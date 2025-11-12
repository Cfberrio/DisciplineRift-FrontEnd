/**
 * Script de Diagnóstico del Sistema de Correos
 * Verifica la configuración y conexión del sistema de emails
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

interface DiagnosticReport {
  timestamp: string;
  environment: {
    nodeEnv: string;
    hasGmailUser: boolean;
    hasGmailPassword: boolean;
    gmailUser: string | undefined;
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
  };
  gmailConnection: {
    status: 'success' | 'error';
    message: string;
    error?: string;
  };
  testEmail: {
    status: 'success' | 'error' | 'skipped';
    message: string;
    messageId?: string;
    error?: string;
  };
  recentEnrollments: {
    status: 'success' | 'error';
    count: number;
    unpaidCount: number;
    data?: any[];
    error?: string;
  };
}

async function diagnoseEmailSystem(): Promise<DiagnosticReport> {
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
      gmailUser: process.env.GMAIL_USER,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    gmailConnection: {
      status: 'error',
      message: 'Not tested',
    },
    testEmail: {
      status: 'skipped',
      message: 'Not tested',
    },
    recentEnrollments: {
      status: 'error',
      count: 0,
      unpaidCount: 0,
    },
  };

  console.log('🔍 === INICIANDO DIAGNÓSTICO DEL SISTEMA DE CORREOS ===\n');

  // 1. Verificar Variables de Entorno
  console.log('📋 1. VERIFICANDO VARIABLES DE ENTORNO:');
  console.log('   - NODE_ENV:', report.environment.nodeEnv);
  console.log('   - GMAIL_USER:', report.environment.hasGmailUser ? `✅ ${report.environment.gmailUser}` : '❌ NO CONFIGURADO');
  console.log('   - GMAIL_APP_PASSWORD:', report.environment.hasGmailPassword ? '✅ Configurado' : '❌ NO CONFIGURADO');
  console.log('   - SUPABASE_URL:', report.environment.hasSupabaseUrl ? '✅ Configurado' : '❌ NO CONFIGURADO');
  console.log('   - SUPABASE_KEY:', report.environment.hasSupabaseKey ? '✅ Configurado' : '❌ NO CONFIGURADO');
  console.log('');

  if (!report.environment.hasGmailUser || !report.environment.hasGmailPassword) {
    console.log('❌ PROBLEMA CRÍTICO: Variables de Gmail no configuradas');
    console.log('   Solución: Configura GMAIL_USER y GMAIL_APP_PASSWORD en tu archivo .env.local o Vercel\n');
    report.gmailConnection.status = 'error';
    report.gmailConnection.message = 'Variables de Gmail no configuradas';
    return report;
  }

  // 2. Verificar Conexión con Gmail
  console.log('📧 2. VERIFICANDO CONEXIÓN CON GMAIL:');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify();
    report.gmailConnection.status = 'success';
    report.gmailConnection.message = 'Conexión exitosa con Gmail SMTP';
    console.log('   ✅ Conexión exitosa con Gmail SMTP');
  } catch (error) {
    report.gmailConnection.status = 'error';
    report.gmailConnection.error = error instanceof Error ? error.message : 'Error desconocido';
    report.gmailConnection.message = 'Fallo en la conexión con Gmail';
    console.log('   ❌ Error de conexión:', report.gmailConnection.error);
    console.log('');
    console.log('   🔧 POSIBLES SOLUCIONES:');
    console.log('   1. Verifica que la contraseña de aplicación sea correcta');
    console.log('   2. Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords');
    console.log('   3. Asegúrate de que la autenticación de 2 factores esté habilitada en tu cuenta de Gmail');
    console.log('   4. Revisa que no haya espacios extra en las variables de entorno\n');
  }
  console.log('');

  // 3. Enviar Email de Prueba (opcional)
  if (report.gmailConnection.status === 'success') {
    console.log('📨 3. ENVIANDO EMAIL DE PRUEBA:');
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const testEmail = {
        from: {
          name: 'Discipline Rift - Sistema de Diagnóstico',
          address: process.env.GMAIL_USER!,
        },
        to: 'disciplinerift@gmail.com', // Email de la empresa
        subject: '🔧 Test de Sistema de Correos - ' + new Date().toISOString(),
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #2563eb; margin-top: 0;">✅ Sistema de Correos Funcionando</h2>
                <p style="color: #374151; line-height: 1.6;">
                  Este es un correo de prueba para verificar que el sistema de emails está funcionando correctamente.
                </p>
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                  <p style="margin: 0; color: #1e40af;">
                    <strong>Timestamp:</strong> ${new Date().toLocaleString('es-ES')}
                  </p>
                  <p style="margin: 10px 0 0 0; color: #1e40af;">
                    <strong>Servidor:</strong> ${report.environment.nodeEnv}
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                  Si recibes este correo, significa que la configuración SMTP está correcta y los correos se están enviando exitosamente.
                </p>
              </div>
            </body>
          </html>
        `,
      };

      const result = await transporter.sendMail(testEmail);
      report.testEmail.status = 'success';
      report.testEmail.message = 'Email de prueba enviado exitosamente';
      report.testEmail.messageId = result.messageId;
      console.log('   ✅ Email de prueba enviado exitosamente');
      console.log('   📬 Message ID:', result.messageId);
      console.log('   📧 Enviado a: disciplinerift@gmail.com');
    } catch (error) {
      report.testEmail.status = 'error';
      report.testEmail.error = error instanceof Error ? error.message : 'Error desconocido';
      report.testEmail.message = 'Fallo al enviar email de prueba';
      console.log('   ❌ Error al enviar email de prueba:', report.testEmail.error);
    }
    console.log('');
  }

  // 4. Verificar Registros Recientes
  if (report.environment.hasSupabaseUrl && report.environment.hasSupabaseKey) {
    console.log('💾 4. VERIFICANDO REGISTROS RECIENTES:');
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Obtener enrollments recientes (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recentEnrollments, error } = await supabase
        .from('enrollment')
        .select(`
          enrollmentid,
          isactive,
          created_at,
          student:studentid (
            firstname,
            lastname,
            parent:parentid (
              email
            )
          ),
          team:teamid (
            name
          )
        `)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const unpaidEnrollments = recentEnrollments?.filter(e => !e.isactive) || [];
      
      report.recentEnrollments.status = 'success';
      report.recentEnrollments.count = recentEnrollments?.length || 0;
      report.recentEnrollments.unpaidCount = unpaidEnrollments.length;
      report.recentEnrollments.data = recentEnrollments;

      console.log(`   ℹ️  Registros en las últimas 24h: ${report.recentEnrollments.count}`);
      console.log(`   ⚠️  Registros sin pagar: ${report.recentEnrollments.unpaidCount}`);
      
      if (unpaidEnrollments.length > 0) {
        console.log('\n   📋 REGISTROS PENDIENTES DE PAGO:');
        unpaidEnrollments.forEach((enrollment: any, index: number) => {
          console.log(`   ${index + 1}. ${enrollment.student?.firstname} ${enrollment.student?.lastname}`);
          console.log(`      - Email: ${enrollment.student?.parent?.email}`);
          console.log(`      - Equipo: ${enrollment.team?.name}`);
          console.log(`      - ID: ${enrollment.enrollmentid}`);
        });
      }
    } catch (error) {
      report.recentEnrollments.status = 'error';
      report.recentEnrollments.error = error instanceof Error ? error.message : 'Error desconocido';
      console.log('   ❌ Error al consultar registros:', report.recentEnrollments.error);
    }
    console.log('');
  }

  // Resumen Final
  console.log('📊 === RESUMEN DEL DIAGNÓSTICO ===\n');
  console.log('Variables de Entorno:', report.environment.hasGmailUser && report.environment.hasGmailPassword ? '✅' : '❌');
  console.log('Conexión Gmail:', report.gmailConnection.status === 'success' ? '✅' : '❌');
  console.log('Email de Prueba:', report.testEmail.status === 'success' ? '✅' : report.testEmail.status === 'error' ? '❌' : '⏭️');
  console.log('');

  if (report.gmailConnection.status === 'success' && report.testEmail.status === 'success') {
    console.log('🎉 ¡TODO FUNCIONA CORRECTAMENTE!');
    console.log('   El sistema de correos está operativo.');
  } else {
    console.log('⚠️  SE DETECTARON PROBLEMAS');
    console.log('   Revisa los errores anteriores y aplica las soluciones sugeridas.');
  }
  console.log('');

  return report;
}

// Ejecutar diagnóstico
diagnoseEmailSystem()
  .then(() => {
    console.log('✅ Diagnóstico completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal en diagnóstico:', error);
    process.exit(1);
  });

