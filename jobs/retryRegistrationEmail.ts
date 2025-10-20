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

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Interfaces
interface Newsletter {
  email: string;
}

interface Parent {
  parentid: string;
  firstname: string;
  email: string;
}

interface Enrollment {
  enrollmentid: string;
  studentid: string;
}

interface Student {
  studentid: string;
  parentid: string;
}

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de nodemailer
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

// Archivo para guardar emails enviados
const SENT_EMAILS_FILE = path.join(process.cwd(), 'sent-registration-emails.json');

/**
 * Cargar emails ya enviados del archivo
 */
function loadSentEmails(): Set<string> {
  try {
    if (fs.existsSync(SENT_EMAILS_FILE)) {
      const data = fs.readFileSync(SENT_EMAILS_FILE, 'utf-8');
      const emails = JSON.parse(data);
      console.log(`📂 Loaded ${emails.length} previously sent emails from file\n`);
      return new Set(emails);
    }
  } catch (error) {
    console.error('⚠️  Error loading sent emails file:', error);
  }
  return new Set();
}

/**
 * Guardar emails enviados al archivo
 */
function saveSentEmails(emails: Set<string>): void {
  try {
    const emailsArray = Array.from(emails);
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(emailsArray, null, 2));
    console.log(`\n💾 Saved ${emailsArray.length} sent emails to file`);
  } catch (error) {
    console.error('⚠️  Error saving sent emails file:', error);
  }
}

/**
 * Función para crear el HTML del correo de registro
 */
