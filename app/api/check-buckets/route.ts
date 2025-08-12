import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Listar todos los buckets disponibles
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        buckets: []
      })
    }

    return NextResponse.json({
      success: true,
      buckets: buckets,
      message: "Buckets retrieved successfully"
    })

  } catch (error) {
    console.error("Error checking buckets:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      buckets: []
    })
  }
}