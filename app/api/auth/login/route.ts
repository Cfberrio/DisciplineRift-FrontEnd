import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("🔄 Login attempt for:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if user is already logged in
    const {
      data: { session: existingSession },
    } = await supabase.auth.getSession()

    if (existingSession?.user) {
      console.log("ℹ️ User already logged in:", existingSession.user.id)

      // Create admin client for database operations
      // use service-role key when available, otherwise fall back to anon key
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        },
      )

      // Get or create parent record
      let { data: parentData, error: parentError } = await supabaseAdmin
        .from("parent")
        .select("*")
        .eq("parentid", existingSession.user.id)
        .single()

      if (parentError && parentError.code === "PGRST116") {
        // Parent record doesn't exist, create it
        console.log("🔄 Creating parent record for existing user...")
        const { data: newParentData, error: createError } = await supabaseAdmin
          .from("parent")
          .insert({
            parentid: existingSession.user.id,
            firstname: existingSession.user.user_metadata?.firstName || "",
            lastname: existingSession.user.user_metadata?.lastName || "",
            email: existingSession.user.email || "",
            phone: existingSession.user.user_metadata?.phone || "",
          })
          .select()
          .single()

        if (createError) {
          console.error("❌ Failed to create parent record:", createError)
        } else {
          parentData = newParentData
          console.log("✅ Parent record created for existing user")
        }
      }

      return NextResponse.json({
        alreadyLoggedIn: true,
        user: {
          id: existingSession.user.id,
          email: existingSession.user.email,
          firstName: parentData?.firstname || existingSession.user.user_metadata?.firstName || "",
          lastName: parentData?.lastname || existingSession.user.user_metadata?.lastName || "",
          phone: parentData?.phone || existingSession.user.user_metadata?.phone || "",
        },
        session: existingSession,
      })
    }

    // Attempt to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("❌ Login error:", authError)

      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
      }

      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { message: "Please check your email and confirm your account before logging in" },
          { status: 401 },
        )
      }

      return NextResponse.json({ message: authError.message || "Login failed" }, { status: 401 })
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json({ message: "Login failed - no user data returned" }, { status: 500 })
    }

    console.log("✅ User logged in successfully:", authData.user.id)

    // Create admin client for database operations
    // use service-role key when available, otherwise fall back to anon key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    )

    // Get or create parent record
    let { data: parentData, error: parentError } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", authData.user.id)
      .single()

    if (parentError && parentError.code === "PGRST116") {
      // Parent record doesn't exist, create it using upsert
      console.log("🔄 Creating parent record for user:", authData.user.id)

      const { data: newParentData, error: upsertError } = await supabaseAdmin
        .from("parent")
        .upsert({
          parentid: authData.user.id,
          firstname: authData.user.user_metadata?.firstName || "",
          lastname: authData.user.user_metadata?.lastName || "",
          email: authData.user.email || "",
          phone: authData.user.user_metadata?.phone || "",
        })
        .select()
        .single()

      if (upsertError) {
        console.error("❌ Failed to create parent record:", upsertError)
        // Continue with login even if parent record creation fails
      } else {
        parentData = newParentData
        console.log("✅ Parent record created successfully")
      }
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: parentData?.firstname || authData.user.user_metadata?.firstName || "",
        lastName: parentData?.lastname || authData.user.user_metadata?.lastName || "",
        phone: parentData?.phone || authData.user.user_metadata?.phone || "",
      },
      session: authData.session,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ message: "An unexpected error occurred during login" }, { status: 500 })
  }
}
