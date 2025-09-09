const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing email configuration...');

// Check environment variables
console.log('📋 Environment variables:');
console.log('- GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('- GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('❌ Gmail credentials not configured');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Test connection
async function testConnection() {
  try {
    console.log('🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: {
        name: 'Discipline Rift Test',
        address: process.env.GMAIL_USER,
      },
      to: process.env.GMAIL_USER, // Send to self for testing
      subject: 'Test Email - Incomplete Payment System',
      html: `
        <h2>✅ Email System Test Successful</h2>
        <p>This is a test email from the incomplete payment reminder system.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>System: Ready for sending incomplete payment reminders</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('🎯 Email sent to:', process.env.GMAIL_USER);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testConnection();
