import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get authenticated user from authorization header
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
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // Optional: format YYYY-MM

    console.log("📅 Fetching schedule for parent:", user.id, "month:", month || "all")

    // Fetch all students with their enrollments and sessions
    const { data: students, error: studentsError } = await supabase
      .from("student")
      .select(`
        studentid,
        firstname,
        lastname,
        enrollment (
          enrollmentid,
          isactive,
          team (
            teamid,
            name,
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
              repeat,
              cancel,
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

    if (studentsError) {
      console.error("❌ Error fetching students:", studentsError)
      return NextResponse.json(
        { message: "Failed to fetch schedule data" },
        { status: 500 }
      )
    }

    // Process and format schedule events
    const scheduleEvents: any[] = []
    const today = new Date()

    students.forEach((student: any) => {
      student.enrollment?.forEach((enrollment: any) => {
        if (!enrollment.isactive) return // Only active enrollments

        enrollment.team?.session?.forEach((session: any) => {
          // Check if session is cancelled
          if (session.cancel) return

          const startDate = new Date(session.startdate)
          const endDate = new Date(session.enddate)

          // If month filter is provided, check if session overlaps with that month
          if (month) {
            const [year, monthNum] = month.split('-')
            const filterDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
            const filterEndDate = new Date(parseInt(year), parseInt(monthNum), 0)

            if (endDate < filterDate || startDate > filterEndDate) {
              return // Session doesn't overlap with filtered month
            }
          }

          // Parse days of week
          const daysArray = session.daysofweek.split(',').map((d: string) => d.trim())
          const dayMap: { [key: string]: number } = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6,
          }

          // Generate individual practice occurrences
          daysArray.forEach((dayName: string) => {
            const dayNum = dayMap[dayName]
            if (dayNum === undefined) return

            // Calculate all occurrences of this day between startDate and endDate
            let currentDate = new Date(startDate)
            
            // Move to first occurrence of this day
            while (currentDate.getDay() !== dayNum && currentDate <= endDate) {
              currentDate.setDate(currentDate.getDate() + 1)
            }

            // Add all occurrences
            while (currentDate <= endDate) {
              scheduleEvents.push({
                id: `${session.sessionid}-${currentDate.toISOString().split('T')[0]}`,
                sessionId: session.sessionid,
                studentId: student.studentid,
                studentName: `${student.firstname} ${student.lastname}`,
                teamId: enrollment.team.teamid,
                teamName: enrollment.team.name,
                schoolName: enrollment.team.school?.name || 'School TBD',
                location: enrollment.team.school?.location || 'Location TBD',
                date: currentDate.toISOString().split('T')[0],
                dayOfWeek: dayName,
                startTime: session.starttime,
                endTime: session.endtime,
                coach: session.staff ? {
                  name: session.staff.name,
                  email: session.staff.email,
                  phone: session.staff.phone,
                } : {
                  name: 'Coach TBD',
                  email: '',
                  phone: '',
                },
                isPast: currentDate < today,
              })

              // Move to next week
              currentDate.setDate(currentDate.getDate() + 7)
            }
          })
        })
      })
    })

    // Sort by date
    scheduleEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log(`✅ Found ${scheduleEvents.length} schedule events`)

    return NextResponse.json({
      success: true,
      events: scheduleEvents,
      count: scheduleEvents.length,
    })

  } catch (error) {
    console.error("❌ Schedule API error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
