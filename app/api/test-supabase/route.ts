import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    console.log("🔍 Testing Supabase configuration...")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const config = {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      url: supabaseUrl?.substring(0, 20) + "..." || "missing",
      anonKeyLength: anonKey?.length || 0,
      serviceKeyLength: serviceKey?.length || 0
    }
    
    console.log("🔍 Config check:", config)
    
    // Test with anon key
    const supabaseAnon = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Try a simple read operation with anon key
    const { data: anonData, error: anonError } = await supabaseAnon
      .from("parent")
      .select("parentid")
      .limit(1)
    
    let anonTest = { success: false, error: "Unknown" }
    if (anonError) {
      anonTest = { success: false, error: anonError.message }
    } else {
      anonTest = { success: true, error: null }
    }
    
    console.log("🔍 Anon key test:", anonTest)
    
    // Test with service key (if available)
    let serviceTest = { success: false, error: "No service key" }
    if (serviceKey) {
      const supabaseService = createClient(supabaseUrl!, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      
      const { data: serviceData, error: serviceError } = await supabaseService
        .from("parent")
        .select("parentid")
        .limit(1)
      
      if (serviceError) {
        serviceTest = { success: false, error: serviceError.message }
      } else {
        serviceTest = { success: true, error: null }
      }
    }
    
    console.log("🔍 Service key test:", serviceTest)
    
    return NextResponse.json({
      message: "Supabase configuration test",
      config,
      tests: {
        anonKey: anonTest,
        serviceKey: serviceTest
      }
    })
    
  } catch (error) {
    console.error("🔍 Test error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { testType = "insert" } = await request.json()
    
    console.log("🔍 Testing database operations...")
    
    // Use service key for write operations
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({
        error: "Service key not configured",
        message: "SUPABASE_SERVICE_ROLE_KEY is required for write operations"
      }, { status: 500 })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    if (testType === "insert") {
      // Test parent insertion
      const testParent = {
        parentid: `test-${Date.now()}`,
        firstname: "Test",
        lastname: "Parent",
        email: "test@example.com",
        phone: "1234567890"
      }
      
      console.log("🔍 Testing parent insert:", testParent)
      
      const { data, error } = await supabase
        .from("parent")
        .insert(testParent)
        .select()
        .single()
      
      if (error) {
        console.error("❌ Insert failed:", error)
        return NextResponse.json({
          success: false,
          error: "Insert failed",
          details: error,
          testData: testParent
        }, { status: 500 })
      }
      
      console.log("✅ Insert successful:", data)
      
      // Clean up - delete test record
      await supabase.from("parent").delete().eq("parentid", testParent.parentid)
      
      return NextResponse.json({
        success: true,
        message: "Insert test successful",
        data: data
      })
    }
    
    return NextResponse.json({
      error: "Invalid test type"
    }, { status: 400 })
    
  } catch (error) {
    console.error("🔍 POST test error:", error)
    return NextResponse.json({
      error: "POST test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}