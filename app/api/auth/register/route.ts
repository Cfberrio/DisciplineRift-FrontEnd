import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json()

    console.log("🔄 Registration attempt for:", email)

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Clean and validate phone format - more flexible validation
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ message: "Phone number must be 10-11 digits" }, { status: 400 })
    }

    // If 11 digits, ensure it starts with 1 (US country code)
    if (cleanPhone.length === 11 && !cleanPhone.startsWith("1")) {
      return NextResponse.json({ message: "11-digit phone numbers must start with 1" }, { status: 400 })
    }

    // Use the last 10 digits for storage (remove country code if present)
    const phoneForStorage = cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          phone: phoneForStorage,
        },
      },
    })

    if (authError) {
      console.error("❌ Auth registration error:", authError)

      if (authError.message.includes("already registered")) {
        return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 })
      }

      return NextResponse.json({ message: authError.message || "Registration failed" }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ message: "Failed to create user account" }, { status: 500 })
    }

    console.log("✅ Auth user created:", authData.user.id)

    // Create parent record using admin client to bypass RLS
    try {
      // Create admin client for database operations
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        },
      )

      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("parent")
        .upsert({
          parentid: authData.user.id,
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phoneForStorage,
        })
        .select()
        .single()

      if (parentError) {
        console.error("❌ Parent record creation error:", parentError)
        // Don't fail the registration if parent record creation fails
        // The login API will handle creating it later
        console.log("⚠️ Parent record will be created on first login")
      } else {
        console.log("✅ Parent record created successfully:", parentData.parentid)
      }
    } catch (parentCreationError) {
      console.error("❌ Parent record creation exception:", parentCreationError)
      // Continue with registration even if parent record fails
    }

    // Check if email confirmation is required
    if (!authData.session) {
      return NextResponse.json({
        message:
          "Registration successful! Please check your email and click the confirmation link to activate your account.",
        requiresEmailConfirmation: true,
        userId: authData.user.id,
      })
    }

    // If no email confirmation required, return success with session
    return NextResponse.json({
      message: "Registration successful!",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        phone: phoneForStorage,
      },
      session: authData.session,
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({ message: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
