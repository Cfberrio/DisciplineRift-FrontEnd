/**
 * Script FINAL para enviar correos a padres con pagos incompletos
 * 
 * Este script:
 * 1. Se conecta a Supabase 
 * 2. Obtiene enrollments con isactive = false
 * 3. Agrupa por padre para evitar duplicados
 * 4. Envía correos usando Gmail SMTP
 * 
 * IMPORTANTE: Este script enviará correos REALES
 */

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Configuración (usando las mismas variables que están documentadas)
const SUPABASE_URL = 'https://mlqmgvnzmxmzbwfezqvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scW1ndm56bXhtemJ3ZmV6cXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2NzQyNzUsImV4cCI6MjAzNzI1MDI3NX0.6xOWO-ZNVS7lR5TQD0wJPLOzLSXOBAcE_EcbPUevT8s';

const GMAIL_USER = 'cberrio04@gmail.com';
const GMAIL_APP_PASSWORD = 'wpcg fqsk ewtd afqd';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Crear transporter de Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
};

// Template del correo
const createIncompletePaymentReminderTemplate = (parentFirstName) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Sorry, I can't. They've got something better.</title>
  <style>
    /* Basic reset for email */
    body { margin:0; padding:0; background:#f3f5f9; }
    img { border:0; outline:none; text-decoration:none; display:block; }
    table { border-collapse:collapse; }
    .container { width:600px; }
    .card {
      background:#ffffff;
      border-radius:16px;
      overflow:hidden;
      box-shadow:0 10px 24px rgba(16,24,40,0.08);
    }
    .p-outer { padding:32px; }
    .p-inner { padding:40px; }
    .h1 {
      font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:26px; line-height:34px; color:#0f172a; margin:0 0 12px; font-weight:800;
    }
    .lead {
      font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:16px; line-height:24px; color:#334155; margin:0 0 18px;
    }
    .muted {
      font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:14px; line-height:22px; color:#64748b; margin:0 0 20px;
    }
    .chip {
      display:inline-block; padding:8px 14px; border-radius:999px;
      background:#eef2ff; color:#3730a3; font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:14px; margin:6px 6px 0 0; font-weight:600;
    }
    .divider {
      height:1px; border-top:1px solid #e5e7eb; margin:24px 0;
    }
    .btn a {
      display:inline-block; text-decoration:none; font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:17px; font-weight:700; padding:14px 24px; border-radius:999px;
      background:#0ea5e9; color:#ffffff;
    }
    .footer-p {
      font-family:Segoe UI, Arial, Verdana, sans-serif;
      font-size:12px; color:#64748b; margin:0;
    }

    /* Mobile */
    @media screen and (max-width:600px){
      .container { width:100% !important; }
      .p-outer { padding:20px !important; }
      .p-inner { padding:24px !important; }
      .h1 { font-size:22px !important; line-height:30px !important; }
      .lead { font-size:15px !important; }
      .btn a { font-size:16px !important; }
    }

    /* Optional dark mode hint (limited support) */
    @media (prefers-color-scheme: dark){
      body { background:#0f172a !important; }
      .card { background:#111827 !important; color:#e5e7eb !important; }
      .lead { color:#cbd5e1 !important; }
      .muted, .footer-p { color:#94a3b8 !important; }
      .divider { border-color:#1f2937 !important; }
      .chip { background:#1f2937 !important; color:#c7d2fe !important; }
      .btn a { background:#22d3ee !important; color:#0f172a !important; }
    }
  </style>
</head>
<body>
  <!-- Preheader (hidden in most clients) -->
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">
    7 days left to register for Volleyball • Tennis • Pickleball
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="container card" width="600" style="width:600px;">
          <!-- Header -->
          <tr>
            <td class="p-outer" align="center" style="background:linear-gradient(135deg,#0f172a 0%, #1e293b 65%, #0ea5e9 130%);">
              <div style="font-family:Segoe UI, Arial, Verdana, sans-serif; color:#ffffff; font-size:18px; font-weight:800; letter-spacing:1.2px;">
                DISCIPLINE RIFT
              </div>
              <div style="font-family:Segoe UI, Arial, Verdana, sans-serif; color:#c7e9fb; font-size:13px; margin-top:6px;">
                Fall Sports Registration
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="p-inner" style="text-align:left;">
              <h1 class="h1">Sorry, I can't. They've got something better.</h1>

              <p class="lead">Hi ${parentFirstName},</p>

              <p class="lead">This fall, your child could be doing more than just school.</p>
              <p class="lead">They could be growing, training, and having the time of their life playing sports.</p>

              <p class="lead"><strong>In ONE week, our fall season begins and registrations are closing.</strong></p>

              <!-- Sports chips -->
              <div>
                <span class="chip">Volleyball</span>
                <span class="chip">Tennis</span>
                <span class="chip">Pickleball</span>
              </div>

              <div class="divider"></div>

              <p class="lead"><strong>You've got 7 days.</strong> Let's get your child in the game.</p>

              <p class="muted">We believe school doesn't teach everything. Sports help kids practice empathy, resilience, and how to win and lose in life.</p>
              <p class="muted">We build life skills through the game so kids grow as people, not just players.</p>

              <p class="lead" style="margin-top:18px;"><em>Sorry, I can't. They've got something better.</em></p>
              <p class="lead" style="margin-top:6px;">7 days left to register for <strong>Volleyball • Tennis • Pickleball</strong>.</p>

              <!-- CTA Button (with VML for Outlook) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" class="btn" style="margin-top:16px;">
                <tr>
                  <td align="left">
                    <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://www.disciplinerift.com/#register"
                        style="height:48px;v-text-anchor:middle;width:220px;" arcsize="50%" stroke="f" fillcolor="#0ea5e9">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Segoe UI, Arial, sans-serif;font-size:17px;font-weight:700;">
                          Register Now
                        </center>
                      </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="https://www.disciplinerift.com/#register" target="_blank" rel="noopener">
                      Register Now
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p class="muted" style="margin-top:16px;">
                Or paste this link in your browser: https://www.disciplinerift.com/#register
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="p-outer" style="background:#f8fafc; text-align:center;">
              <p class="footer-p">You're receiving this because you asked about Discipline Rift Fall programs.</p>
              <p class="footer-p" style="margin-top:6px;">&copy; Discipline Rift — All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Función para obtener enrollments incompletos
async function getIncompleteEnrollments() {
  try {
    console.log('🔍 Buscando enrollments con pagos incompletos...');
    
    const { data: incompleteEnrollments, error } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        created_at,
        isactive,
        student:studentid (
          studentid,
          firstname,
          lastname,
          parent:parentid (
            parentid,
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          price,
          school:schoolid (
            name,
            location
          )
        )
      `)
      .eq('isactive', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    // Filtrar enrollments que tienen email del padre
    const validEnrollments = incompleteEnrollments.filter(enrollment => 
      enrollment.student?.parent?.email
    );

    console.log(`📊 Encontrados: ${incompleteEnrollments.length} enrollments incompletos`);
    console.log(`✅ Válidos (con email): ${validEnrollments.length}`);

    return validEnrollments;

  } catch (error) {
    console.error('❌ Error obteniendo enrollments:', error.message);
    throw error;
  }
}

// Función para agrupar por padre
function groupEnrollmentsByParent(enrollments) {
  const parentMap = new Map();

  enrollments.forEach(enrollment => {
    const parentEmail = enrollment.student.parent.email;
    
    if (!parentMap.has(parentEmail)) {
      parentMap.set(parentEmail, {
        parent: enrollment.student.parent,
        enrollments: []
      });
    }
    
    parentMap.get(parentEmail).enrollments.push(enrollment);
  });

  return Array.from(parentMap.values());
}

// Función para enviar correo individual
async function sendEmailToParent(transporter, parentEmail, parentFirstName, enrollments) {
  try {
    const htmlContent = createIncompletePaymentReminderTemplate(parentFirstName);
    
    const mailOptions = {
      from: {
        name: 'Discipline Rift',
        address: GMAIL_USER,
      },
      to: parentEmail,
      subject: "Sorry, I can't. They've got something better.",
      html: htmlContent,
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Función principal para envío masivo
async function sendBulkIncompletePaymentEmails(isTest = true) {
  try {
    console.log('🚀 === INICIANDO CAMPAÑA DE RECORDATORIO DE PAGO ===');
    console.log(`🧪 Modo: ${isTest ? 'PRUEBA (solo a cberrio04@gmail.com)' : 'REAL (a todos los padres)'}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString()}`);
    console.log('');

    // Obtener enrollments incompletos
    const incompleteEnrollments = await getIncompleteEnrollments();
    
    if (incompleteEnrollments.length === 0) {
      console.log('ℹ️ No hay enrollments con pagos incompletos');
      return;
    }

    // Agrupar por padre
    const parentGroups = groupEnrollmentsByParent(incompleteEnrollments);
    console.log(`👥 Total de padres únicos: ${parentGroups.length}`);
    console.log('');

    // Mostrar preview de datos
    console.log('📋 Preview de padres con pagos pendientes:');
    parentGroups.slice(0, 5).forEach((group, index) => {
      console.log(`${index + 1}. ${group.parent.firstname} ${group.parent.lastname} (${group.parent.email})`);
      console.log(`   └── Hijos: ${group.enrollments.length} enrollment(s) pendiente(s)`);
    });
    if (parentGroups.length > 5) {
      console.log(`   ... y ${parentGroups.length - 5} padres más`);
    }
    console.log('');

    // Configurar transporter
    console.log('🔗 Configurando Gmail SMTP...');
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');
    console.log('');

    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    if (isTest) {
      // Modo prueba: enviar solo a cberrio04@gmail.com
      console.log('🧪 Enviando email de prueba...');
      
      const testResult = await sendEmailToParent(
        transporter, 
        'cberrio04@gmail.com', 
        'Carlos', 
        []
      );
      
      if (testResult.success) {
        console.log('✅ Email de prueba enviado exitosamente!');
        console.log(`📬 Message ID: ${testResult.messageId}`);
        emailsSent = 1;
      } else {
        console.error('❌ Error en email de prueba:', testResult.error);
        emailsFailed = 1;
      }
      
    } else {
      // Modo real: enviar a todos los padres
      console.log('📧 Enviando correos a todos los padres...');
      
      for (let i = 0; i < parentGroups.length; i++) {
        const group = parentGroups[i];
        const parentEmail = group.parent.email;
        const parentFirstName = group.parent.firstname;
        
        console.log(`📬 [${i + 1}/${parentGroups.length}] Enviando a ${parentEmail}...`);
        
        const result = await sendEmailToParent(
          transporter,
          parentEmail,
          parentFirstName,
          group.enrollments
        );
        
        if (result.success) {
          console.log(`✅ Enviado exitosamente - ID: ${result.messageId}`);
          emailsSent++;
        } else {
          console.error(`❌ Error: ${result.error}`);
          emailsFailed++;
        }
        
        results.push({
          email: parentEmail,
          success: result.success,
          error: result.error || null,
          messageId: result.messageId || null
        });
        
        // Delay entre correos
        if (i < parentGroups.length - 1) {
          console.log('⏱️  Esperando 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Resumen final
    console.log('');
    console.log('📊 === RESUMEN DE CAMPAÑA ===');
    console.log(`✅ Correos enviados: ${emailsSent}`);
    console.log(`❌ Correos fallidos: ${emailsFailed}`);
    console.log(`📧 Total procesados: ${emailsSent + emailsFailed}`);
    console.log(`🕐 Finalizado: ${new Date().toLocaleString()}`);

    if (!isTest && results.length > 0) {
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.log('');
        console.log('❌ Detalles de fallos:');
        failed.forEach(result => {
          console.log(`   - ${result.email}: ${result.error}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ === ERROR CRÍTICO EN LA CAMPAÑA ===');
    console.error('Error:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 === SCRIPT REAL DE ENVÍO DE CORREOS ===');
  console.log('');
  
  console.log('📋 Configuración:');
  console.log(`   - Supabase URL: ${SUPABASE_URL}`);
  console.log(`   - Gmail User: ${GMAIL_USER}`);
  console.log(`   - Gmail configurado: ✅`);
  console.log('');
  
  console.log('🎯 ATENCIÓN: Este script enviará correos REALES');
  console.log('');
  console.log('Opciones:');
  console.log('1. Ejecutar PRUEBA (recomendado primero)');
  console.log('2. Ejecutar REAL (envío masivo a todos los padres)');
  console.log('');
  
  // Por defecto ejecutamos la prueba
  console.log('Ejecutando PRUEBA primero...');
  await sendBulkIncompletePaymentEmails(true);
  
  console.log('');
  console.log('💡 PRÓXIMOS PASOS:');
  console.log('1. Revisa tu email para confirmar que se ve bien');
  console.log('2. Si está correcto, ejecuta: node send-real-incomplete-payment-emails.js --real');
  console.log('3. Para ejecutar el envío masivo real');
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
const isRealMode = args.includes('--real') || args.includes('--production');

// Ejecutar
if (require.main === module) {
  if (isRealMode) {
    console.log('⚠️  MODO REAL ACTIVADO - ENVIANDO A TODOS LOS PADRES');
    sendBulkIncompletePaymentEmails(false).catch(error => {
      console.error('❌ Error crítico:', error);
      process.exit(1);
    });
  } else {
    main().catch(error => {
      console.error('❌ Error crítico:', error);
      process.exit(1);
    });
  }
}

module.exports = {
  sendBulkIncompletePaymentEmails,
  getIncompleteEnrollments,
  groupEnrollmentsByParent
};
