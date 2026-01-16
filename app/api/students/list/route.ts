import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { message: "No authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // Get students with enrollments for this parent
    const { data: studentsData, error: studentsError } = await supabaseAdmin
      .from("student")
      .select(`
        *,
        enrollment (
          enrollmentid,
          isactive,
          created_at,
          team (
            teamid,
            name,
            description,
            sport,
            status,
            school (
              name,
              location
            ),
            session (
              sessionid,
              startdate,
              enddate,
              starttime,
              endtime,
              daysofweek,
              staff (
                name,
                email,
                phone
              )
            )
          )
        )
      `)
      .eq("parentid", user.id)
      .order("firstname", { ascending: true })

    if (studentsError) {
      console.error("❌ Error fetching students:", studentsError)
      return NextResponse.json(
        { message: "Error fetching students", error: studentsError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      students: studentsData || []
    })

  } catch (error) {
    console.error("❌ List students error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
