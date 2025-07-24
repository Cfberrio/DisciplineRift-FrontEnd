import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get("token_hash")
    const type = searchParams.get("type")
    const next = searchParams.get("next") ?? "/"

    console.log("🔄 Email confirmation request:", { token_hash: !!token_hash, type, next })

    if (!token_hash || !type) {
      console.error("❌ Missing token_hash or type")
      return NextResponse.redirect(new URL("/auth/error?message=Invalid confirmation link", request.url))
    }

    // Verify the email confirmation token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      console.error("❌ Email confirmation error:", error)
      return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, request.url))
    }

    if (!data.user || !data.session) {
      console.error("❌ No user or session after confirmation")
      return NextResponse.redirect(new URL("/auth/error?message=Confirmation failed", request.url))
    }

    console.log("✅ Email confirmed successfully for user:", data.user.id)

    // Create parent record if it doesn't exist
    try {
      const { data: existingParent } = await supabase.from("parent").select("*").eq("parentid", data.user.id).single()

      if (!existingParent) {
        console.log("🔄 Creating parent record after email confirmation...")

        const firstName = data.user.user_metadata?.firstName || ""
        const lastName = data.user.user_metadata?.lastName || ""
        const phone = data.user.user_metadata?.phone || ""

        const { data: newParent, error: parentCreateError } = await supabase
          .from("parent")
          .insert({
            parentid: data.user.id,
            firstname: firstName,
            lastname: lastName,
            email: data.user.email,
            phone: phone,
          })
          .select()
          .single()

        if (parentCreateError) {
          console.error("❌ Error creating parent record:", parentCreateError)
        } else {
          console.log("✅ Parent record created after email confirmation")
        }
      }
    } catch (error) {
      console.error("❌ Exception during parent record creation:", error)
    }

    // Redirect to success page with session info
    const redirectUrl = new URL("/auth/confirmed", request.url)
    redirectUrl.searchParams.set("next", next)

    // Set session cookies
    const response = NextResponse.redirect(redirectUrl)

    // Set session in cookies for client-side access
    if (data.session) {
      response.cookies.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: data.session.expires_in,
      })
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return response
  } catch (error) {
    console.error("❌ Unexpected error in email confirmation:", error)
    return NextResponse.redirect(new URL("/auth/error?message=An unexpected error occurred", request.url))
  }
}
