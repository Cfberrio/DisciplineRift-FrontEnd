import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

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

// Sanitize string to prevent injection attacks
function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '').trim()
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: Request) {
  try {
    const { parentName, playerName, email, groupType, whatsappLink } = await request.json()

    console.log("🏈 Partner Program checkout request:", { parentName, playerName, email, groupType })

    // Validate required fields
    if (!parentName || !playerName || !email || !groupType || !whatsappLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate parent name
    if (parentName.trim().length < 2) {
      return NextResponse.json(
        { error: "Parent name must be at least 2 characters long" },
        { status: 400 }
      )
    }

    // Validate player name
    if (playerName.trim().length < 2) {
      return NextResponse.json(
        { error: "Player name must be at least 2 characters long" },
        { status: 400 }
      )
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Validate group type
    if (groupType !== "2-3" && groupType !== "4-5") {
      return NextResponse.json(
        { error: "Invalid group type" },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedParentName = sanitizeString(parentName)
    const sanitizedPlayerName = sanitizeString(playerName)
    const sanitizedEmail = email.trim().toLowerCase()

    // Check if Stripe is configured
    if (!stripe) {
      console.error("❌ Stripe not configured")
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
      )
    }

    // STEP 1: Insert into Partners_Program table with payment=false
    console.log("📝 Inserting partner record into database...")
    const { data: insertedRow, error: insertError } = await supabaseAdmin
      .from('Partners_Program')
      .insert([{
        parent_name: sanitizedParentName,
        player_name: sanitizedPlayerName,
        email: sanitizedEmail,
        payment: false,
      }])
      .select('id')
      .single()

    if (insertError) {
      console.error("❌ Database insertion error:", insertError)
      return NextResponse.json(
        { error: "Failed to save registration data" },
        { status: 500 }
      )
    }

    if (!insertedRow?.id) {
      console.error("❌ No ID returned from insertion")
      return NextResponse.json(
        { error: "Failed to create registration record" },
        { status: 500 }
      )
    }

    const partnerId = insertedRow.id
    console.log(`✅ Partner record created with ID: ${partnerId}`)

    // STEP 2: Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
                   "http://localhost:3000"

    console.log("💳 Creating Stripe Checkout Session...")
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Flag Football Partner Program",
              description: `Partner Resources Program for ${sanitizedPlayerName}`,
            },
            unit_amount: 5000, // $50.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/api/partner/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/partner-resources-${groupType}`,
      metadata: {
        partner_id: partnerId.toString(),
        parent_name: sanitizedParentName,
        player_name: sanitizedPlayerName,
        email: sanitizedEmail,
        group_type: groupType,
        whatsapp_link: whatsappLink,
      },
      customer_email: sanitizedEmail,
    })

    console.log("✅ Checkout session created:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error("❌ Partner checkout error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
