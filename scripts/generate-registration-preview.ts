#!/usr/bin/env tsx

/**
 * Script para generar un preview del correo de registro
 * 
 * Uso:
 *   npx tsx scripts/generate-registration-preview.ts
 */

import fs from 'fs';
import path from 'path';

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
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      <o:AllowPNG/>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
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

                <!-- FULL-WIDTH BUTTON ROW -->
                <tr>
                  <td class="px" align="center" style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://www.disciplinerift.com/#register" arcsize="50%" stroke="f" fillcolor="#FFFFFF" style="v-text-anchor:middle; height:48px; width:240px;">
                            <w:anchorlock/>
                            <center style="color:#0f172a; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700;">👉 Register Now</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <div class="btn-wrap" style="display:inline-block;">
                            <a class="btn" href="https://www.disciplinerift.com/#register" target="_blank" rel="noopener">👉 Register Now</a>
                          </div>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    <!-- CLEAR FIX FOR EMAIL CLIENTS -->
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

                <!-- SECOND FULL-WIDTH BUTTON ROW -->
                <tr>
                  <td class="px" align="center" style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://www.disciplinerift.com/#register" arcsize="50%" stroke="f" fillcolor="#FFFFFF" style="v-text-anchor:middle; height:48px; width:240px;">
                            <w:anchorlock/>
                            <center style="color:#0f172a; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700;">👉 Register Now</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <div class="btn-wrap" style="display:inline-block;">
                            <a class="btn" href="https://www.disciplinerift.com/#register" target="_blank" rel="noopener">👉 Register Now</a>
                          </div>
                          <!--<![endif]-->
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
                    <p class="foot center" style="margin:0;">
                      Registration • Volleyball • Tennis • Pickleball
                    </p>
                    <p class="foot center" style="margin:6px 0 0 0;">
                      If the button doesn't work, copy and paste this link: <br>
                      <a href="https://www.disciplinerift.com/#register" target="_blank" style="color:#2563eb; text-decoration:underline;">https://www.disciplinerift.com/#register</a>
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

// Generar el preview
console.log('🎨 Generating registration email preview...\n');

const previewHtml = createRegistrationEmailHtml('John');
const outputPath = path.join(process.cwd(), 'registration-email-preview.html');

fs.writeFileSync(outputPath, previewHtml);

console.log('✅ Preview generated successfully!');
console.log(`📄 File: ${outputPath}`);
console.log('\n📧 Email Subject: We\'re back at your school—Register Now');
console.log('\n💡 Open the HTML file in your browser to preview the email.');






