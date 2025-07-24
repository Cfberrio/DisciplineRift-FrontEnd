import { NextResponse } from "next/server"
import Stripe from "stripe"

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const isStripeConfigured = !!stripeSecretKey

let stripe: Stripe | null = null

if (isStripeConfigured) {
  try {
    stripe = new Stripe(stripeSecretKey!, {
      apiVersion: "2024-06-20",
    })
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
  }
}

export async function POST(request: Request) {
  try {
    const { teamId, enrollmentId, amount, description } = await request.json()

    // Validate required fields
    if (!teamId || !enrollmentId || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.warn("Stripe not configured - returning mock payment intent for development")

      // Return a mock response for development/preview
      return NextResponse.json({
        clientSecret: "pi_mock_client_secret_for_development",
        paymentIntentId: "pi_mock_payment_intent",
        message: "This is a development environment. Stripe is not fully configured.",
        isDevelopment: true,
      })
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      description: description || `Team Registration - ${teamId}`,
      metadata: {
        teamId,
        enrollmentId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ message: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ message: "Failed to create payment intent" }, { status: 500 })
  }
}
