import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

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
      "childDismissal",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
      "userId",
    ]

    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        console.error(`❌ Missing required field: ${field}`)
        return NextResponse.json({ message: `${field} is required` }, { status: 400 })
      }
    }

    if (!formData.selectedTeam?.id) {
      return NextResponse.json({ message: "Team selection is required" }, { status: 400 })
    }

    // Use admin client from lib
    console.log("Using Supabase admin client for registration operations...")

    console.log("Checking/updating parent record...")

    // First, ensure parent record exists and update it
    const { data: existingParent, error: parentCheckError } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", formData.userId)
      .maybeSingle()

    if (parentCheckError) {
      console.error("Error checking parent:", parentCheckError)
    }

    // Always update/create parent record with latest information
    if (existingParent) {
      console.log("Updating existing parent record...")
      const { error: updateError } = await supabaseAdmin
        .from("parent")
        .update({
          firstname: formData.parentFirstName,
          lastname: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
        })
        .eq("parentid", formData.userId)

      if (updateError) {
        console.error("Parent update error:", updateError)
        return NextResponse.json(
          {
            message: "Failed to update parent record",
            error: updateError.message,
          },
          { status: 500 },
        )
      }
      console.log("Parent updated successfully")
    } else {
      console.log("Creating parent record...")
      const { error: parentError } = await supabaseAdmin
        .from("parent")
        .insert({
          parentid: formData.userId,
          firstname: formData.parentFirstName,
          lastname: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
        })

      if (parentError) {
        console.error("❌ Parent creation error - FULL DETAILS:", {
          message: parentError.message,
          code: parentError.code,
          details: parentError.details,
          hint: parentError.hint,
          statusCode: parentError.statusCode
        })
        console.error("❌ Parent data being inserted:", {
          parentid: formData.userId,
          firstname: formData.parentFirstName,
          lastname: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
        })
        return NextResponse.json(
          {
            message: "Failed to create parent record",
            error: parentError.message,
            code: parentError.code,
            details: parentError.details,
            hint: parentError.hint
          },
          { status: 500 },
        )
      }
      console.log("Parent created successfully")
    }

    let studentId: string;

    // Check if this is an existing student (selectedExistingStudent will be sent from frontend)
    if (formData.selectedExistingStudent?.studentid) {
      console.log("Using existing student:", formData.selectedExistingStudent.studentid)
      studentId = formData.selectedExistingStudent.studentid

      // Update student info (in case contact info changed)
      const { error: updateStudentError } = await supabaseAdmin
        .from("student")
        .update({
          ecname: formData.emergencyContactName,
          ecphone: formData.emergencyContactPhone,
          ecrelationship: formData.emergencyContactRelation,
          StudentDismisall: formData.childDismissal,
        })
        .eq("studentid", studentId)

      if (updateStudentError) {
        console.error("Student update error:", updateStudentError)
        // Don't fail here, just log the error
      } else {
        console.log("Student contact info updated successfully")
      }
    } else {
      // Check if we're creating a student with same name (could be updating info)
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
        console.log("Student with same name exists, updating info...")
        studentId = existingStudent.studentid

        // Update existing student
        const { error: updateError } = await supabaseAdmin
          .from("student")
          .update({
            dob: formData.childBirthdate,
            grade: formData.childGrade,
            ecname: formData.emergencyContactName,
            ecphone: formData.emergencyContactPhone,
            ecrelationship: formData.emergencyContactRelation,
            StudentDismisall: formData.childDismissal,
          })
          .eq("studentid", studentId)

        if (updateError) {
          console.error("Student update error:", updateError)
          return NextResponse.json(
            {
              message: "Failed to update student record",
              error: updateError.message,
            },
            { status: 500 },
          )
        }
        console.log("Student updated successfully")
      } else {
        console.log("Creating new student record...")

        // Create new student record
        const { data: studentData, error: studentError } = await supabaseAdmin
          .from("student")
          .insert({
            parentid: formData.userId,
            firstname: formData.childFirstName,
            lastname: formData.childLastName,
            dob: formData.childBirthdate,
            grade: formData.childGrade,
            ecname: formData.emergencyContactName,
            ecphone: formData.emergencyContactPhone,
            ecrelationship: formData.emergencyContactRelation,
            StudentDismisall: formData.childDismissal,
          })
          .select("studentid")
          .single()

        if (studentError) {
          console.error("❌ Student creation error - FULL DETAILS:", {
            message: studentError.message,
            code: studentError.code,
            details: studentError.details,
            hint: studentError.hint,
            statusCode: studentError.statusCode
          })
          console.error("❌ Student data being inserted:", {
            parentid: formData.userId,
            firstname: formData.childFirstName,
            lastname: formData.childLastName,
            dob: formData.childBirthdate,
            grade: formData.childGrade,
            ecname: formData.emergencyContactName,
            ecphone: formData.emergencyContactPhone,
            ecrelationship: formData.emergencyContactRelation,
            StudentDismisall: formData.childDismissal,
          })
          return NextResponse.json(
            {
              message: "Failed to create student record",
              error: studentError.message,
              code: studentError.code,
              details: studentError.details,
              hint: studentError.hint
            },
            { status: 500 },
          )
        }

        studentId = studentData.studentid
        console.log("Student created successfully:", studentId)
      }
    }

    console.log("Checking for existing enrollment...")

    // Check if enrollment already exists for this student and team
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabaseAdmin
      .from("enrollment")
      .select("enrollmentid, isactive")
      .eq("studentid", studentId)
      .eq("teamid", formData.selectedTeam.id)
      .maybeSingle()

    if (enrollmentCheckError) {
      console.error("Error checking existing enrollment:", enrollmentCheckError)
    }

    let enrollmentId: string;

    if (existingEnrollment) {
      console.log("Enrollment already exists:", existingEnrollment.enrollmentid)
      enrollmentId = existingEnrollment.enrollmentid

      // Check if there's already a completed payment for this enrollment
      const { data: existingPayment, error: paymentCheckError } = await supabaseAdmin
        .from("payment")
        .select("paymentid")
        .eq("enrollmentid", enrollmentId)
        .maybeSingle()

      if (paymentCheckError) {
        console.error("Error checking existing payment:", paymentCheckError)
      }

      if (existingPayment) {
        return NextResponse.json(
          { 
            message: "Student is already enrolled and paid for this team",
            enrollmentId: enrollmentId,
            alreadyPaid: true
          }, 
          { status: 400 }
        )
      }

      console.log("Enrollment exists but no payment found, allowing retry...")
    } else {
      console.log("Creating new enrollment record...")

      // Create new enrollment record
      const { data: enrollmentData, error: enrollmentError } = await supabaseAdmin
        .from("enrollment")
        .insert({
          studentid: studentId,
          teamid: formData.selectedTeam.id,
          isactive: false, // Will be activated after payment
        })
        .select("enrollmentid")
        .single()

      if (enrollmentError) {
        console.error("Enrollment creation error:", enrollmentError)
        return NextResponse.json(
          {
            message: "Failed to create enrollment record",
            error: enrollmentError.message,
          },
          { status: 500 },
        )
      }

      enrollmentId = enrollmentData.enrollmentid
      console.log("Enrollment created successfully:", enrollmentId)
    }

    return NextResponse.json({
      message: "Registration submitted successfully",
      studentId: studentId,
      enrollmentId: enrollmentId,
      isExistingEnrollment: !!existingEnrollment,
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