import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Database service not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const enrollmentId = searchParams.get("enrollment_id")

    if (!sessionId) {
      return NextResponse.redirect(new URL("/payment/cancel?error=missing_session", request.url))
    }

    console.log("🔄 Processing payment confirmation for session:", sessionId)

    // Check if this is a development/mock session
    if (sessionId.startsWith("mock_")) {
      console.log("🛠 Processing mock payment confirmation")

      // Redirect to main page with success message
      const successUrl = new URL("/", request.url)
      successUrl.searchParams.set("enrollment", "success")
      successUrl.searchParams.set("mock", "true")
      return NextResponse.redirect(successUrl)
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
      return NextResponse.redirect(new URL("/payment/cancel?error=payment_not_completed", request.url))
    }

    // Extract enrollment ID from metadata or URL parameter
    const finalEnrollmentId = session.metadata?.enrollmentId || enrollmentId
    if (!finalEnrollmentId) {
      console.error("❌ No enrollment ID found")
      return NextResponse.redirect(new URL("/payment/cancel?error=missing_enrollment", request.url))
    }

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

    console.log("✅ Payment confirmed and recorded successfully")

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
