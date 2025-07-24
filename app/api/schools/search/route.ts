import { type NextRequest, NextResponse } from "next/server"
import { searchTeamsAndSchools } from "@/lib/supabase-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    console.log(`[SERVER] 🔍 Searching schools with query: "${query}"`)

    if (!query.trim()) {
      return NextResponse.json({
        schools: [],
        message: "No search query provided",
      })
    }

    const result = await searchTeamsAndSchools(query)

    console.log(`[SERVER] ✅ Search returned ${result.schools.length} schools`)

    return NextResponse.json({
      schools: result.schools,
      query: query,
      count: result.schools.length,
    })
  } catch (error) {
    console.error("[SERVER] ❌ Error searching schools:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: "Failed to search schools",
        details: errorMessage,
        schools: [],
      },
      { status: 500 },
    )
  }
}
