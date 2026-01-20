import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { message: "No authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code, percentage } = await request.json()

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { message: "Code is required" },
        { status: 400 }
      )
    }

    if (percentage === undefined || percentage === null || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { message: "Percentage must be between 0 and 100" },
        { status: 400 }
      )
    }

    const codeUpper = code.trim().toUpperCase()

    const { data: existingCoupon } = await supabaseAdmin
      .from("coupon")
      .select("couponid")
      .eq("code", codeUpper)
      .single()

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 409 }
      )
    }

    const { data: newCoupon, error: insertError } = await supabaseAdmin
      .from("coupon")
      .insert({
        code: codeUpper,
        percentage: percentage,
        isactive: true
      })
      .select()
      .single()

    if (insertError) {
      console.error("❌ Error creating coupon:", insertError)
      return NextResponse.json(
        { message: "Error creating coupon", error: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      coupon: newCoupon,
      message: "Coupon created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("❌ Create coupon error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
