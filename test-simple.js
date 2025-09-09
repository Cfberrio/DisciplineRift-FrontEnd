const nodemailer = require('nodemailer');

// Configuración exactly como está en el proyecto
const GMAIL_USER = 'cberrio04@gmail.com';
const GMAIL_APP_PASSWORD = 'wpcg fqsk ewtd afqd';

console.log('🚀 INICIANDO ENVÍO DE CORREO DE RECORDATORIO');
console.log('📧 From:', GMAIL_USER);
console.log('🎯 To:', GMAIL_USER);

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Template completo del correo de recordatorio
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Sorry, I can't. They've got something better.</title>
  <style>
    body { margin:0; padding:0; background:#f3f5f9; font-family:Arial,sans-serif; }
    .container { width:600px; margin:0 auto; }
    .card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 10px 24px rgba(16,24,40,0.08); }
    .header { padding:32px; background:linear-gradient(135deg,#0f172a 0%, #1e293b 65%, #0ea5e9 130%); text-align:center; }
    .header h1 { color:#fff; font-size:18px; font-weight:800; letter-spacing:1.2px; margin:0; }
    .header p { color:#c7e9fb; font-size:13px; margin:6px 0 0; }
    .content { padding:40px; }
    .content h2 { font-size:26px; line-height:34px; color:#0f172a; margin:0 0 12px; font-weight:800; }
    .content p { font-size:16px; line-height:24px; color:#334155; margin:0 0 18px; }
    .chip { display:inline-block; padding:8px 14px; border-radius:999px; background:#eef2ff; color:#3730a3; font-size:14px; margin:6px 6px 0 0; font-weight:600; }
    .btn { display:inline-block; text-decoration:none; font-size:17px; font-weight:700; padding:14px 24px; border-radius:999px; background:#0ea5e9; color:#fff; margin:16px 0; }
    .footer { padding:32px; background:#f8fafc; text-align:center; font-size:12px; color:#64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>DISCIPLINE RIFT</h1>
        <p>Fall Sports Registration</p>
      </div>
      
      <div class="content">
        <h2>Sorry, I can't. They've got something better.</h2>
        
        <p><strong>Hi Carlos,</strong></p>
        
        <p>This fall, your child could be doing more than just school.</p>
        <p>They could be growing, training, and having the time of their life playing sports.</p>
        
        <p><strong>In ONE week, our fall season begins and registrations are closing.</strong></p>
        
        <div>
          <span class="chip">Volleyball</span>
          <span class="chip">Tennis</span>
          <span class="chip">Pickleball</span>
        </div>
        
        <hr style="border:none; height:1px; background:#e5e7eb; margin:24px 0;">
        
        <p><strong>You've got 7 days.</strong> Let's get your child in the game.</p>
        
        <p style="font-size:14px; color:#64748b;">We believe school doesn't teach everything. Sports help kids practice empathy, resilience, and how to win and lose in life.</p>
        <p style="font-size:14px; color:#64748b;">We build life skills through the game so kids grow as people, not just players.</p>
        
        <p><em>Sorry, I can't. They've got something better.</em></p>
        <p>7 days left to register for <strong>Volleyball • Tennis • Pickleball</strong>.</p>
        
        <a href="https://www.disciplinerift.com/#register" class="btn">Register Now</a>
        
        <p style="font-size:14px; color:#64748b;">Or paste this link in your browser: https://www.disciplinerift.com/#register</p>
      </div>
      
      <div class="footer">
        <p>You're receiving this because you asked about Discipline Rift Fall programs.</p>
        <p>&copy; Discipline Rift — All rights reserved</p>
      </div>
    </div>
  </div>
</body>
</html>`;

// Verificar conexión y enviar
async function sendEmail() {
  try {
    console.log('🔗 Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión Gmail exitosa');

    console.log('📬 Enviando correo...');
    const info = await transporter.sendMail({
      from: {
        name: 'Discipline Rift',
        address: GMAIL_USER,
      },
      to: GMAIL_USER,
      subject: "Sorry, I can't. They've got something better.",
      html: htmlTemplate,
    });

    console.log('🎉 === CORREO ENVIADO EXITOSAMENTE ===');
    console.log('📧 Message ID:', info.messageId);
    console.log('🎯 Enviado a:', GMAIL_USER);
    console.log('💡 Revisa tu bandeja de entrada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

sendEmail();
