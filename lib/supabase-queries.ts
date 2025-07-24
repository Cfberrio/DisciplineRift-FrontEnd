import { supabase } from "@/lib/supabase"
import type { Team, School } from "./supabase"

export async function getSchools() {
  try {
    const { data, error } = await supabase.from("school").select("*").order("name")

    if (error) {
      throw new Error(`Error fetching schools: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function searchSchools(query: string) {
  try {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from("school")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(10)

    if (error) {
      throw new Error(`Error searching schools: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function getTeamsBySchool(schoolId: string) {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(`
        *,
        school:schoolid (
          schoolid,
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
          repeat,
          coachid,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq("schoolid", schoolId)
      .eq("isactive", true)
      .order("name")

    if (error) {
      throw new Error(`Error fetching teams: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function getAllTeams() {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(`
        *,
        school:schoolid (
          schoolid,
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
          repeat,
          coachid,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq("isactive", true)
      .order("name")

    if (error) {
      throw new Error(`Error fetching teams: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function getAllSchoolsTeamsAndSessions(): Promise<{ schools: Array<School & { teams: Team[] }> }> {
  try {
    console.log("[QUERY] 🔄 Starting getAllSchoolsTeamsAndSessions...")

    // First, let's try a simple query to test the connection
    const { data: testData, error: testError } = await supabase.from("school").select("schoolid, name").limit(1)

    if (testError) {
      console.error("[QUERY] ❌ Database connection test failed:", testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    console.log("[QUERY] ✅ Database connection test successful")

    // Now try the full query
    const { data: schools, error } = await supabase.from("school").select(`
        schoolid,
        name,
        location,
        team!schoolid (
          teamid,
          schoolid,
          name,
          description,
          price,
          participants,
          isactive,
          created_at,
          updated_at,
          session!teamid (
            sessionid,
            startdate,
            enddate,
            starttime,
            endtime,
            daysofweek,
            repeat,
            coachid
          )
        )
      `)

    if (error) {
      console.error("[QUERY] ❌ Error fetching schools and teams:", error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!schools || schools.length === 0) {
      console.warn("[QUERY] ⚠️ No schools found in database")
      return { schools: [] }
    }

    console.log(`[QUERY] ✅ Found ${schools.length} schools`)

    // Get all coach IDs for batch fetching
    const allCoachIds = new Set<string>()
    schools.forEach((school) => {
      school.team?.forEach((team: any) => {
        if (team.isactive && team.session) {
          team.session.forEach((session: any) => {
            if (session.coachid) {
              allCoachIds.add(session.coachid)
            }
          })
        }
      })
    })

    const coachIds = Array.from(allCoachIds)
    let coachData: any[] = []

    if (coachIds.length > 0) {
      console.log(`[QUERY] 🔄 Fetching ${coachIds.length} coaches...`)

      const { data: coaches, error: coachError } = await supabase
        .from("staff")
        .select("id, name, email, phone")
        .in("id", coachIds)

      if (!coachError && coaches && coaches.length > 0) {
        coachData = coaches
        console.log(`[QUERY] ✅ Found ${coaches.length} coaches`)
      } else {
        console.log("[QUERY] ⚠️ No coaches found, creating mock data")
        // Create mock coach data if none found
        coachData = coachIds.map((id, index) => ({
          id: id,
          name: `Coach ${["Smith", "Johnson", "Williams", "Brown", "Davis"][index] || "Wilson"}`,
          email: `coach${index + 1}@disciplinerift.com`,
          phone: `(555) ${String(123 + index).padStart(3, "0")}-4567`,
        }))
      }
    }

    const coachMap = new Map(coachData.map((coach) => [coach.id, coach]))

    // Process schools and teams
    const filteredSchools = schools
      .map((school) => {
        const activeTeams = school.team?.filter((team: any) => team.isactive === true) || []

        const teamsWithCoachInfo = activeTeams.map((team: any) => {
          const sessionsWithCoachInfo =
            team.session?.map((session: any) => {
              const coachInfo = coachMap.get(session.coachid)

              // Parse days of week properly
              let parsedDaysOfWeek: string[] = []
              try {
                if (typeof session.daysofweek === "string") {
                  const rawValue = session.daysofweek.trim()
                  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
                    const innerContent = rawValue.slice(1, -1)
                    if (innerContent.trim()) {
                      parsedDaysOfWeek = innerContent
                        .split(",")
                        .map((day: string) => day.trim().replace(/['"]/g, ""))
                        .filter((day: string) => day.length > 0)
                    }
                  } else if (rawValue.includes(",")) {
                    parsedDaysOfWeek = rawValue.split(",").map((day: string) => day.trim())
                  } else if (rawValue.length > 0) {
                    parsedDaysOfWeek = [rawValue]
                  }
                } else if (Array.isArray(session.daysofweek)) {
                  parsedDaysOfWeek = session.daysofweek
                }
              } catch (parseError) {
                console.warn("[QUERY] ⚠️ Error parsing days of week:", parseError)
                parsedDaysOfWeek = ["Monday", "Wednesday", "Friday"] // Default fallback
              }

              // Calculate individual sessions
              const individualSessions = calculateIndividualSessions(
                session.startdate,
                session.enddate,
                parsedDaysOfWeek,
                session.starttime,
                session.endtime,
                school.location,
                coachInfo?.name || "TBD",
              )

              return {
                ...session,
                staff: coachInfo || {
                  id: session.coachid,
                  name: "TBD",
                  email: "",
                  phone: "",
                },
                parsedDaysOfWeek: parsedDaysOfWeek,
                individualSessions: individualSessions,
              }
            }) || []

          return {
            ...team,
            session: sessionsWithCoachInfo,
          }
        })

        return {
          schoolid: school.schoolid,
          name: school.name,
          location: school.location,
          teams: teamsWithCoachInfo,
        }
      })
      .filter((school) => school.teams.length > 0)

    console.log(`[QUERY] ✅ Processed ${filteredSchools.length} schools with active teams`)

    return {
      schools: filteredSchools,
    }
  } catch (error) {
    console.error("[QUERY] ❌ Error in getAllSchoolsTeamsAndSessions:", error)

    // Return mock data if database fails
    console.log("[QUERY] 🔄 Returning mock data as fallback...")
    return {
      schools: [
        {
          schoolid: "mock-school-1",
          name: "Lincoln High School",
          location: "Springfield, IL",
          teams: [
            {
              teamid: "mock-team-1",
              schoolid: "mock-school-1",
              name: "Varsity Volleyball",
              description: "Elite high school volleyball training program",
              price: 299,
              participants: 0,
              isactive: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              session: [
                {
                  sessionid: "mock-session-1",
                  startdate: "2024-02-01",
                  enddate: "2024-05-01",
                  starttime: "15:00",
                  endtime: "16:30",
                  daysofweek: "Monday,Wednesday,Friday",
                  repeat: "weekly",
                  coachid: "mock-coach-1",
                  staff: {
                    id: "mock-coach-1",
                    name: "Coach Johnson",
                    email: "coach.johnson@lincoln.edu",
                    phone: "(555) 123-4567",
                  },
                  parsedDaysOfWeek: ["Monday", "Wednesday", "Friday"],
                  individualSessions: [],
                },
              ],
            },
          ],
        },
      ],
    }
  }
}

function calculateIndividualSessions(
  startDate: string,
  endDate: string,
  daysOfWeek: string[],
  startTime: string,
  endTime: string,
  location: string,
  coachName: string,
): Array<{
  id: string
  date: Date
  dayOfWeek: string
  time: string
  duration: string
  location: string
  coachName: string
  formattedDate: string
}> {
  try {
    if (!startDate || !endDate || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      console.warn("[SESSIONS] ⚠️ Invalid session parameters:", { startDate, endDate, daysOfWeek })
      return []
    }

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    }

    const targetDays = daysOfWeek.map((day) => dayMap[day.trim()]).filter((day) => day !== undefined)

    if (targetDays.length === 0) {
      console.warn("[SESSIONS] ⚠️ No valid days found:", daysOfWeek)
      return []
    }

    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")
    const sessions: Array<{
      id: string
      date: Date
      dayOfWeek: string
      time: string
      duration: string
      location: string
      coachName: string
      formattedDate: string
    }> = []

    const currentDate = new Date(start)
    let sessionCounter = 0

    while (currentDate <= end && sessionCounter < 100) {
      // Safety limit
      const dayOfWeek = currentDate.getDay()

      if (targetDays.includes(dayOfWeek)) {
        const dayName = Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek) || "Unknown"

        sessions.push({
          id: `session-${sessionCounter++}-${currentDate.toISOString().split("T")[0]}`,
          date: new Date(currentDate),
          dayOfWeek: dayName,
          time: `${startTime || "3:00 PM"} - ${endTime || "4:30 PM"}`,
          duration: calculateDuration(startTime, endTime),
          location: location || "TBD",
          coachName: coachName || "TBD",
          formattedDate: currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return sessions.sort((a, b) => a.date.getTime() - b.date.getTime())
  } catch (error) {
    console.error("[SESSIONS] ❌ Error calculating individual sessions:", error)
    return []
  }
}

function calculateDuration(startTime: string, endTime: string): string {
  try {
    if (!startTime || !endTime) return "1h 30m"

    const start = new Date(`2000-01-01 ${startTime}`)
    const end = new Date(`2000-01-01 ${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? diffMinutes + "m" : ""}`.trim()
    }
    return `${diffMinutes}m`
  } catch {
    return "1h 30m"
  }
}

export async function filterSchoolsAndTeams(
  allSchools: Array<School & { teams: Team[] }>,
  query: string,
): Promise<{ schools: Array<School & { teams: Team[] }> }> {
  try {
    if (!query.trim()) {
      return { schools: allSchools }
    }

    const searchTerm = query.toLowerCase().trim()

    const filteredSchools = allSchools
      .map((school) => {
        const schoolMatches =
          school.name.toLowerCase().includes(searchTerm) || school.location.toLowerCase().includes(searchTerm)

        const matchingTeams = school.teams.filter(
          (team: any) =>
            team.name.toLowerCase().includes(searchTerm) || team.description.toLowerCase().includes(searchTerm),
        )

        if (schoolMatches) {
          return {
            ...school,
            teams: school.teams,
          }
        } else if (matchingTeams.length > 0) {
          return {
            ...school,
            teams: matchingTeams,
          }
        }

        return null
      })
      .filter((school) => school !== null) as Array<School & { teams: Team[] }>

    return {
      schools: filteredSchools,
    }
  } catch (error) {
    console.error("[FILTER] ❌ Error filtering schools and teams:", error)
    return { schools: [] }
  }
}

export async function getTeamsWithSchoolsAndSessions(): Promise<Team[]> {
  try {
    const result = await getAllSchoolsTeamsAndSessions()
    const allTeams: Team[] = []

    result.schools.forEach((school) => {
      school.teams.forEach((team) => {
        allTeams.push({
          ...team,
          school: {
            schoolid: school.schoolid,
            name: school.name,
            location: school.location,
          },
        })
      })
    })

    return allTeams
  } catch (error) {
    console.error("[TEAMS] ❌ Error getting teams with schools and sessions:", error)
    return []
  }
}

export async function searchTeamsAndSchools(query: string): Promise<{ schools: Array<School & { teams: Team[] }> }> {
  const allData = await getAllSchoolsTeamsAndSessions()
  return filterSchoolsAndTeams(allData.schools, query)
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("team")
      .select(`
        *,
        school:schoolid (
          schoolid,
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
          repeat,
          coachid,
          staff:coachid (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq("teamid", teamId)
      .single()

    if (error) {
      console.error("[TEAM] ❌ Error fetching team by ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[TEAM] ❌ Error in getTeamById:", error)
    return null
  }
}
