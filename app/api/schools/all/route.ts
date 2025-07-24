import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getAllSchoolsTeamsAndSessions } from "@/lib/supabase-queries"

export async function GET() {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.error("❌ Supabase not configured for schools API")
      return NextResponse.json(
        {
          message: "Service temporarily unavailable",
          error: "Database service not configured",
          schools: [],
        },
        { status: 503 },
      )
    }

    console.log("[SERVER] 🔄 Fetching all schools with teams and sessions...")

    const result = await getAllSchoolsTeamsAndSessions()

    if (!result || !result.schools) {
      console.log("[SERVER] ⚠️ No schools data returned from query")
      return NextResponse.json({
        schools: [],
        message: "No schools found",
      })
    }

    console.log(`[SERVER] ✅ Successfully fetched ${result.schools.length} schools`)

    return NextResponse.json({
      schools: result.schools,
      count: result.schools.length,
    })
  } catch (error) {
    console.error("[SERVER] ❌ Error fetching schools:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: "Failed to fetch schools data",
        details: errorMessage,
        schools: [], // Provide empty array as fallback
      },
      { status: 500 },
    )
  }
}

// Helper function to generate session instances
function generateSessionInstances(session: any) {
  const instances = []
  const startDate = new Date(session.startdate)
  const endDate = new Date(session.enddate)
  const daysOfWeek = session.daysofweek ? session.daysofweek.split(",") : []

  const currentDate = new Date(startDate)
  let sessionCount = 0

  while (currentDate <= endDate && sessionCount < 20) {
    const dayOfWeek = currentDate.getDay()
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]

    if (daysOfWeek.includes(dayName)) {
      instances.push({
        id: `${session.sessionid}-${sessionCount}`,
        dayOfWeek: dayName,
        time: `${session.starttime} - ${session.endtime}`,
        duration: "90 minutes",
        location: "School Gymnasium",
        startDate: session.startdate,
        endDate: session.enddate,
        formattedDate: currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        coachName: session.staff?.name || "TBD",
      })
      sessionCount++
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return instances
}
