// Script directo para enviar correo AHORA
const nodemailer = require('nodemailer');

console.log('INICIANDO ENVIO...');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'cberrio04@gmail.com',
    pass: 'wpcg fqsk ewtd afqd',
  },
});

const mailOptions = {
  from: 'Discipline Rift <cberrio04@gmail.com>',
  to: 'cberrio04@gmail.com',
  subject: "Sorry, I can't. They've got something better.",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f3f5f9; padding: 20px;">
      <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 24px rgba(16,24,40,0.08);">
        
        <!-- Header -->
        <div style="padding: 32px; background: linear-gradient(135deg,#0f172a 0%, #1e293b 65%, #0ea5e9 130%); text-align: center;">
          <h1 style="color: #fff; font-size: 18px; font-weight: 800; letter-spacing: 1.2px; margin: 0;">DISCIPLINE RIFT</h1>
          <p style="color: #c7e9fb; font-size: 13px; margin: 6px 0 0;">Fall Sports Registration</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="font-size: 26px; color: #0f172a; margin: 0 0 12px; font-weight: 800;">Sorry, I can't. They've got something better.</h2>
          
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;"><strong>Hi Parent,</strong></p>
          
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;">This fall, your child could be doing more than just school.</p>
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;">They could be growing, training, and having the time of their life playing sports.</p>
          
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;"><strong>In ONE week, our fall season begins and registrations are closing.</strong></p>
          
          <!-- Sports chips -->
          <div style="margin: 20px 0;">
            <span style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 14px; margin: 6px 6px 0 0; font-weight: 600;">Volleyball</span>
            <span style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 14px; margin: 6px 6px 0 0; font-weight: 600;">Tennis</span>
            <span style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 14px; margin: 6px 6px 0 0; font-weight: 600;">Pickleball</span>
          </div>
          
          <hr style="border: none; height: 1px; background: #e5e7eb; margin: 24px 0;">
          
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;"><strong>You've got 7 days.</strong> Let's get your child in the game.</p>
          
          <p style="font-size: 14px; color: #64748b; margin: 0 0 20px;">We believe school doesn't teach everything. Sports help kids practice empathy, resilience, and how to win and lose in life.</p>
          <p style="font-size: 14px; color: #64748b; margin: 0 0 20px;">We build life skills through the game so kids grow as people, not just players.</p>
          
          <p style="font-size: 16px; color: #334155; margin: 18px 0 6px;"><em>Sorry, I can't. They've got something better.</em></p>
          <p style="font-size: 16px; color: #334155; margin: 0 0 18px;">7 days left to register for <strong>Volleyball • Tennis • Pickleball</strong>.</p>
          
          <!-- CTA Button -->
          <div style="margin: 16px 0;">
            <a href="https://www.disciplinerift.com/#register" style="display: inline-block; text-decoration: none; font-size: 17px; font-weight: 700; padding: 14px 24px; border-radius: 999px; background: #0ea5e9; color: #fff;">Register Now</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin: 16px 0;">Or paste this link in your browser: https://www.disciplinerift.com/#register</p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px; background: #f8fafc; text-align: center;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">You're receiving this because you asked about Discipline Rift Fall programs.</p>
          <p style="font-size: 12px; color: #64748b; margin: 6px 0 0;">&copy; Discipline Rift — All rights reserved</p>
        </div>
        
      </div>
    </div>
  `
};

// Enviar correo inmediatamente
transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log('ERROR:', error.message);
    process.exit(1);
  } else {
    console.log('CORREO ENVIADO EXITOSAMENTE!');
    console.log('Message ID:', info.messageId);
    console.log('Enviado a: cberrio04@gmail.com');
    process.exit(0);
  }
});

console.log('Script ejecutado, enviando correo...');
