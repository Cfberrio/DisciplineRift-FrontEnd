import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from 'nodemailer';
import { checkBotId } from 'botid/server';

// List of disposable email domains to block (includes popular ones in US/Latin America)
const DISPOSABLE_EMAIL_DOMAINS = [
  // General disposable domains
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'trashmail.com', 'yopmail.com',
  'temp-mail.org', 'getnada.com', 'fakeinbox.com', 'sharklasers.com',
  'spam4.me', 'grr.la', 'dispostable.com',
  // Popular in US
  'guerrillamailblock.com', 'pokemail.net', 'spamgourmet.com', 'mintemail.com',
  'emailondeck.com', 'throwawaymail.com', 'tempinbox.com', 'anonbox.net',
  // Popular in Latin America
  'correotemporal.org', 'emailtemporanea.com', 'emailtemporario.com.br',
  'mohmal.com', 'mytemp.email', 'tempmail.io', 'inboxkitten.com',
  // Other common ones
  '10minutemail.net', '20minutemail.com', '33mail.com', 'bugmenot.com',
  'getairmail.com', 'hidemail.de', 'incognitomail.com', 'jetable.org'
];

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

// Validate email format and check for disposable domains
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  return !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

// Sanitize string to prevent injection attacks
const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '').trim();
};

export async function POST(request: Request) {
  try {
    // STEP 1: Check BotID to detect bot traffic
    const botResult = await checkBotId();
    
    // Block if it's a bot (but allow verified bots like search engines)
    if (botResult.isBot && !botResult.isVerifiedBot) {
      console.log("🚫 Bot detected by BotID, blocking request");
      return NextResponse.json(
        { message: "Request blocked" },
        { status: 403 }
      );
    }

    const formData = await request.json();
    console.log("Contact form submission received:", formData);

    // STEP 2: Check honeypot field
    if (formData.company && formData.company.trim() !== '') {
      console.log("🚫 Honeypot triggered - bot detected, silently ignoring");
      // Return success to fool the bot, but don't process
      return NextResponse.json({
        message: "Thank you for your message! We'll get back to you soon.",
        success: true,
      });
    }

    // STEP 3: Validate required fields with minimum lengths
    if (!formData.name || formData.name.trim().length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!formData.email || !formData.email.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!formData.message || formData.message.trim().length < 10) {
      return NextResponse.json(
        { message: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // STEP 4: Validate email format and check for disposable domains
    if (!isValidEmail(formData.email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // STEP 5: Sanitize inputs
    const sanitizedName = sanitizeString(formData.name);
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedSubject = formData.subject ? sanitizeString(formData.subject) : "";
    const sanitizedMessage = sanitizeString(formData.message);

    // Create admin client for Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Prepare email content with sanitized data
    const emailSubject = sanitizedSubject 
      ? `Contact Form: ${sanitizedSubject}` 
      : "New Contact Form Submission";

    const emailBody = `
New contact form submission from Discipline Rift website:

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Subject: ${sanitizedSubject || "Not specified"}

Message:
${sanitizedMessage}

---
This email was sent automatically from the Discipline Rift contact form.
Submission time: ${new Date().toLocaleString()}
    `.trim();

    console.log("Attempting to send email via SMTP...");

    // Send email using Gmail SMTP
    try {
      // Check if Gmail SMTP is configured
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("❌ Gmail SMTP credentials not configured!");
        console.error("- GMAIL_USER:", process.env.GMAIL_USER ? "✅ Set" : "❌ Missing");
        console.error("- GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ Set" : "❌ Missing");
        throw new Error("Gmail SMTP credentials not configured");
      }

      console.log("✅ Gmail SMTP credentials are configured");
      console.log("- GMAIL_USER:", process.env.GMAIL_USER);

      const transporter = createTransporter();

      // Configure email options with secure sender
      const mailOptions = {
        from: {
          name: 'Discipline Rift Contact Form',
          address: process.env.GMAIL_USER!, // Always use domain email as sender
        },
        to: 'info@disciplinerift.com',
        replyTo: sanitizedEmail, // User email goes in replyTo for safety
        subject: emailSubject,
        text: emailBody,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0; text-align: center;">📧 New Contact Form Submission</h2>
              <p style="text-align: center; color: #6b7280; margin: 10px 0 0 0;">From Discipline Rift Website</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="color: #1f2937; margin-top: 0;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedSubject || "Not specified"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-top: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${sanitizedMessage}</p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                📅 Submitted on: ${new Date().toLocaleString()}<br>
                🌐 From: Discipline Rift Contact Form<br>
                💬 Reply directly to this email to respond to ${sanitizedName}
              </p>
            </div>
          </div>
        `,
      };

      // Send the email
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Contact email sent successfully:', result.messageId);
      console.log('📧 Email sent to: info@disciplinerift.com');
      console.log('👤 From user:', sanitizedName, '(' + sanitizedEmail + ')');
      
      if (!result.messageId) {
        throw new Error("Email sent but no messageId received");
      }

      // Optionally store the contact form submission in database
      try {
        await supabaseAdmin
          .from("contact_submissions")
          .insert({
            name: sanitizedName,
            email: sanitizedEmail,
            subject: sanitizedSubject || null,
            message: sanitizedMessage,
            submitted_at: new Date().toISOString(),
            status: 'sent'
          });
        console.log("Contact submission stored in database");
      } catch (dbError) {
        console.warn("Could not store in database (table may not exist):", dbError);
        // Continue even if database storage fails
      }

      return NextResponse.json({
        message: "Thank you for your message! We'll get back to you soon.",
        success: true,
      });

    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // Still try to store in database even if email fails
      try {
        await supabaseAdmin
          .from("contact_submissions")
          .insert({
            name: sanitizedName,
            email: sanitizedEmail,
            subject: sanitizedSubject || null,
            message: sanitizedMessage,
            submitted_at: new Date().toISOString(),
            status: 'failed'
          });
      } catch (dbError) {
        console.warn("Could not store in database:", dbError);
      }

      return NextResponse.json(
        {
          message: "Thank you for your message! We have received it and will get back to you soon.",
          success: true,
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        message: "An error occurred while sending your message. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}