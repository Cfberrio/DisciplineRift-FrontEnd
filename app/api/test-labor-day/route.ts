import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test endpoint working",
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  try {
    console.log("🧪 Test POST endpoint called")
    
    return NextResponse.json({
      success: true,
      message: "Test POST working",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in test POST:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

