import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing Drteam table connection...")
    
    // Test if we can connect to Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('Drteam')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('Connection test failed:', connectionError)
      
      if (connectionError.message.includes('relation') && connectionError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          message: "Drteam table does not exist",
          error: connectionError.message,
          sqlScript: "Run the SQL script in lib/create-drteam-table.sql in your Supabase SQL Editor"
        })
      }
      
      return NextResponse.json({
        success: false,
        message: "Database connection error",
        error: connectionError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: "Drteam table is accessible",
      data: testConnection
    })

  } catch (error) {
    console.error("Test drteam API error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to test database connection",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST() {
  try {
    console.log("Testing Drteam table insertion...")
    
    const testData = {
      firstName: "Test",
      lastName: "Application",
      email: "test@example.com",
      number: "555-0123",
      currentAddre: "123 Test St",
      sport: "Volleyball",
      description: "This is a test application",
      resume: "test_resume.pdf"
    }

    const { data, error } = await supabase
      .from('Drteam')
      .insert([testData])
      .select()

    if (error) {
      console.error('Test insertion failed:', error)
      return NextResponse.json({
        success: false,
        message: "Test insertion failed",
        error: error.message
      })
    }

    // Clean up test data
    if (data && data.length > 0) {
      await supabase
        .from('Drteam')
        .delete()
        .eq('id', data[0].id)
    }

    return NextResponse.json({
      success: true,
      message: "Test insertion successful",
      data: data
    })

  } catch (error) {
    console.error("Test insertion API error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to test insertion",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}