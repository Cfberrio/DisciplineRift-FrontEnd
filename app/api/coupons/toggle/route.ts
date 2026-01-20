import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(request: Request) {
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

    const { couponid, isactive } = await request.json()

    if (!couponid) {
      return NextResponse.json(
        { message: "Coupon ID is required" },
        { status: 400 }
      )
    }

    if (typeof isactive !== "boolean") {
      return NextResponse.json(
        { message: "isactive must be a boolean" },
        { status: 400 }
      )
    }

    const { data: updatedCoupon, error: updateError } = await supabaseAdmin
      .from("coupon")
      .update({ isactive })
      .eq("couponid", couponid)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error toggling coupon:", updateError)
      return NextResponse.json(
        { message: "Error toggling coupon", error: updateError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      coupon: updatedCoupon,
      message: `Coupon ${isactive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error("❌ Toggle coupon error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
