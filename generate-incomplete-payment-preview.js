/**
 * Generador de preview para el correo de recordatorio de pago incompleto
 * Ejecutar con: node generate-incomplete-payment-preview.js
 */

const fs = require('fs');
const path = require('path');

// Template del correo (igual al implementado en email-service.ts)
function createIncompletePaymentReminderTemplate(parentFirstName, enrollments) {
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
}

// Datos de ejemplo para el preview
const mockParentFirstName = "María";
const mockEnrollments = [
  {
    enrollmentid: "enrollment-123",
    student: {
      firstname: "Sofia",
      lastname: "González"
    },
    team: {
      name: "Varsity Volleyball",
      price: 299,
      school: {
        name: "Lincoln High School",
        location: "Miami, FL"
      }
    }
  }
];

// Generar el HTML del preview
const htmlContent = createIncompletePaymentReminderTemplate(mockParentFirstName, mockEnrollments);

// Guardar el archivo de preview
const outputPath = path.join(__dirname, 'incomplete-payment-reminder-preview.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('✅ Preview del correo generado exitosamente!');
console.log('📄 Archivo guardado en:', outputPath);
console.log('🔗 Abre el archivo en tu navegador para ver el preview');
console.log('');
console.log('📧 Subject del correo: "Sorry, I can\'t. They\'ve got something better."');
console.log('👤 Destinatario de ejemplo: María (madre de Sofia González)');
console.log('🏐 Equipo de ejemplo: Varsity Volleyball - Lincoln High School');
console.log('');
console.log('Para enviar los correos reales, usa:');
console.log('  GET  /api/send-incomplete-payment-reminder - Ver lista de padres');
console.log('  POST /api/send-incomplete-payment-reminder - Enviar correos');
