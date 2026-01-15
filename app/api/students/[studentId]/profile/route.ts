import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { calculateAge } from "@/lib/dashboard-utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
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

    // Unwrap params Promise (Next.js 16 requirement)
    const { studentId } = await params

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // Get student with full profile info
    const { data: studentData, error: studentError } = await supabaseAdmin
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
            school (
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
              coachid,
              staff (
                id,
                name,
                email,
                phone
              )
            )
          )
        )
      `)
      .eq("studentid", studentId)
      .eq("parentid", user.id) // Ensure parent owns this student
      .single()

    if (studentError || !studentData) {
      console.error("❌ Error fetching student profile:", studentError)
      return NextResponse.json(
        { message: "Student not found or unauthorized", error: studentError },
        { status: 404 }
      )
    }

    // Calculate age
    const age = calculateAge(studentData.dob)

    // Process enrollments - group by sport
    const activeEnrollments = (studentData.enrollment || [])
      .filter((e: any) => e.isactive)

    // Get all attendance records for this student
    const { data: attendanceRecords, error: attendanceError } = await supabaseAdmin
      .from("assistance")
      .select("id, sessionid, date, assisted")
      .eq("studentid", studentId)

    if (attendanceError) {
      console.error("⚠️ Error fetching attendance:", attendanceError)
    }

    // Create a map of sessionId -> attendance records for quick lookup
    const attendanceBySession = new Map<string, Array<{ assisted: boolean; date: string }>>()
    if (attendanceRecords) {
      attendanceRecords.forEach(record => {
        if (!attendanceBySession.has(record.sessionid)) {
          attendanceBySession.set(record.sessionid, [])
        }
        attendanceBySession.get(record.sessionid)!.push({
          assisted: record.assisted,
          date: record.date
        })
      })
    }

    // Get unique sports with their team and coach info
    const sportEnrollments = activeEnrollments.map((enrollment: any) => {
      const team = enrollment.team
      const sessions = team?.session || []
      const coaches = sessions
        .map((s: any) => s.staff)
        .filter((staff: any) => staff !== null)
      
      // Get unique coaches
      const uniqueCoaches = Array.from(
        new Map(coaches.map((c: any) => [c.id, c])).values()
      )

      // Calculate real attendance from assistance table
      let totalPractices = 0
      let attended = 0

      sessions.forEach((session: any) => {
        const sessionAttendance = attendanceBySession.get(session.sessionid) || []
        totalPractices += sessionAttendance.length
        attended += sessionAttendance.filter(a => a.assisted).length
      })

      // Calculate percentage (default to 100% if no records - assumes perfect attendance)
      const percentage = totalPractices > 0 
        ? Math.round((attended / totalPractices) * 100) 
        : 100

      const attendance = {
        totalPractices,
        attended,
        percentage
      }

      return {
        enrollmentId: enrollment.enrollmentid,
        sport: team?.sport || 'Unknown',
        teamName: team?.name || 'Unknown Team',
        teamDescription: team?.description,
        school: team?.school ? {
          id: team.school.schoolid,
          name: team.school.name,
          location: team.school.location
        } : null,
        coaches: uniqueCoaches,
        attendance,
        enrolledSince: enrollment.created_at,
        // Tier comes from student.Level column (not calculated from attendance)
        currentTier: studentData.Level || 1
      }
    })

    // Build complete profile
    const profile = {
      student: {
        id: studentData.studentid,
        firstName: studentData.firstname,
        lastName: studentData.lastname,
        fullName: `${studentData.firstname} ${studentData.lastname}`,
        dob: studentData.dob,
        age,
        grade: studentData.grade,
        teacher: studentData.teacher,
        uniformSize: studentData.uniform_size,
        emergencyContact: {
          name: studentData.ecname,
          phone: studentData.ecphone,
          relationship: studentData.ecrelationship
        },
        dismissal: studentData.StudentDismisall,
        medicalConditions: studentData.medcondition
      },
      enrollments: sportEnrollments,
      summary: {
        totalEnrollments: sportEnrollments.length,
        sports: sportEnrollments.map((e: any) => e.sport),
        overallAttendance: sportEnrollments.length > 0
          ? Math.round(
              sportEnrollments.reduce((sum: number, e: any) => sum + e.attendance.percentage, 0) / 
              sportEnrollments.length
            )
          : 0
      }
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error("❌ Get student profile error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred", error: String(error) },
      { status: 500 }
    )
  }
}
