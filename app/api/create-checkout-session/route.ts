import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"

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

// Server-side coupon validation
const validateCouponServer = (code: string): { isValid: boolean; percentage: number } => {
  if (!code) return { isValid: false, percentage: 0 };
  
  const normalizedCode = code.trim().toUpperCase();
  
  switch (normalizedCode) {
    case 'HALLO':
      return { isValid: true, percentage: 12 };
    case 'DISCIPLINE':
      return { isValid: true, percentage: 15 };
    case 'SIBLING':
      return { isValid: true, percentage: 10 };
    case 'FACULTY':
      return { isValid: true, percentage: 12 };
    case '50':
      return { isValid: true, percentage: 50 };
    case 'TRELLIS':
      return { isValid: true, percentage: 100 };
    default:
      return { isValid: false, percentage: 0 };
  }
};

export async function POST(request: Request) {
  try {
    const { teamId, enrollmentId, amount, description, couponCode } = await request.json()

    console.log("🔄 Creating checkout session:", { teamId, enrollmentId, amount, description, couponCode })

    // Validate required fields
    if (!teamId || !enrollmentId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Server-side price calculation with coupon validation
    console.log("🔍 Fetching team price from database for team:", teamId)
    
    // Get team price from database (source of truth)
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('team')
      .select('price')
      .eq('teamid', teamId)
      .single()

    if (teamError || !teamData) {
      console.error("❌ Error fetching team data:", teamError)
      return NextResponse.json({ message: "Team not found" }, { status: 404 })
    }

    const basePrice = teamData.price
    console.log("✅ Base price from database:", basePrice)

    // Validate coupon and calculate final amount
    let finalAmount = basePrice
    let discountAmount = 0
    let discountPercentage = 0
    let validatedCouponCode = null

    if (couponCode) {
      const couponValidation = validateCouponServer(couponCode)
      
      if (!couponValidation.isValid) {
        return NextResponse.json({ message: "Invalid coupon code" }, { status: 400 })
      }

      discountPercentage = couponValidation.percentage
      discountAmount = Math.round(basePrice * (discountPercentage / 100) * 100) / 100
      finalAmount = Math.max(0, basePrice - discountAmount)
      validatedCouponCode = couponCode.trim().toUpperCase()

      console.log("🎫 Coupon applied:", {
        code: validatedCouponCode,
        percentage: discountPercentage,
        discount: discountAmount,
        finalAmount
      })
    }

    // Validate final amount
    if (typeof finalAmount !== "number" || finalAmount < 0) {
      return NextResponse.json({ message: "Invalid calculated amount" }, { status: 400 })
    }

    // Check if Stripe is properly configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log("⚠️ Stripe not configured, using development mode")

      // Return mock session for development
      return NextResponse.json({
        sessionId: `mock_${Date.now()}`,
        isDevelopment: true,
        message: "Development mode - no real payment required",
        finalAmount,
        appliedCoupon: validatedCouponCode ? {
          code: validatedCouponCode,
          discount: discountAmount,
          percentage: discountPercentage
        } : null
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
              description: validatedCouponCode 
                ? `Registration for team ${teamId} (${validatedCouponCode} - ${discountPercentage}% off)`
                : `Registration for team ${teamId}`,
            },
            unit_amount: Math.round(finalAmount * 100), // Convert to cents
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
        coupon_code: validatedCouponCode || '',
        discount_percentage: discountPercentage.toString(),
        original_price: basePrice.toString(),
        final_price: finalAmount.toString(),
        discount_amount: discountAmount.toString(),
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
