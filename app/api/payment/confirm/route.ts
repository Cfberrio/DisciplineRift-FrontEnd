import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import Stripe from "stripe"
import { sendPaymentConfirmationEmail, sendPaymentNotificationToCompany } from "@/lib/email-service"

// Initialize Stripe only if secret key is available
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

export async function GET(request: Request) {
  try {
    console.log("🚀 === PAYMENT CONFIRMATION GET METHOD STARTED ===")
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Database service not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const enrollmentId = searchParams.get("enrollment_id")

    console.log("📋 Payment confirmation parameters:", { 
      sessionId: sessionId?.substring(0, 20) + "...", 
      enrollmentId 
    })

    if (!sessionId) {
      console.error("❌ Missing session_id in payment confirmation")
      return NextResponse.redirect(new URL("/payment/cancel?error=missing_session", request.url))
    }

    console.log("🔄 Processing payment confirmation for session:", sessionId)

    // IMMEDIATE EMAIL TEST - Let's see if email system works at all
    console.log("🧪 === IMMEDIATE EMAIL SYSTEM TEST ===")
    try {
      const gmailUser = process.env.GMAIL_USER
      const gmailPassword = process.env.GMAIL_APP_PASSWORD
      
      console.log("🔍 Gmail config check:", {
        hasUser: !!gmailUser,
        hasPassword: !!gmailPassword,
        userValue: gmailUser || "NOT_SET"
      })

      if (gmailUser && gmailPassword) {
        console.log("✅ Gmail credentials found - will attempt email sending")
      } else {
        console.error("❌ GMAIL CREDENTIALS MISSING!")
        console.error("- GMAIL_USER:", gmailUser || "NOT SET")
        console.error("- GMAIL_APP_PASSWORD:", gmailPassword ? "SET" : "NOT SET")
      }
    } catch (configError) {
      console.error("❌ Error checking Gmail config:", configError)
    }

    // Check if this is a development/mock session
    if (sessionId.startsWith("mock_")) {
      console.log("🛠 Processing mock payment confirmation")

      // Redirect to main page with success message
      const successUrl = new URL("/", request.url)
      successUrl.searchParams.set("enrollment", "success")
      successUrl.searchParams.set("mock", "true")
      return NextResponse.redirect(successUrl)
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.error("❌ Stripe not configured")
      return NextResponse.redirect(new URL("/payment/cancel?error=stripe_not_configured", request.url))
    }

    // Retrieve the Stripe session
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError)
      return NextResponse.redirect(new URL("/payment/cancel?error=invalid_session", request.url))
    }

    console.log("✅ Stripe session retrieved:", {
      id: session.id,
      status: session.payment_status,
      amount: session.amount_total,
    })

    if (session.payment_status !== "paid") {
      console.log("⚠️ Payment not completed, status:", session.payment_status)
      return NextResponse.redirect(new URL("/payment/cancel?error=payment_not_completed", request.url))
    }

    // Extract enrollment ID from metadata or URL parameter
    const finalEnrollmentId = session.metadata?.enrollmentId || enrollmentId
    if (!finalEnrollmentId) {
      console.error("❌ No enrollment ID found")
      return NextResponse.redirect(new URL("/payment/cancel?error=missing_enrollment", request.url))
    }

    console.log("📝 Final enrollment ID for email:", finalEnrollmentId)

    // Try to create payment record, but don't fail if schema issues exist
    try {
      // Check if payment record already exists
      const { data: existingPayment } = await supabase
        .from("payment")
        .select("*")
        .eq("enrollmentid", finalEnrollmentId)
        .eq("status", "paid")
        .single()

      if (!existingPayment) {
        // Create payment record without stripe_session_id if column doesn't exist
        const { data: paymentData, error: paymentError } = await supabase
          .from("payment")
          .insert({
            enrollmentid: finalEnrollmentId,
            amount: (session.amount_total || 0) / 100,
            status: "paid",
            date: new Date().toISOString(),
          })
          .select()
          .single()

        if (paymentError) {
          console.error("❌ Payment record creation error:", paymentError)
          // Don't fail the flow for database schema issues - enrollment is more important
          console.log("⚠️ Continuing with enrollment activation despite payment record error")
        } else {
          console.log("✅ Payment record created:", paymentData)
        }
      }
    } catch (dbError) {
      console.error("❌ Database error:", dbError)
      console.log("⚠️ Continuing with enrollment activation despite database error")
    }

    // Update enrollment status to active
    const { error: enrollmentError } = await supabase
      .from("enrollment")
      .update({ isactive: true })
      .eq("enrollmentid", finalEnrollmentId)

    if (enrollmentError) {
      console.error("❌ Enrollment update error:", enrollmentError)
      // Don't fail the request, just log the error
    } else {
      console.log("✅ Enrollment activated successfully")
    }

    // FORCE EMAIL SENDING - WITH DETAILED DEBUGGING
    console.log("📧 === FORCED EMAIL CONFIRMATION PROCESS ===")
    
    try {
      // Check email configuration first
      console.log("🔍 Step 1: Checking Gmail configuration...")
      const gmailUser = process.env.GMAIL_USER
      const gmailPassword = process.env.GMAIL_APP_PASSWORD
      
      if (!gmailUser || !gmailPassword) {
        console.error("❌ Gmail credentials not configured!")
        console.error("- GMAIL_USER:", gmailUser ? "✅ Set" : "❌ Missing")
        console.error("- GMAIL_APP_PASSWORD:", gmailPassword ? "✅ Set" : "❌ Missing")
        console.error("📧 EMAIL WILL NOT BE SENT - Missing credentials")
        
        // IMPORTANT: Let's still try to redirect but log this critical error
        console.error("🚨 CRITICAL: EMAIL SYSTEM NOT CONFIGURED - USER WILL NOT RECEIVE CONFIRMATION")
        
      } else {
        console.log("✅ Gmail credentials are configured")
        console.log("- GMAIL_USER:", gmailUser)
        console.log("- GMAIL_APP_PASSWORD: [HIDDEN]")
        
        // Get complete enrollment data for email
        console.log("🔍 Step 2: Fetching enrollment data for:", finalEnrollmentId)
        const { data: enrollment, error: enrollmentFetchError } = await supabase
          .from("enrollment")
          .select(`
            *,
            student:studentid (
              studentid,
              firstname,
              lastname,
              grade,
              ecname,
              ecphone,
              ecrelationship,
              parent:parentid (
                firstname,
                lastname,
                email
              )
            ),
            team:teamid (
              teamid,
              name,
              description,
              price,
              created_at,
              updated_at,
              school:schoolid (
                name,
                location
              ),
              session (
                startdate,
                enddate,
                starttime,
                endtime,
                daysofweek,
                cancel,
                staff:coachid (
                  name,
                  email,
                  phone
                )
              )
            )
          `)
          .eq("enrollmentid", finalEnrollmentId)
          .single()

        if (enrollmentFetchError) {
          console.error("❌ Error fetching enrollment data:", enrollmentFetchError)
          throw new Error(`Failed to fetch enrollment: ${enrollmentFetchError.message}`)
        }

        console.log("✅ Enrollment data fetched successfully")
        console.log("📋 Enrollment data structure:", {
          hasEnrollment: !!enrollment,
          hasStudent: !!enrollment?.student,
          hasParent: !!enrollment?.student?.parent,
          hasTeam: !!enrollment?.team,
          parentEmail: enrollment?.student?.parent?.email,
          studentName: enrollment?.student ? `${enrollment.student.firstname} ${enrollment.student.lastname}` : 'N/A',
          teamName: enrollment?.team?.name || 'N/A'
        })

        if (enrollment?.student?.parent?.email && enrollment?.team && enrollment?.student) {
          console.log("🔍 Step 3: Preparing email data...")
          
          const studentData = {
            firstName: enrollment.student.firstname,
            lastName: enrollment.student.lastname,
            grade: enrollment.student.grade,
            emergencyContact: {
              name: enrollment.student.ecname,
              phone: enrollment.student.ecphone,
              relationship: enrollment.student.ecrelationship,
            }
          }

          const teamData = {
            teamid: enrollment.team.teamid,
            name: enrollment.team.name,
            description: enrollment.team.description,
            price: enrollment.team.price,
            created_at: enrollment.team.created_at,
            updated_at: enrollment.team.updated_at,
            school: {
              name: enrollment.team.school?.name || "Unknown School",
              location: enrollment.team.school?.location || "Unknown Location",
            },
            session: enrollment.team.session || []
          }

          const emailPaymentData = {
            amount: (session.amount_total || 0) / 100,
            date: new Date().toISOString(),
            sessionId: sessionId
          }

          const parentData = {
            firstName: enrollment.student.parent.firstname,
            lastName: enrollment.student.parent.lastname,
            email: enrollment.student.parent.email
          }

          console.log("📧 Step 4: Sending email to:", enrollment.student.parent.email)
          console.log("📧 Email data prepared:", {
            student: `${studentData.firstName} ${studentData.lastName}`,
            team: teamData.name,
            amount: emailPaymentData.amount,
            parentEmail: parentData.email
          })

          console.log("🚀 ATTEMPTING EMAIL SEND NOW...")
          
          const emailResult = await sendPaymentConfirmationEmail(
            enrollment.student.parent.email,
            studentData,
            teamData,
            emailPaymentData,
            parentData
          )

          if (emailResult.success) {
            console.log("✅ Payment confirmation email sent successfully (GET method)")
            console.log("📧 Message ID:", emailResult.messageId)
            console.log("🎉 EMAIL SENT SUCCESSFULLY!")
          } else {
            console.error("❌ Failed to send payment confirmation email (GET method):", emailResult.error)
            console.error("🚨 EMAIL SEND FAILED!")
          }

          // Enviar notificación de pago a la empresa
          console.log("🏢 Step 5: Sending payment notification to company...")
          try {
            const companyEmailResult = await sendPaymentNotificationToCompany(
              studentData,
              teamData,
              emailPaymentData,
              parentData
            )

            if (companyEmailResult.success) {
              console.log("✅ Company notification email sent successfully (GET method)")
              console.log("📧 Company Message ID:", companyEmailResult.messageId)
            } else {
              console.error("❌ Failed to send company notification email (GET method):", companyEmailResult.error)
            }
          } catch (companyEmailError) {
            console.error("❌ Error sending company notification (GET method):", companyEmailError)
          }
        } else {
          console.warn("⚠️ Missing data for sending confirmation email (GET method)")
          console.warn("📋 Missing data details:", {
            hasParentEmail: !!enrollment?.student?.parent?.email,
            hasTeam: !!enrollment?.team,
            hasStudent: !!enrollment?.student,
            parentEmail: enrollment?.student?.parent?.email || 'MISSING',
          })
          console.error("🚨 CANNOT SEND EMAIL - INCOMPLETE DATA")
        }
      }
    } catch (emailError) {
      console.error("❌ Error sending payment confirmation email (GET method):", emailError)
      console.error("🚨 EMAIL SYSTEM CRASHED:", emailError)
      // Don't fail the redirect because of email issues
    }

    console.log("🔄 Redirecting to success page...")

    // Redirect to main page with success message
    const successUrl = new URL("/", request.url)
    successUrl.searchParams.set("enrollment", "success")
    successUrl.searchParams.set("session_id", sessionId)
    
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error("❌ Payment confirmation error:", error)
    return NextResponse.redirect(new URL("/payment/cancel?error=unexpected_error", request.url))
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Database service not configured" }, { status: 503 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Session ID is required" }, { status: 400 })
    }

    console.log("🔄 Confirming payment for session:", sessionId)

    // Check if this is a development/mock session
    if (sessionId.startsWith("mock_")) {
      console.log("🛠 Processing mock payment confirmation")

      return NextResponse.json({
        success: true,
        message: "Payment confirmed successfully (Development Mode)",
        paymentDetails: {
          amount: 299,
          teamName: "Mock Team",
          studentName: "Test Student",
          date: new Date().toISOString(),
        },
      })
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.error("❌ Stripe not configured")
      return NextResponse.json({ success: false, message: "Stripe not configured" }, { status: 503 })
    }

    // Retrieve the Stripe session
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError)
      return NextResponse.json({ success: false, message: "Invalid payment session" }, { status: 400 })
    }

    console.log("✅ Stripe session retrieved:", {
      id: session.id,
      status: session.payment_status,
      amount: session.amount_total,
    })

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, message: "Payment not completed" }, { status: 400 })
    }

    // Extract enrollment ID from metadata
    const enrollmentId = session.metadata?.enrollmentId
    if (!enrollmentId) {
      console.error("❌ No enrollment ID in session metadata")
      return NextResponse.json({ success: false, message: "Invalid payment session data" }, { status: 400 })
    }

    // Check if payment record already exists
    const { data: existingPayment } = await supabase
      .from("payment")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single()

    if (existingPayment) {
      console.log("✅ Payment record already exists")

      // Get enrollment and student details for response
      const { data: enrollment } = await supabase
        .from("enrollment")
        .select(`
          *,
          student:studentid (firstname, lastname),
          team:teamid (name)
        `)
        .eq("enrollmentid", enrollmentId)
        .single()

      return NextResponse.json({
        success: true,
        message: "Payment already confirmed",
        paymentDetails: {
          amount: (session.amount_total || 0) / 100,
          teamName: enrollment?.team?.name || "Unknown Team",
          studentName: `${enrollment?.student?.firstname || ""} ${enrollment?.student?.lastname || ""}`.trim(),
          date: existingPayment.date,
        },
      })
    }

    // Create payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payment")
      .insert({
        enrollmentid: enrollmentId,
        amount: (session.amount_total || 0) / 100,
        status: "paid",
        stripe_session_id: sessionId,
        date: new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error("❌ Payment record creation error:", paymentError)
      return NextResponse.json({ success: false, message: "Failed to record payment" }, { status: 500 })
    }

    // Update enrollment status to active
    const { error: enrollmentError } = await supabase
      .from("enrollment")
      .update({ isactive: true })
      .eq("enrollmentid", enrollmentId)

    if (enrollmentError) {
      console.error("❌ Enrollment update error:", enrollmentError)
      // Don't fail the request, just log the error
    }

    // Get complete enrollment, student, parent, team, and school details for email
    const { data: enrollment } = await supabase
      .from("enrollment")
      .select(`
        *,
        student:studentid (
          studentid,
          firstname,
          lastname,
          grade,
          ecname,
          ecphone,
          ecrelationship,
          parent:parentid (
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          description,
          price,
          created_at,
          updated_at,
          school:schoolid (
            name,
            location
          ),
          session (
            startdate,
            enddate,
            starttime,
            endtime,
            daysofweek,
            cancel,
            staff:coachid (
              name,
              email,
              phone
            )
          )
        )
      `)
      .eq("enrollmentid", enrollmentId)
      .single()

    console.log("✅ Payment confirmed and recorded successfully")

    // Send confirmation email
    if (enrollment?.student?.parent?.email && enrollment?.team && enrollment?.student) {
      try {
        console.log("📧 === STARTING EMAIL CONFIRMATION PROCESS (POST method) ===")
        
        // Check email configuration first
        console.log("🔍 Step 1: Checking Gmail configuration...")
        const gmailUser = process.env.GMAIL_USER
        const gmailPassword = process.env.GMAIL_APP_PASSWORD
        
        if (!gmailUser || !gmailPassword) {
          console.error("❌ Gmail credentials not configured!")
          console.error("- GMAIL_USER:", gmailUser ? "✅ Set" : "❌ Missing")
          console.error("- GMAIL_APP_PASSWORD:", gmailPassword ? "✅ Set" : "❌ Missing")
          console.error("📧 EMAIL WILL NOT BE SENT - Missing credentials")
        } else {
          console.log("✅ Gmail credentials are configured")
          console.log("- GMAIL_USER:", gmailUser)
          console.log("- GMAIL_APP_PASSWORD: [HIDDEN]")
        }
        
        console.log("📧 Step 2: Preparing email data...")
        
        const studentData = {
          firstName: enrollment.student.firstname,
          lastName: enrollment.student.lastname,
          grade: enrollment.student.grade,
          emergencyContact: {
            name: enrollment.student.ecname,
            phone: enrollment.student.ecphone,
            relationship: enrollment.student.ecrelationship,
          }
        }

        const teamData = {
          teamid: enrollment.team.teamid,
          name: enrollment.team.name,
          description: enrollment.team.description,
          price: enrollment.team.price,
          created_at: enrollment.team.created_at,
          updated_at: enrollment.team.updated_at,
          school: {
            name: enrollment.team.school?.name || "Unknown School",
            location: enrollment.team.school?.location || "Unknown Location",
          },
          session: enrollment.team.session || []
        }

        const emailPaymentData = {
          amount: (session.amount_total || 0) / 100,
          date: paymentData.date,
          sessionId: sessionId
        }

        const parentData = {
          firstName: enrollment.student.parent.firstname,
          lastName: enrollment.student.parent.lastname,
          email: enrollment.student.parent.email
        }

        console.log("📧 Step 3: Sending email to:", enrollment.student.parent.email)
        console.log("📧 Email data prepared:", {
          student: `${studentData.firstName} ${studentData.lastName}`,
          team: teamData.name,
          amount: emailPaymentData.amount,
          parentEmail: parentData.email
        })

        const emailResult = await sendPaymentConfirmationEmail(
          enrollment.student.parent.email,
          studentData,
          teamData,
          emailPaymentData,
          parentData
        )

        if (emailResult.success) {
          console.log("✅ Payment confirmation email sent successfully (POST method)")
          console.log("📧 Message ID:", emailResult.messageId)
        } else {
          console.error("❌ Failed to send payment confirmation email (POST method):", emailResult.error)
        }

        // Enviar notificación de pago a la empresa
        console.log("🏢 Sending payment notification to company...")
        try {
          const companyEmailResult = await sendPaymentNotificationToCompany(
            studentData,
            teamData,
            emailPaymentData,
            parentData
          )

          if (companyEmailResult.success) {
            console.log("✅ Company notification email sent successfully (POST method)")
            console.log("📧 Company Message ID:", companyEmailResult.messageId)
          } else {
            console.error("❌ Failed to send company notification email (POST method):", companyEmailResult.error)
          }
        } catch (companyEmailError) {
          console.error("❌ Error sending company notification (POST method):", companyEmailError)
        }
      } catch (emailError) {
        console.error("❌ Error sending payment confirmation email (POST method):", emailError)
        // Don't fail the payment confirmation because of email issues
      }
    } else {
      console.warn("⚠️ Missing data for sending confirmation email (POST method)")
      console.warn("📋 Missing data details:", {
        hasParentEmail: !!enrollment?.student?.parent?.email,
        hasTeam: !!enrollment?.team,
        hasStudent: !!enrollment?.student,
        parentEmail: enrollment?.student?.parent?.email || 'MISSING',
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      paymentDetails: {
        amount: (session.amount_total || 0) / 100,
        teamName: enrollment?.team?.name || "Unknown Team",
        studentName: `${enrollment?.student?.firstname || ""} ${enrollment?.student?.lastname || ""}`.trim(),
        date: paymentData.date,
      },
    })
  } catch (error) {
    console.error("❌ Payment confirmation error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
