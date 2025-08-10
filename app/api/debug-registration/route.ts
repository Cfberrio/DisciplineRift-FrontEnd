import { NextResponse } from "next/server"
import { supabaseAdmin, validateAdminClientAccess } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    console.log("🔍 Debug registration endpoint called")
    
    // Validate admin client access
    const adminValidation = validateAdminClientAccess()
    console.log("🔍 Admin client validation:", adminValidation)
    
    if (!adminValidation.isValid) {
      return NextResponse.json({
        error: "Admin client not configured",
        details: adminValidation.error,
        debug: {
          supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      }, { status: 500 })
    }

    const { testType = "parent", ...testData } = await request.json()
    console.log("🔍 Test type:", testType)
    console.log("🔍 Test data:", testData)

    if (testType === "parent") {
      // Test parent creation
      const testParent = {
        parentid: testData.userId || "test-user-id",
        firstname: testData.firstName || "Test",
        lastname: testData.lastName || "Parent",
        email: testData.email || "test@example.com",
        phone: testData.phone || "1234567890"
      }

      console.log("🔍 Attempting to create test parent:", testParent)

      // Try to create parent
      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("parent")
        .insert(testParent)
        .select()
        .single()

      if (parentError) {
        console.error("❌ Parent creation error:", parentError)
        return NextResponse.json({
          success: false,
          error: "Parent creation failed",
          details: parentError,
          testData: testParent
        }, { status: 500 })
      }

      console.log("✅ Parent created successfully:", parentData)
      
      // Clean up - delete the test parent
      await supabaseAdmin
        .from("parent")
        .delete()
        .eq("parentid", testParent.parentid)

      return NextResponse.json({
        success: true,
        message: "Parent test successful",
        data: parentData
      })
    }

    if (testType === "student") {
      // Test student creation
      const testStudent = {
        parentid: testData.parentId || "test-parent-id",
        firstname: testData.firstName || "Test",
        lastname: testData.lastName || "Student",
        dob: testData.dob || "2010-01-01",
        grade: testData.grade || "5",
        ecname: testData.ecName || "Emergency Contact",
        ecphone: testData.ecPhone || "1234567890",
        ecrelationship: testData.ecRelationship || "Parent",
        StudentDismisall: testData.dismissal || "Car Rider"
      }

      console.log("🔍 Attempting to create test student:", testStudent)

      const { data: studentData, error: studentError } = await supabaseAdmin
        .from("student")
        .insert(testStudent)
        .select()
        .single()

      if (studentError) {
        console.error("❌ Student creation error:", studentError)
        return NextResponse.json({
          success: false,
          error: "Student creation failed",
          details: studentError,
          testData: testStudent
        }, { status: 500 })
      }

      console.log("✅ Student created successfully:", studentData)
      
      // Clean up - delete the test student
      await supabaseAdmin
        .from("student")
        .delete()
        .eq("studentid", studentData.studentid)

      return NextResponse.json({
        success: true,
        message: "Student test successful",
        data: studentData
      })
    }

    return NextResponse.json({
      error: "Invalid test type",
      availableTypes: ["parent", "student"]
    }, { status: 400 })

  } catch (error) {
    console.error("🔍 Debug registration error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Simple configuration check
    const adminValidation = validateAdminClientAccess()
    
    return NextResponse.json({
      message: "Debug registration endpoint",
      adminClientConfigured: adminValidation.isValid,
      adminClientError: adminValidation.error,
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}