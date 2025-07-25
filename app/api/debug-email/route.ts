import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyEmailConfiguration } from "@/lib/email-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get("enrollment_id")
    
    const report = {
      timestamp: new Date().toISOString(),
      emailConfiguration: {
        gmailUser: process.env.GMAIL_USER || "NOT_SET",
        gmailPasswordSet: !!process.env.GMAIL_APP_PASSWORD,
        nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
        nextPublicSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      enrollmentData: null as any,
      emailConfigTest: null as any,
    }

    // Test email configuration
    try {
      const emailTest = await verifyEmailConfiguration()
      report.emailConfigTest = emailTest
    } catch (error) {
      report.emailConfigTest = {
        configured: false,
        message: error instanceof Error ? error.message : "Unknown error"
      }
    }

    // If enrollment ID provided, check the data
    if (enrollmentId) {
      try {
        const { data: enrollment, error } = await supabase
          .from("enrollment")
          .select(`
            *,
            student:studentid (
              studentid,
              firstname,
              lastname,
              grade,
              ecname,
              ecphone,
              ecrelationship,
              parent:parentid (
                firstname,
                lastname,
                email
              )
            ),
            team:teamid (
              teamid,
              name,
              description,
              price,
              created_at,
              updated_at,
              school:schoolid (
                name,
                location
              ),
              session (
                startdate,
                enddate,
                starttime,
                endtime,
                daysofweek,
                staff:coachid (
                  name,
                  email,
                  phone
                )
              )
            )
          `)
          .eq("enrollmentid", enrollmentId)
          .single()

        if (error) {
          report.enrollmentData = { error: error.message }
        } else {
          report.enrollmentData = {
            found: true,
            hasStudent: !!enrollment?.student,
            hasParent: !!enrollment?.student?.parent,
            hasTeam: !!enrollment?.team,
            parentEmail: enrollment?.student?.parent?.email || "MISSING",
            studentName: enrollment?.student ? `${enrollment.student.firstname} ${enrollment.student.lastname}` : "MISSING",
            teamName: enrollment?.team?.name || "MISSING",
            schoolName: enrollment?.team?.school?.name || "MISSING",
            sessionCount: enrollment?.team?.session?.length || 0,
          }
        }
      } catch (error) {
        report.enrollmentData = { 
          error: error instanceof Error ? error.message : "Unknown error" 
        }
      }
    }

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { enrollmentId, testEmail } = await request.json()
    
    if (!enrollmentId || !testEmail) {
      return NextResponse.json({
        success: false,
        message: "enrollmentId and testEmail are required"
      }, { status: 400 })
    }

    // Force send test email with enrollment data
    const { sendPaymentConfirmationEmail } = await import("@/lib/email-service")
    
    // Get enrollment data
    const { data: enrollment, error } = await supabase
      .from("enrollment")
      .select(`
        *,
        student:studentid (
          studentid,
          firstname,
          lastname,
          grade,
          ecname,
          ecphone,
          ecrelationship,
          parent:parentid (
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          description,
          price,
          created_at,
          updated_at,
          school:schoolid (
            name,
            location
          ),
          session (
            startdate,
            enddate,
            starttime,
            endtime,
            daysofweek,
            staff:coachid (
              name,
              email,
              phone
            )
          )
        )
      `)
      .eq("enrollmentid", enrollmentId)
      .single()

    if (error || !enrollment) {
      return NextResponse.json({
        success: false,
        message: "Enrollment not found",
        error: error?.message
      }, { status: 404 })
    }

    // Prepare email data
    const studentData = {
      firstName: enrollment.student?.firstname || "Test",
      lastName: enrollment.student?.lastname || "Student",
      grade: enrollment.student?.grade || "10th Grade",
      emergencyContact: {
        name: enrollment.student?.ecname || "Emergency Contact",
        phone: enrollment.student?.ecphone || "(555) 123-4567",
        relationship: enrollment.student?.ecrelationship || "Parent",
      }
    }

    const teamData = {
      teamid: enrollment.team?.teamid || "test-team",
      name: enrollment.team?.name || "Test Team",
      description: enrollment.team?.description || "Test Description",
      price: enrollment.team?.price || 299,
      created_at: enrollment.team?.created_at || new Date().toISOString(),
      updated_at: enrollment.team?.updated_at || new Date().toISOString(),
      school: {
        name: enrollment.team?.school?.name || "Test School",
        location: enrollment.team?.school?.location || "Test Location",
      },
      session: enrollment.team?.session || []
    }

    const emailPaymentData = {
      amount: 299,
      date: new Date().toISOString(),
      sessionId: "debug_test_session"
    }

    const parentData = {
      firstName: enrollment.student?.parent?.firstname || "Test",
      lastName: enrollment.student?.parent?.lastname || "Parent",
      email: testEmail
    }

    console.log("🧪 Sending debug test email to:", testEmail)
    
    const emailResult = await sendPaymentConfirmationEmail(
      testEmail,
      studentData,
      teamData,
      emailPaymentData,
      parentData
    )

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success ? "Test email sent successfully" : "Failed to send test email",
      emailResult,
      data: {
        student: studentData,
        team: teamData,
        payment: emailPaymentData,
        parent: parentData
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error in debug email test",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 