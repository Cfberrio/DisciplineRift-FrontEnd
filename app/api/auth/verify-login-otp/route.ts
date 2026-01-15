import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    console.log("🔄 Verifying login OTP for:", email);

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { message: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // Usar la función integrada de Supabase para verificar OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("❌ OTP verification error:", error);
      return NextResponse.json(
        { message: "Invalid or expired login code" },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      console.error("❌ No user or session after OTP verification");
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 500 }
      );
    }

    // Crear cliente admin para operaciones de base de datos
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // Verificar si existe registro de padre y crearlo si no existe
    let parentData = null;
    try {
      const { data: existingParent, error: parentError } = await supabaseAdmin
        .from("parent")
        .select("*")
        .eq("parentid", data.user.id)
        .single();

      if (parentError && parentError.code === "PGRST116") {
        // Parent record doesn't exist, create it
        console.log("🔄 Creating parent record for user:", data.user.id);

        const { data: newParentData, error: createError } = await supabaseAdmin
          .from("parent")
          .insert({
            parentid: data.user.id,
            firstname: data.user.user_metadata?.firstName || "",
            lastname: data.user.user_metadata?.lastName || "",
            email: data.user.email || "",
            phone: data.user.user_metadata?.phone || "",
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Failed to create parent record:", createError);
        } else {
          parentData = newParentData;
          console.log("✅ Parent record created successfully");
        }
      } else if (!parentError) {
        parentData = existingParent;
        console.log("✅ Parent record found");
      }
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError);
    }

    // Verificar que el padre tenga al menos un estudiante registrado
    console.log("🔄 Checking if parent has registered students...");
    try {
      const { data: students, error: studentsError } = await supabaseAdmin
        .from("student")
        .select("studentid")
        .eq("parentid", data.user.id)
        .limit(1);

      if (studentsError) {
        console.error("❌ Error checking students:", studentsError);
        return NextResponse.json(
          { message: "Error verifying account access" },
          { status: 500 }
        );
      }

      if (!students || students.length === 0) {
        console.log("❌ No students found for parent:", data.user.id);
        return NextResponse.json(
          { 
            message: "No students found. Please complete registration first at /register",
            noStudents: true
          },
          { status: 403 }
        );
      }

      console.log("✅ Parent has registered student(s)");
    } catch (studentCheckError) {
      console.error("❌ Student verification failed:", studentCheckError);
      return NextResponse.json(
        { message: "Error verifying account access" },
        { status: 500 }
      );
    }

    console.log("✅ User authenticated successfully:", data.user.id);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName:
          parentData?.firstname || data.user.user_metadata?.firstName || "",
        lastName:
          parentData?.lastname || data.user.user_metadata?.lastName || "",
        phone: parentData?.phone || data.user.user_metadata?.phone || "",
      },
      session: data.session,
    });
  } catch (error) {
    console.error("❌ Verify login OTP error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
