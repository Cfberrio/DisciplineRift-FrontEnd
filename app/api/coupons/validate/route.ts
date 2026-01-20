import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { message: "Code is required", valid: false },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const codeUpper = code.trim().toUpperCase()

    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupon")
      .select("*")
      .eq("code", codeUpper)
      .eq("isactive", true)
      .single()

    if (couponError || !coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or inactive coupon code"
      })
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        couponid: coupon.couponid,
        code: coupon.code,
        percentage: coupon.percentage
      },
      message: "Coupon is valid"
    })

  } catch (error) {
    console.error("❌ Validate coupon error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred", valid: false },
      { status: 500 }
    )
  }
}
