import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    console.log("Registration request received:", formData)

    // Validate required fields
    const requiredFields = [
      "parentFirstName",
      "parentLastName",
      "parentEmail",
      "parentPhone",
      "childFirstName",
      "childLastName",
      "childBirthdate",
      "childGrade",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
      "userId",
    ]

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 })
      }
    }

    if (!formData.selectedTeam?.id) {
      return NextResponse.json({ message: "Team selection is required" }, { status: 400 })
    }

    // Create admin client to handle parent record creation
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

    console.log("Checking/creating parent record...")

    // First, ensure parent record exists
    const { data: existingParent, error: parentCheckError } = await supabaseAdmin
      .from("parent")
      .select("parentid")
      .eq("parentid", formData.userId)
      .maybeSingle()

    if (parentCheckError) {
      console.error("Error checking parent:", parentCheckError)
    }

    // If parent doesn't exist, create it
    if (!existingParent) {
      console.log("Creating parent record...")
      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("parent")
        .insert({
          parentid: formData.userId,
          firstname: formData.parentFirstName,
          lastname: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
        })
        .select("parentid")
        .single()

      if (parentError) {
        console.error("Parent creation error:", parentError)
        return NextResponse.json(
          {
            message: "Failed to create parent record",
            error: parentError.message,
          },
          { status: 500 },
        )
      }
      console.log("Parent created successfully:", parentData.parentid)
    } else {
      console.log("Parent already exists:", existingParent.parentid)
    }

    console.log("Checking for existing student...")

    // Check if student already exists for this parent to prevent duplicates
    const { data: existingStudent, error: checkError } = await supabaseAdmin
      .from("student")
      .select("studentid")
      .eq("parentid", formData.userId)
      .eq("firstname", formData.childFirstName)
      .eq("lastname", formData.childLastName)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing student:", checkError)
    }

    if (existingStudent) {
      console.log("Student already exists")
      return NextResponse.json({ message: "Student already registered" }, { status: 400 })
    }

    console.log("Creating student record...")

    // Create student record with correct column names
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from("student")
      .insert({
        parentid: formData.userId,
        firstname: formData.childFirstName,
        lastname: formData.childLastName,
        dob: formData.childBirthdate,
        grade: Number.parseInt(formData.childGrade),
        ecname: formData.emergencyContactName,
        ecphone: formData.emergencyContactPhone,
        ecrelationship: formData.emergencyContactRelation,
        StudentDismisall: formData.childDismissal,
      })
      .select("studentid")
      .single()

    if (studentError) {
      console.error("Student creation error:", studentError)
      return NextResponse.json(
        {
          message: "Failed to create student record",
          error: studentError.message,
        },
        { status: 500 },
      )
    }

    console.log("Student created successfully:", studentData.studentid)

    console.log("Creating enrollment record...")

    // Create enrollment record
    const { data: enrollmentData, error: enrollmentError } = await supabaseAdmin
      .from("enrollment")
      .insert({
        studentid: studentData.studentid,
        teamid: formData.selectedTeam.id,
        isactive: false, // Will be activated after payment
      })
      .select("enrollmentid")
      .single()

    if (enrollmentError) {
      console.error("Enrollment creation error:", enrollmentError)
      // Clean up student record if enrollment fails
      await supabaseAdmin.from("student").delete().eq("studentid", studentData.studentid)
      return NextResponse.json(
        {
          message: "Failed to create enrollment record",
          error: enrollmentError.message,
        },
        { status: 500 },
      )
    }

    console.log("Enrollment created successfully:", enrollmentData.enrollmentid)

    return NextResponse.json({
      message: "Registration submitted successfully",
      studentId: studentData.studentid,
      enrollmentId: enrollmentData.enrollmentid,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
