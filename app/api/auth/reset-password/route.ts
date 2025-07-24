import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { password, access_token, refresh_token } = await request.json()

    // Validate required fields
    if (!password || !access_token || !refresh_token) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    console.log("🔄 Resetting password...")

    // Set the session using the tokens from the URL
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (sessionError) {
      console.error("❌ Session error:", sessionError)
      return NextResponse.json({ message: "Invalid or expired reset link" }, { status: 400 })
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error("❌ Password update error:", updateError)
      return NextResponse.json({ message: "Failed to update password" }, { status: 500 })
    }

    console.log("✅ Password reset successfully")

    return NextResponse.json({
      message: "Password updated successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("❌ Reset password error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
