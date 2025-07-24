import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: Request) {
  try {
    const { teamId, enrollmentId, amount, description } = await request.json()

    console.log("🔄 Creating checkout session:", { teamId, enrollmentId, amount, description })

    // Validate required fields
    if (!teamId || !enrollmentId || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log("⚠️ Stripe not configured, using development mode")

      // Return mock session for development
      return NextResponse.json({
        sessionId: `mock_${Date.now()}`,
        isDevelopment: true,
        message: "Development mode - no real payment required",
      })
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "http://localhost:3000"

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || "Team Registration",
              description: `Registration for team ${teamId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/api/payment/confirm?session_id={CHECKOUT_SESSION_ID}&enrollment_id=${enrollmentId}`,
      cancel_url: `${baseUrl}/payment/cancel?enrollment_id=${enrollmentId}`,
      metadata: {
        teamId,
        enrollmentId,
      },
    })

    console.log("✅ Checkout session created:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("❌ Checkout session creation error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ message: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ message: "Failed to create checkout session" }, { status: 500 })
  }
}
