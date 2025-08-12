import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Try to get table structure by selecting with empty where clause
    const { data, error } = await supabase
      .from('Drteam')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Error accessing Drteam table",
        error: error.message,
        code: error.code
      })
    }

    // Get column names from the result (even if empty)
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    return NextResponse.json({
      success: true,
      message: "Drteam table accessible",
      columns: columns,
      sampleData: data,
      tableExists: true
    })

  } catch (error) {
    console.error("Check Drteam structure error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to check table structure",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}