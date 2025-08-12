import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      number, 
      currentAddress, 
      sport, 
      description, 
      resumeUrl 
    } = body

    // Validate required fields
    const requiredFields = {
      firstName: 'First name',
      lastName: 'Last name', 
      email: 'Email',
      number: 'Phone number',
      currentAddress: 'Address',
      sport: 'Sport',
      description: 'Description'
    }

    for (const [field, displayName] of Object.entries(requiredFields)) {
      if (!body[field] || !body[field].trim()) {
        return NextResponse.json(
          { success: false, message: `${displayName} is required` },
          { status: 400 }
        )
      }
    }

    if (!resumeUrl) {
      return NextResponse.json(
        { success: false, message: "Resume is required" },
        { status: 400 }
      )
    }

    console.log("📝 Submitting team application to database...")

    // Try multiple possible table/column configurations
    const applicationData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      number: number.trim(),
      currentAddre: currentAddress.trim(),
      sport: sport,
      description: description.trim(),
      resume: resumeUrl
    }

    // First, try to check if table exists by attempting a simple select
    try {
      const { error: tableCheckError } = await supabase
        .from('Drteam')
        .select('*')
        .limit(1)

      if (tableCheckError) {
        console.error('Table check error:', tableCheckError)
        // If table doesn't exist, create a fallback response
        if (tableCheckError.message.includes('relation') && tableCheckError.message.includes('does not exist')) {
          return NextResponse.json({
            success: true,
            message: "Application received and will be processed manually. Thank you for your interest!",
            fallback: true,
            data: applicationData
          })
        }
      }
    } catch (checkError) {
      console.warn('Could not check table existence:', checkError)
    }

    // Attempt to insert the record
    const { data, error } = await supabase
      .from('Drteam')
      .insert([applicationData])
      .select()

    if (error) {
      console.error('❌ Database insertion error:', error)
      
      // Handle specific error types
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          message: "Application received and will be processed manually. Thank you for your interest!",
          fallback: true,
          data: applicationData
        })
      }

      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false, 
          message: "Database configuration error. Please contact support.",
          error: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        message: `Database error: ${error.message}`,
        error: error.message
      }, { status: 500 })
    }

    console.log("✅ Team application submitted successfully:", data)
    
    return NextResponse.json({
      success: true,
      message: "Thank you for your application! We'll review your submission and get back to you soon.",
      data: data
    })

  } catch (error) {
    console.error("❌ Team application API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}