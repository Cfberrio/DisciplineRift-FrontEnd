import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { studentId: string } }) {
  try {
    const { studentId } = params

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Get the specific student, ensuring it belongs to the authenticated parent
    const { data: student, error: studentError } = await supabase
      .from("student")
      .select(`
        studentid,
        parentid,
        firstname,
        lastname,
        dob,
        grade,
        StudentDismisall,
        ecname,
        ecphone,
        ecrelationship,
        created_at,
        updated_at,
        enrollment (
          enrollmentid,
          teamid,
          isactive,
          team (
            teamid,
            name,
            description,
            price,
            school (
              name,
              location
            )
          )
        )
      `)
      .eq("studentid", studentId)
      .eq("parentid", user.id) // Ensure the student belongs to this parent
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        {
          message: "Student not found or access denied",
        },
        { status: 404 },
      )
    }

    // Calculate age
    const dob = new Date(student.dob)
    const age = new Date().getFullYear() - dob.getFullYear()

    // Format the response
    const formattedStudent = {
      id: student.studentid,
      firstName: student.firstname,
      lastName: student.lastname,
      fullName: `${student.firstname} ${student.lastname}`,
      dateOfBirth: student.dob,
      grade: student.grade,
      age: age,
      emergencyContact: {
        name: student.ecname,
        phone: formatPhoneNumber(student.ecphone),
        relationship: student.ecrelationship,
      },
      enrollments:
        student.enrollment?.map((enrollment) => ({
          id: enrollment.enrollmentid,
          isActive: enrollment.isactive,
          team: enrollment.team
            ? {
                id: enrollment.team.teamid,
                name: enrollment.team.name,
                description: enrollment.team.description,
                price: enrollment.team.price,
                school: enrollment.team.school
                  ? {
                      name: enrollment.team.school.name,
                      location: enrollment.team.school.location,
                    }
                  : null,
              }
            : null,
        })) || [],
      createdAt: student.created_at,
      updatedAt: student.updated_at,
    }

    return NextResponse.json({
      student: formattedStudent,
      message: "Student record retrieved successfully",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { studentId: string } }) {
  try {
    const { studentId } = params
    const {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      dismissal,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      medicalConditions,
      specialInstructions,
    } = await request.json()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Verify the student belongs to this parent
    const { data: existingStudent, error: verifyError } = await supabase
      .from("student")
      .select("studentid, parentid")
      .eq("studentid", studentId)
      .eq("parentid", user.id)
      .single()

    if (verifyError || !existingStudent) {
      return NextResponse.json(
        {
          message: "Student not found or access denied",
        },
        { status: 404 },
      )
    }

    // Validate required fields if provided
    if (firstName && !firstName.trim()) {
      return NextResponse.json({ message: "First name cannot be empty" }, { status: 400 })
    }
    if (lastName && !lastName.trim()) {
      return NextResponse.json({ message: "Last name cannot be empty" }, { status: 400 })
    }

    // Validate phone number if provided
    if (emergencyContactPhone) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(emergencyContactPhone.replace(/\D/g, ""))) {
        return NextResponse.json(
          { message: "Emergency contact phone must be a valid 10-digit number" },
          { status: 400 },
        )
      }
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()

      if (dob >= today) {
        return NextResponse.json({ message: "Date of birth must be in the past" }, { status: 400 })
      }

      if (age < 5 || age > 18) {
        return NextResponse.json({ message: "Child must be between 5 and 18 years old" }, { status: 400 })
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (firstName) updateData.firstname = firstName
    if (lastName) updateData.lastname = lastName
    if (dateOfBirth) updateData.dob = dateOfBirth
    if (grade) updateData.grade = grade.toString()
    if (dismissal) updateData.StudentDismisall = dismissal
    if (emergencyContactName) updateData.ecname = emergencyContactName
    if (emergencyContactPhone) updateData.ecphone = emergencyContactPhone.replace(/\D/g, "")
    if (emergencyContactRelation) updateData.ecrelationship = emergencyContactRelation
    if (medicalConditions !== undefined) updateData.medical_conditions = medicalConditions
    if (specialInstructions !== undefined) updateData.special_instructions = specialInstructions

    // Update the student record
    const { data: updatedStudent, error: updateError } = await supabase
      .from("student")
      .update(updateData)
      .eq("studentid", studentId)
      .eq("parentid", user.id) // Double-check ownership
      .select("*")
      .single()

    if (updateError) {
      return NextResponse.json({ message: "Failed to update student record" }, { status: 500 })
    }

    // Calculate age for response
    const age = new Date().getFullYear() - new Date(updatedStudent.dob).getFullYear()

    const responseData = {
      message: "Student record updated successfully!",
      student: {
        id: updatedStudent.studentid,
        firstName: updatedStudent.firstname,
        lastName: updatedStudent.lastname,
        fullName: `${updatedStudent.firstname} ${updatedStudent.lastname}`,
        dateOfBirth: updatedStudent.dob,
        grade: updatedStudent.grade,
        age: age,
        emergencyContact: {
          name: updatedStudent.ecname,
          phone: formatPhoneNumber(updatedStudent.ecphone),
          relationship: updatedStudent.ecrelationship,
        },
        updatedAt: updatedStudent.updated_at,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { studentId: string } }) {
  try {
    const { studentId } = params

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Check if student has active enrollments
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollment")
      .select("enrollmentid, isactive")
      .eq("studentid", studentId)
      .eq("isactive", true)

    if (enrollmentError) {
      return NextResponse.json({ message: "Failed to check student enrollments" }, { status: 500 })
    }

    if (enrollments && enrollments.length > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete student with active enrollments. Please unenroll from all teams first.",
          activeEnrollments: enrollments.length,
        },
        { status: 409 },
      )
    }

    // Delete the student record (this will cascade to related records if configured)
    const { error: deleteError } = await supabase
      .from("student")
      .delete()
      .eq("studentid", studentId)
      .eq("parentid", user.id) // Ensure ownership

    if (deleteError) {
      return NextResponse.json({ message: "Failed to delete student record" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Student record deleted successfully",
      deletedStudentId: studentId,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
