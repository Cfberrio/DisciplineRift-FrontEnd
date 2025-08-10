import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email address is required for test"
      }, { status: 400 });
    }

    // Check if Gmail SMTP is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ Gmail SMTP credentials not configured!");
      console.error("- GMAIL_USER:", process.env.GMAIL_USER ? "✅ Set" : "❌ Missing");
      console.error("- GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ Set" : "❌ Missing");
      
      return NextResponse.json({
        success: false,
        message: "Gmail SMTP credentials not configured",
        details: {
          GMAIL_USER: process.env.GMAIL_USER ? "✅ Configured" : "❌ Missing",
          GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "✅ Configured" : "❌ Missing"
        }
      }, { status: 500 });
    }

    console.log("✅ Gmail SMTP credentials are configured");
    console.log("- GMAIL_USER:", process.env.GMAIL_USER);

    const transporter = createTransporter();

    // Test data for contact form
    const testFormData = {
      name: "Usuario de Prueba",
      email: email,
      subject: "General Inquiry",
      message: "Este es un mensaje de prueba del formulario de contacto. Si recibes este email, significa que la configuración está funcionando correctamente."
    };

    // Prepare email content (same logic as contact form)
    const emailSubject = testFormData.subject 
      ? `Contact Form: ${testFormData.subject}` 
      : "New Contact Form Submission";

    const emailBody = `
New contact form submission from Discipline Rift website:

Name: ${testFormData.name}
Email: ${testFormData.email}
Subject: ${testFormData.subject || "Not specified"}

Message:
${testFormData.message}

---
This email was sent automatically from the Discipline Rift contact form.
Submission time: ${new Date().toLocaleString()}
    `.trim();

    // Configure email options (same as contact form)
    const mailOptions = {
      from: {
        name: 'Discipline Rift Contact Form',
        address: process.env.GMAIL_USER!,
      },
      to: 'info@disciplinerift.com',
      replyTo: testFormData.email,
      subject: emailSubject,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0; text-align: center;">🧪 TEST - New Contact Form Submission</h2>
            <p style="text-align: center; color: #6b7280; margin: 10px 0 0 0;">From Discipline Rift Website</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin-top: 0;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${testFormData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${testFormData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                <td style="padding: 8px 0; color: #1f2937;">${testFormData.subject || "Not specified"}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-top: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${testFormData.message}</p>
            </div>
          </div>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              📅 Submitted on: ${new Date().toLocaleString()}<br>
              🌐 From: Discipline Rift Contact Form<br>
              💬 Reply directly to this email to respond to ${testFormData.name}<br>
              🧪 This is a TEST email
            </p>
          </div>
        </div>
      `,
    };

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test contact email sent successfully:', result.messageId);
    console.log('📧 Email sent to: info@disciplinerift.com');
    console.log('👤 From test user:', testFormData.name, '(' + testFormData.email + ')');
    
    if (!result.messageId) {
      throw new Error("Email sent but no messageId received");
    }

    return NextResponse.json({
      success: true,
      message: `Test contact email sent successfully to info@disciplinerift.com`,
      messageId: result.messageId,
      testData: testFormData
    });

  } catch (error) {
    console.error("Test contact email error:", error);
    return NextResponse.json({
      success: false,
      message: "Error sending test contact email",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Contact Form Test Endpoint",
    instructions: "Send POST request with { email: 'test@example.com' } to test contact form email functionality"
  });
}