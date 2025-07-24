import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Database service not configured" }, { status: 503 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Session ID is required" }, { status: 400 })
    }

    console.log("🔄 Processing payment cancellation for session:", sessionId)

    // Check if this is a development/mock session
    if (sessionId.startsWith("mock_")) {
      console.log("🛠 Processing mock payment cancellation")
      return NextResponse.json({
        success: true,
        message: "Payment cancelled (Development Mode)",
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
    })

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
      console.log("⚠️ Payment record already exists, not creating cancellation record")
      return NextResponse.json({
        success: true,
        message: "Payment session already processed",
      })
    }

    // Only create cancellation record if payment was actually cancelled
    if (session.payment_status === "unpaid") {
      const { error: paymentError } = await supabase.from("payment").insert({
        enrollmentid: enrollmentId,
        amount: (session.amount_total || 0) / 100,
        status: "cancelled",
        stripe_session_id: sessionId,
        date: new Date().toISOString(),
      })

      if (paymentError) {
        console.error("❌ Payment cancellation record error:", paymentError)
        return NextResponse.json({ success: false, message: "Failed to record cancellation" }, { status: 500 })
      }

      console.log("✅ Payment cancellation recorded successfully")
    }

    return NextResponse.json({
      success: true,
      message: "Payment was cancelled. Your registration is saved and you can complete payment later.",
    })
  } catch (error) {
    console.error("❌ Payment cancellation error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
