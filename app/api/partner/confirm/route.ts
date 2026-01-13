import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"
import nodemailer from "nodemailer"

// Initialize Stripe
let stripe: Stripe | null = null

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil",
    })
  }
} catch (error) {
  console.warn("Failed to initialize Stripe:", error)
}

// Create email transporter
function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ Gmail credentials not configured")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Create HTML email template
function createPartnerConfirmationEmail(
  parentName: string,
  playerName: string,
  whatsappLink: string,
  groupType: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #0085B7 0%, #005a7d 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          color: #333333;
          margin-bottom: 20px;
          font-weight: bold;
        }
        .message {
          font-size: 16px;
          color: #555555;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .highlight-box {
          background-color: #f0f8ff;
          border-left: 4px solid #0085B7;
          padding: 20px;
          margin: 30px 0;
        }
        .highlight-box h2 {
          color: #0085B7;
          margin: 0 0 15px 0;
          font-size: 20px;
        }
        .highlight-box p {
          margin: 10px 0;
          color: #333333;
          font-size: 16px;
        }
        .cta-button {
          display: inline-block;
          background-color: #25D366;
          color: #ffffff !important;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 18px;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);
        }
        .cta-container {
          text-align: center;
          margin: 30px 0;
        }
        .info-section {
          background-color: #fafafa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-section h3 {
          color: #0085B7;
          margin-top: 0;
          font-size: 18px;
        }
        .info-section ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .info-section li {
          color: #555555;
          margin: 8px 0;
          line-height: 1.5;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 30px;
          text-align: center;
          color: #777777;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 26px;
          }
          .cta-button {
            padding: 12px 30px;
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        
        <!-- Header -->
        <div class="header">
          <h1>🏈 Welcome to the Partner Program!</h1>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">Hello ${parentName}!</div>
          
          <p class="message">
            Thank you for joining the <strong>Discipline Rift Flag Football Partner Program</strong>. 
            Your payment has been successfully processed, and we're excited to partner with you 
            in developing ${playerName}'s flag football skills!
          </p>

          <!-- WhatsApp Link Highlight -->
          <div class="highlight-box">
            <h2>📱 Join Your WhatsApp Group</h2>
            <p>
              Click the button below to join your exclusive partner group. This is where you'll receive:
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
              <li>Weekly drills, games, and activities</li>
              <li>Supplemental training videos</li>
              <li>Equipment recommendations</li>
              <li>Direct coach feedback</li>
            </ul>
          </div>

          <div class="cta-container">
            <a href="${whatsappLink}" class="cta-button">
              Join WhatsApp Group →
            </a>
          </div>

          <!-- Program Details -->
          <div class="info-section">
            <h3>📋 Program Details</h3>
            <ul>
              <li><strong>Player:</strong> ${playerName}</li>
              <li><strong>Group:</strong> ${groupType === "2-3" ? "2-3 Partners" : "4-5 Partners"}</li>
              <li><strong>Investment:</strong> $50.00</li>
              <li><strong>Commitment:</strong> Minimum 2 at-home practices per week</li>
            </ul>
          </div>

          <!-- Next Steps -->
          <div class="info-section">
            <h3>🎯 Next Steps</h3>
            <ul>
              <li>Join the WhatsApp group using the link above</li>
              <li>Introduce yourself and your player to the coaches</li>
              <li>Start receiving weekly practice resources</li>
              <li>Submit proof of practice after each home session</li>
            </ul>
          </div>

          <p class="message">
            Remember: This program is built on <strong>partnership and accountability</strong>. 
            We're here to support you and ${playerName} every step of the way.
          </p>

          <p class="message">
            If you have any questions, feel free to reach out directly in the WhatsApp group 
            or contact us at <a href="mailto:info@disciplinerift.com" style="color: #0085B7;">info@disciplinerift.com</a>
          </p>

          <p class="message" style="margin-top: 30px;">
            <strong>Let's build champions together! 🏆</strong>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Discipline Rift</strong></p>
          <p>Torres Rivero LLC</p>
          <p>Building Character Through Sports</p>
          <p style="margin-top: 15px;">
            <a href="https://www.disciplinerift.com/privacy-policy" style="color: #0085B7; text-decoration: none;">Privacy Policy</a> | 
            <a href="https://www.disciplinerift.com/terms-of-use" style="color: #0085B7; text-decoration: none;">Terms of Use</a>
          </p>
          <p style="margin-top: 10px; font-size: 12px; color: #999999;">
            © ${new Date().getFullYear()} Discipline Rift (Torres Rivero LLC). All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

// Send confirmation email
async function sendPartnerConfirmationEmail(
  email: string,
  parentName: string,
  playerName: string,
  whatsappLink: string,
  groupType: string
) {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.error("❌ Email transporter not available")
    throw new Error("Email service not configured")
  }

  const htmlContent = createPartnerConfirmationEmail(parentName, playerName, whatsappLink, groupType)

  const mailOptions = {
    from: `"Discipline Rift" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🏈 Welcome to the Flag Football Partner Program!",
    html: htmlContent,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Partner confirmation email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("❌ Failed to send partner confirmation email:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    console.log("🚀 === PARTNER PAYMENT CONFIRMATION STARTED ===")

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    console.log("📋 Payment confirmation parameters:", { 
      sessionId: sessionId?.substring(0, 20) + "...", 
    })

    if (!sessionId) {
      console.error("❌ Missing session_id in payment confirmation")
      return NextResponse.redirect(new URL("/partner-resources-2-3?error=missing_session", request.url))
    }

    if (!stripe) {
      console.error("❌ Stripe not configured")
      return NextResponse.redirect(new URL("/partner-resources-2-3?error=stripe_not_configured", request.url))
    }

    console.log("🔄 Retrieving Stripe session...")
    
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log("✅ Stripe session retrieved:", {
      id: session.id,
      status: session.payment_status,
      amount: session.amount_total,
    })

    if (session.payment_status !== "paid") {
      console.log("⚠️ Payment not completed, status:", session.payment_status)
      return NextResponse.redirect(new URL("/partner-resources-2-3?error=payment_not_completed", request.url))
    }

    // Extract metadata
    const metadata = session.metadata
    if (!metadata) {
      console.error("❌ No metadata found in session")
      return NextResponse.redirect(new URL("/partner-resources-2-3?error=missing_metadata", request.url))
    }

    const { partner_id, parent_name, player_name, email, group_type, whatsapp_link } = metadata

    if (!partner_id || !parent_name || !player_name || !email || !group_type || !whatsapp_link) {
      console.error("❌ Missing required metadata:", metadata)
      return NextResponse.redirect(new URL("/partner-resources-2-3?error=invalid_metadata", request.url))
    }

    console.log("📝 Partner details:", { partner_id, parent_name, player_name, email, group_type })

    // Update payment status in database
    console.log(`📝 Updating payment status for partner ID: ${partner_id}`)
    const { error: updateError } = await supabaseAdmin
      .from('Partners_Program')
      .update({ payment: true })
      .eq('id', parseInt(partner_id))

    if (updateError) {
      console.error("❌ Failed to update payment status:", updateError)
      // Continue anyway to send email
    } else {
      console.log(`✅ Payment status updated for partner ID: ${partner_id}`)
    }

    // Send confirmation email with WhatsApp link
    console.log("📧 Sending confirmation email...")
    try {
      await sendPartnerConfirmationEmail(email, parent_name, player_name, whatsapp_link, group_type)
      console.log(`✅ Confirmation email sent to: ${email}`)
    } catch (emailError) {
      console.error("❌ Failed to send confirmation email:", emailError)
      // Continue to success page even if email fails
    }

    // Redirect to success page
    console.log("🎉 Redirecting to success page...")
    return NextResponse.redirect(new URL(`/partner-success?session_id=${sessionId}`, request.url))

  } catch (error) {
    console.error("❌ Payment confirmation error:", error)
    return NextResponse.redirect(new URL("/partner-resources-2-3?error=unexpected_error", request.url))
  }
}