function createRegistrationEmailHtml(parentName: string): string {
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Discipline Rift — Registration (Light, Fixed)</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
    body { margin:0; padding:0; width:100% !important; height:100% !important; background:#f5f7fb; }
    .wrap { width:100%; background:#f5f7fb; }
    .container { width:100%; max-width:600px; margin:0 auto; }
    .card { background:#ffffff; border-radius:16px; box-shadow:0 2px 8px rgba(16,24,40,0.06); border:1px solid #eef2f7; }
    .px { padding-left:24px; padding-right:24px; }
    .py { padding-top:24px; padding-bottom:24px; }
    .center { text-align:center; }
    .h1 { font-family: Arial, Helvetica, sans-serif; font-size:28px; line-height:1.25; color:#0f172a; font-weight:800; margin:0 0 12px 0; }
    .lead { font-family: Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#334155; margin:0 0 16px 0; }
    .body { font-family: Arial, Helvetica, sans-serif; font-size:15px; line-height:1.7; color:#475569; margin:0 0 16px 0; }
    .kicker { font-family: Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:1.1px; text-transform:uppercase; color:#2563eb; margin:0 0 8px 0; }
    .rule { border:0; height:1px; background:linear-gradient(90deg, #e5e7eb, #e2e8f0, #e5e7eb); margin:20px 0; }
    .tag { display:inline-block; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#0f172a; background:#e0f2fe; border:1px solid #bae6fd; border-radius:999px; padding:6px 12px; font-weight:700; }
    .btn-wrap { padding: 4px; border-radius:999px; background: linear-gradient(90deg,#93c5fd,#a7f3d0,#93c5fd); }
    .btn { display:block; text-decoration:none; font-family: Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#0f172a; background:#ffffff; border-radius:999px; padding:14px 24px; text-align:center; border:1px solid #e2e8f0; }
    .foot { font-family: Arial, Helvetica, sans-serif; font-size:12px; line-height:1.6; color:#64748b; }
    @media screen and (max-width:600px){
      .px { padding-left:18px !important; padding-right:18px !important; }
      .py { padding-top:18px !important; padding-bottom:18px !important; }
      .h1 { font-size:24px !important; }
      .lead { font-size:15px !important; }
      .btn { font-size:15px !important; padding:14px 18px !important; }
    }
  </style>
</head>
<body>
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Registration is open — secure your child's spot for Late Fall. Use code THANKS today.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="wrap">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="container">
          <tr><td style="height:28px; line-height:28px; font-size:28px;">&nbsp;</td></tr>
          <tr>
            <td class="px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card">
                <tr>
                  <td class="px py">
                    <p class="kicker">Late Fall Season</p>
                    <h1 class="h1">We're coming back — Make your child's sport a priority!</h1>
                    <p class="lead">Morning <strong>${parentName}</strong>,</p>
                    <p class="body">Registration opened today… use code <strong>THANKS</strong> because you decided to make your child a priority today.</p>
                  </td>
                </tr>
                <tr>
                  <td class="px" align="center" style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <div class="btn-wrap" style="display:inline-block;">
                            <a class="btn" href="https://www.disciplinerift.com/register" target="_blank" rel="noopener">👉 Register Now</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <div style="height:1px; line-height:1px; font-size:1px; clear:both;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td class="px py">
                    <hr class="rule">
                    <p class="body"><strong>Discipline Rift</strong> is back at your school, for your child. <strong>Starting the first week of November.</strong></p>
                    <p class="body">For players who couldn't join earlier and returners who want to keep building discipline and passion for the sport.</p>
                    <div style="height:12px; line-height:12px; font-size:12px;">&nbsp;</div>
                    <span class="tag">Why sports?</span>
                    <p class="body" style="margin-top:10px;"><strong>Why Volleyball, Tennis, or Pickleball?</strong></p>
                    <p class="body">They start with trust and demand communication — through sports, we teach that <strong>no one wins alone.</strong></p>
                    <p class="body">Every win comes from <strong>movement, coordination, and connection.</strong></p>
                    <p class="body">It's not just the sport we teach — it's a way we help them grow.</p>
                    <hr class="rule">
                    <p class="body"><strong>Late Fall season:</strong> Registration is open now.</p>
                  </td>
                </tr>
                <tr>
                  <td class="px" align="center" style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <div class="btn-wrap" style="display:inline-block;">
                            <a class="btn" href="https://www.disciplinerift.com/register" target="_blank" rel="noopener">👉 Register Now</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <div style="height:1px; line-height:1px; font-size:1px; clear:both;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td class="px py">
                    <p class="body">See you on the court!</p>
                    <p class="body" style="margin:0 0 4px 0;"><strong>— The Discipline Rift Team</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                <tr>
                  <td class="py">
                    <p class="foot center" style="margin:0;">Registration • Volleyball • Tennis • Pickleball</p>
                    <p class="foot center" style="margin:6px 0 0 0;">
                      If the button doesn't work, copy and paste this link: <br>
                      <a href="https://www.disciplinerift.com/register" target="_blank" style="color:#2563eb; text-decoration:underline;">https://www.disciplinerift.com/register</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:28px; line-height:28px; font-size:28px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Función principal para reenviar correos de registro (solo los que fallaron)
 */
async function retryRegistrationEmails() {
  console.log('🔄 Starting RETRY registration email campaign...\n');
  console.log('⚠️  This will only send to emails that have NOT been sent successfully before\n');

  // Crear el transporter
  const transporter = createEmailTransporter();

  // Cargar emails ya enviados
  const emailsSent = loadSentEmails();
  const newEmailsSent = new Set<string>(emailsSent);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = emailsSent.size;

  try {
    // 1. Obtener todos los correos de la tabla Newsletter
    console.log('📋 Fetching emails from Newsletter table...');
    const { data: newsletterEmails, error: newsletterError } = await supabase
      .from('Newsletter')
      .select('email')
      .limit(10000);

    if (newsletterError) {
      console.error('❌ Error fetching newsletter emails:', newsletterError);
    } else {
      console.log(`✅ Found ${newsletterEmails?.length || 0} emails in Newsletter table\n`);
    }

    // 2. Obtener todos los padres de la tabla Enrollment
    console.log('📋 Fetching parent emails from Enrollment table...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollment')
      .select(`
        enrollmentid,
        studentid,
        student!inner(
          studentid,
          parentid,
          parent!inner(
            parentid,
            firstname,
            email
          )
        )
      `)
      .limit(10000);

    if (enrollmentsError) {
      console.error('❌ Error fetching enrollments:', enrollmentsError);
    } else {
      console.log(`✅ Found ${enrollments?.length || 0} enrollments\n`);
    }

    // 3. Procesar correos de Newsletter
    if (newsletterEmails && newsletterEmails.length > 0) {
      console.log('📧 Processing Newsletter emails...');
      for (const newsletter of newsletterEmails) {
        const email = newsletter.email.trim().toLowerCase();
        
        if (newEmailsSent.has(email)) {
          console.log(`⏭️  Skipping (already sent): ${email}`);
          continue;
        }

        try {
          const mailOptions = {
            from: `"Discipline Rift" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "We're back at your school—Register Now",
            html: createRegistrationEmailHtml('there'),
          };

          await transporter.sendMail(mailOptions);
          newEmailsSent.add(email);
          successCount++;
          console.log(`✅ [${successCount}] Email sent to: ${email} (Newsletter)`);
          
          // Guardar progreso cada 10 emails enviados
          if (successCount % 10 === 0) {
            saveSentEmails(newEmailsSent);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error sending email to ${email}:`, error);
        }

        // Pausa de 2 segundos entre emails para evitar bloqueo
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      console.log('');
    }

    // 4. Procesar correos de Enrollment
    if (enrollments && enrollments.length > 0) {
      console.log('📧 Processing Enrollment parent emails...');
      for (const enrollment of enrollments) {
        const student = enrollment.student as any;
        const parent = student?.parent;

        if (!parent || !parent.email) {
          console.log(`⚠️  Skipping enrollment ${enrollment.enrollmentid}: No parent email found`);
          continue;
        }

        const email = parent.email.trim().toLowerCase();
        const parentName = parent.firstname || 'there';

        if (newEmailsSent.has(email)) {
          console.log(`⏭️  Skipping (already sent): ${email}`);
          continue;
        }

        try {
          const mailOptions = {
            from: `"Discipline Rift" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "We're back at your school—Register Now",
            html: createRegistrationEmailHtml(parentName),
          };

          await transporter.sendMail(mailOptions);
          newEmailsSent.add(email);
          successCount++;
          console.log(`✅ [${successCount}] Email sent to: ${email} (Parent: ${parentName})`);
          
          // Guardar progreso cada 10 emails enviados
          if (successCount % 10 === 0) {
            saveSentEmails(newEmailsSent);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error sending email to ${email}:`, error);
        }

        // Pausa de 2 segundos entre emails para evitar bloqueo
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Guardar progreso final
    saveSentEmails(newEmailsSent);

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RETRY REGISTRATION EMAIL CAMPAIGN SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ NEW emails sent successfully: ${successCount}`);
    console.log(`❌ Total errors: ${errorCount}`);
    console.log(`⏭️  Previously sent (skipped): ${skippedCount}`);
    console.log(`📧 Total unique recipients: ${newEmailsSent.size}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error in retryRegistrationEmails:', error);
    // Guardar progreso incluso si hay un error fatal
    saveSentEmails(newEmailsSent);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  retryRegistrationEmails()
    .then(() => {
      console.log('✅ Retry registration email campaign completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Retry registration email campaign failed:', error);
      process.exit(1);
    });
}

export { retryRegistrationEmails };








