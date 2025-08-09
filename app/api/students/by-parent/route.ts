import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ message: "Parent ID is required" }, { status: 400 })
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    console.log("Fetching students for parent:", parentId)

    // Get all students for this parent
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("student")
      .select("*")
      .eq("parentid", parentId)
      .order("firstname", { ascending: true })

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
      return NextResponse.json(
        {
          message: "Failed to fetch students",
          error: studentsError.message,
        },
        { status: 500 },
      )
    }

    console.log("Found students:", students?.length || 0)

    return NextResponse.json({
      students: students || [],
      count: students?.length || 0
    })
  } catch (error) {
    console.error("Error fetching students by parent:", error)
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}