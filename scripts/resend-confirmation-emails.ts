/**
 * Script para Reenviar Correos de Confirmación
 * 
 * Este script busca registros pagados en las últimas 48 horas
 * y reenvía los correos de confirmación que no se enviaron
 */

import { createClient } from '@supabase/supabase-js';
import { sendPaymentConfirmationEmail, sendPaymentNotificationToCompany } from '../lib/email-service';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

interface EnrollmentWithDetails {
  enrollmentid: string;
  isactive: boolean;
  created_at: string;
  student: {
    studentid: string;
    firstname: string;
    lastname: string;
    grade: string;
    ecname: string;
    ecphone: string;
    ecrelationship: string;
    parent: {
      firstname: string;
      lastname: string;
      email: string;
    };
  };
  team: {
    teamid: string;
    name: string;
    description: string;
    price: number;
    created_at: string;
    updated_at: string;
    timezone?: string;
    school: {
      name: string;
      location: string;
    };
    session: Array<{
      startdate: string;
      enddate: string;
      starttime: string;
      endtime: string;
      daysofweek: string;
      cancel?: string;
      staff: {
        name: string;
        email: string;
        phone: string;
      };
    }>;
  };
  payment?: Array<{
    paymentid: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

async function resendConfirmationEmails() {
  console.log('📧 === REENVÍO DE CORREOS DE CONFIRMACIÓN ===\n');

  // Verificar credenciales de Gmail
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ ERROR: Variables de Gmail no configuradas');
    console.error('   Configura GMAIL_USER y GMAIL_APP_PASSWORD en .env.local');
    process.exit(1);
  }

  console.log('✅ Credenciales de Gmail configuradas');
  console.log(`   Usuario: ${process.env.GMAIL_USER}\n`);

  // Conectar a Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: Variables de Supabase no configuradas');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Buscando registros pagados en las últimas 48 horas...\n');

  // Calcular fecha hace 48 horas
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    // Buscar enrollments activos (pagados) de las últimas 48 horas
    const { data: enrollments, error } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        isactive,
        created_at,
        student:studentid (
          studentid,
          firstname,
          lastname,
          grade,
          ecname,
          ecphone,
          ecrelationship,
          parent:parentid (
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          description,
          price,
          created_at,
          updated_at,
          timezone,
          school:schoolid (
            name,
            location
          ),
          session (
            startdate,
            enddate,
            starttime,
            endtime,
            daysofweek,
            cancel,
            staff:coachid (
              name,
              email,
              phone
            )
          )
        )
      `)
      .eq('isactive', true)
      .gte('created_at', twoDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`📋 Se encontraron ${enrollments?.length || 0} registros pagados\n`);

    if (!enrollments || enrollments.length === 0) {
      console.log('ℹ️  No hay registros para procesar');
      return;
    }

    // Obtener información de pagos para estos enrollments
    const enrollmentIds = enrollments.map(e => e.enrollmentid);
    const { data: payments } = await supabase
      .from('payment')
      .select('*')
      .in('enrollmentid', enrollmentIds)
      .eq('status', 'paid');

    console.log('🔄 Procesando reenvíos...\n');
    console.log('─'.repeat(70));

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const enrollment of enrollments as unknown as EnrollmentWithDetails[]) {
      console.log(`\n📌 Registro: ${enrollment.enrollmentid}`);
      console.log(`   Estudiante: ${enrollment.student?.firstname} ${enrollment.student?.lastname}`);
      console.log(`   Email padre: ${enrollment.student?.parent?.email}`);
      console.log(`   Equipo: ${enrollment.team?.name}`);
      console.log(`   Fecha registro: ${new Date(enrollment.created_at).toLocaleString('es-ES')}`);

      // Validar que tenga toda la información necesaria
      if (!enrollment.student?.parent?.email) {
        console.log('   ⚠️  OMITIDO: No tiene email del padre');
        skippedCount++;
        continue;
      }

      if (!enrollment.team || !enrollment.student) {
        console.log('   ⚠️  OMITIDO: Información incompleta');
        skippedCount++;
        continue;
      }

      // Buscar el pago correspondiente
      const payment = payments?.find(p => p.enrollmentid === enrollment.enrollmentid);

      if (!payment) {
        console.log('   ⚠️  OMITIDO: No se encontró registro de pago');
        skippedCount++;
        continue;
      }

      // Preparar datos para el email
      const studentData = {
        firstName: enrollment.student.firstname,
        lastName: enrollment.student.lastname,
        grade: enrollment.student.grade,
        emergencyContact: {
          name: enrollment.student.ecname,
          phone: enrollment.student.ecphone,
          relationship: enrollment.student.ecrelationship,
        }
      };

      const teamData = {
        teamid: enrollment.team.teamid,
        name: enrollment.team.name,
        description: enrollment.team.description,
        price: enrollment.team.price,
        created_at: enrollment.team.created_at,
        updated_at: enrollment.team.updated_at,
        timezone: enrollment.team.timezone,
        school: {
          name: enrollment.team.school?.name || 'Unknown School',
          location: enrollment.team.school?.location || 'Unknown Location',
        },
        session: enrollment.team.session || []
      };

      const paymentData = {
        amount: payment.amount,
        date: payment.date,
        sessionId: enrollment.enrollmentid
      };

      const parentData = {
        firstName: enrollment.student.parent.firstname,
        lastName: enrollment.student.parent.lastname,
        email: enrollment.student.parent.email
      };

      try {
        console.log('   📧 Enviando correo al padre...');
        
        // Enviar correo de confirmación al padre
        const parentEmailResult = await sendPaymentConfirmationEmail(
          enrollment.student.parent.email,
          studentData,
          teamData,
          paymentData,
          parentData
        );

        if (parentEmailResult.success) {
          console.log(`   ✅ Email enviado al padre (${parentEmailResult.messageId})`);
        } else {
          console.log(`   ❌ Error al enviar email al padre: ${parentEmailResult.error}`);
          errorCount++;
          continue;
        }

        // Enviar notificación a la empresa
        console.log('   📧 Enviando notificación a la empresa...');
        const companyEmailResult = await sendPaymentNotificationToCompany(
          studentData,
          teamData,
          paymentData,
          parentData
        );

        if (companyEmailResult.success) {
          console.log(`   ✅ Notificación enviada a la empresa (${companyEmailResult.messageId})`);
        } else {
          console.log(`   ⚠️  Error al enviar notificación a la empresa: ${companyEmailResult.error}`);
        }

        successCount++;
        console.log('   🎉 COMPLETADO');

        // Pequeña pausa entre envíos para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        errorCount++;
      }
    }

    // Resumen final
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 RESUMEN DEL REENVÍO:');
    console.log(`   Total de registros: ${enrollments.length}`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Con errores: ${errorCount}`);
    console.log(`   ⚠️  Omitidos: ${skippedCount}`);
    console.log('');

    if (successCount > 0) {
      console.log('🎉 ¡Correos reenviados exitosamente!');
    }

    if (errorCount > 0) {
      console.log('⚠️  Algunos correos no pudieron ser enviados. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  }
}

// Ejecutar script
resendConfirmationEmails()
  .then(() => {
    console.log('\n✅ Script completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

