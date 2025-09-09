import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendIncompletePaymentReminderEmail } from "@/lib/email-service";

export async function GET() {
  try {
    console.log("🔄 Testing incomplete payment reminder system...");

    // Get enrollments where isactive = false (completed registration but no payment)
    const { data: incompleteEnrollments, error: enrollmentError } = await supabaseAdmin
      .from("enrollment")
      .select(`
        enrollmentid,
        created_at,
        isactive,
        student:studentid (
          studentid,
          firstname,
          lastname,
          parent:parentid (
            parentid,
            firstname,
            lastname,
            email
          )
        ),
        team:teamid (
          teamid,
          name,
          price,
          school:schoolid (
            name,
            location
          )
        )
      `)
      .eq("isactive", false)
      .order("created_at", { ascending: false })
      .limit(5); // Solo los primeros 5 para la prueba

    if (enrollmentError) {
      console.error("❌ Error fetching incomplete enrollments:", enrollmentError);
      throw new Error(`Database query failed: ${enrollmentError.message}`);
    }

    if (!incompleteEnrollments || incompleteEnrollments.length === 0) {
      console.log("ℹ️ No incomplete payment enrollments found");
      return NextResponse.json({
        message: "No incomplete payment enrollments found for testing",
        count: 0,
        data: []
      });
    }

    // Filter out enrollments without parent email
    const validEnrollments = incompleteEnrollments.filter(enrollment => 
      enrollment.student?.parent?.email
    );

    console.log(`✅ Found ${validEnrollments.length} incomplete payment enrollments for testing`);

    return NextResponse.json({
      message: `Test data: ${validEnrollments.length} incomplete payments found`,
      count: validEnrollments.length,
      testData: validEnrollments.map(enrollment => ({
        enrollmentId: enrollment.enrollmentid,
        parentName: `${enrollment.student.parent.firstname} ${enrollment.student.parent.lastname}`,
        parentEmail: enrollment.student.parent.email,
        studentName: `${enrollment.student.firstname} ${enrollment.student.lastname}`,
        teamName: enrollment.team.name,
        schoolName: enrollment.team.school.name,
        price: enrollment.team.price,
        registrationDate: enrollment.created_at,
        isActive: enrollment.isactive
      }))
    });

  } catch (error) {
    console.error("❌ Error in test endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to test incomplete payment system",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "testEmail is required for test" },
        { status: 400 }
      );
    }

    console.log(`🧪 Sending test email to: ${testEmail}`);

    // Mock enrollment data for test
    const mockEnrollments = [
      {
        enrollmentid: "test-enrollment-123",
        student: {
          firstname: "Sofia",
          lastname: "Test"
        },
        team: {
          name: "Test Volleyball Team",
          price: 299,
          school: {
            name: "Test High School",
            location: "Miami, FL"
          }
        }
      }
    ];

    // Send test email
    const emailResult = await sendIncompletePaymentReminderEmail(
      testEmail,
      "Padre/Madre", // Generic parent name for test
      mockEnrollments
    );

    if (emailResult.success) {
      console.log(`✅ Test email sent successfully to ${testEmail}`);
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        messageId: emailResult.messageId
      });
    } else {
      console.error(`❌ Failed to send test email to ${testEmail}:`, emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
          details: emailResult.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Error in test email sending:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
