import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Test endpoint to verify email configuration
export async function GET(request: Request) {
  try {
    console.log("🧪 === EMAIL CONFIGURATION TEST ===")
    
    // Check environment variables
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD
    
    console.log("🔍 Environment Variables:")
    console.log("- GMAIL_USER:", gmailUser ? `✅ Set (${gmailUser})` : "❌ Missing")
    console.log("- GMAIL_APP_PASSWORD:", gmailPassword ? "✅ Set (hidden)" : "❌ Missing")
    
    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({
        success: false,
        message: "Gmail credentials not configured",
        details: {
          GMAIL_USER: gmailUser ? "Set" : "Missing",
          GMAIL_APP_PASSWORD: gmailPassword ? "Set" : "Missing",
        }
      }, { status: 503 })
    }
    
    // Get test email from query params (optional)
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get("email") || gmailUser
    
    console.log(`📧 Sending test email to: ${testEmail}`)
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })
    
    // Test email HTML
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
            .success { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>✅ Email System Test Successful!</h2>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>From:</strong> ${gmailUser}</p>
              <p><strong>To:</strong> ${testEmail}</p>
              <p>If you're seeing this email, the Partner Program email system is working correctly!</p>
            </div>
            <hr>
            <h3>Configuration Details:</h3>
            <ul>
              <li>Service: Gmail</li>
              <li>SMTP: smtp.gmail.com</li>
              <li>Port: 587 (TLS)</li>
            </ul>
          </div>
        </body>
      </html>
    `
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Discipline Rift Test" <${gmailUser}>`,
      to: testEmail,
      subject: "🧪 Partner Program Email Test - " + new Date().toLocaleString(),
      html: testHtml,
    })
    
    console.log("✅ Test email sent successfully!")
    console.log("✅ Message ID:", info.messageId)
    console.log("✅ Response:", info.response)
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        messageId: info.messageId,
        to: testEmail,
        from: gmailUser,
        timestamp: new Date().toISOString(),
      }
    })
    
  } catch (error) {
    console.error("❌ Email test failed:", error)
    
    return NextResponse.json({
      success: false,
      message: "Email test failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
