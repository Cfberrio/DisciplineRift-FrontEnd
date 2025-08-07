import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
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

    console.log("🔄 Student creation request received:", {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      hasMedicalConditions: !!medicalConditions,
      hasSpecialInstructions: !!specialInstructions,
    })

    // Validate required fields
    const requiredFields = {
      firstName: "Child's first name",
      lastName: "Child's last name",
      dateOfBirth: "Child's date of birth",
      grade: "Child's grade",
      emergencyContactName: "Emergency contact name",
      emergencyContactPhone: "Emergency contact phone",
      emergencyContactRelation: "Emergency contact relationship",
    }

    const missingFields = []
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = eval(field)
      if (!value || (typeof value === "string" && !value.trim())) {
        missingFields.push(label)
      }
    }

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields)
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate phone number format
    const cleanPhone = emergencyContactPhone.replace(/\D/g, "")
    if (cleanPhone.length !== 10) {
      console.error("❌ Invalid phone number:", emergencyContactPhone)
      return NextResponse.json(
        {
          message: "Emergency contact phone must be a valid 10-digit number",
          providedPhone: emergencyContactPhone,
          cleanedPhone: cleanPhone,
        },
        { status: 400 },
      )
    }

    // Validate date of birth (must be in the past and reasonable age range)
    const dob = new Date(dateOfBirth)
    const today = new Date()

    if (isNaN(dob.getTime())) {
      console.error("❌ Invalid date of birth:", dateOfBirth)
      return NextResponse.json({ message: "Invalid date of birth format" }, { status: 400 })
    }

    if (dob >= today) {
      console.error("❌ Date of birth in future:", dateOfBirth)
      return NextResponse.json({ message: "Date of birth must be in the past" }, { status: 400 })
    }

    const age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age

    if (actualAge < 5 || actualAge > 18) {
      console.error("❌ Invalid age:", actualAge)
      return NextResponse.json(
        {
          message: "Child must be between 5 and 18 years old",
          calculatedAge: actualAge,
        },
        { status: 400 },
      )
    }

    // Get the current authenticated user with better error handling
    let user
    try {
      const authResult = await supabase.auth.getUser()
      if (authResult.error) {
        console.error("❌ Auth error:", authResult.error)
        return NextResponse.json(
          {
            message: "Authentication failed. Please log in again.",
            authError: authResult.error.message,
          },
          { status: 401 },
        )
      }
      user = authResult.data.user
    } catch (authException) {
      console.error("❌ Auth exception:", authException)
      return NextResponse.json(
        {
          message: "Authentication system error. Please try again.",
          error: authException.message,
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.error("❌ No authenticated user found")
      return NextResponse.json({ message: "Authentication required. Please log in." }, { status: 401 })
    }

    console.log("✅ Authenticated user:", user.id, user.email)

    // Verify/create parent record with better error handling
    let parentData
    try {
      const { data: existingParent, error: parentFetchError } = await supabase
        .from("parent")
        .select("parentid, firstname, lastname, email, phone")
        .eq("parentid", user.id)
        .single()

      if (parentFetchError && parentFetchError.code !== "PGRST116") {
        console.error("❌ Error fetching parent record:", parentFetchError)
        throw new Error(`Parent fetch error: ${parentFetchError.message}`)
      }

      if (!existingParent) {
        console.log("🔄 Parent record not found, creating one...")

        const firstName = user.user_metadata?.firstName || ""
        const lastName = user.user_metadata?.lastName || ""
        const phone = user.user_metadata?.phone || ""

        const parentInsertData = {
          parentid: user.id,
          firstname: firstName,
          lastname: lastName,
          email: user.email,
          phone: phone,
        }

        console.log("🔄 Creating parent with data:", parentInsertData)

        const { data: newParent, error: createParentError } = await supabase
          .from("parent")
          .insert(parentInsertData)
          .select("parentid, firstname, lastname, email, phone")
          .single()

        if (createParentError) {
          console.error("❌ Failed to create parent record:", createParentError)
          throw new Error(`Parent creation failed: ${createParentError.message}`)
        }

        console.log("✅ Created parent record:", newParent)
        parentData = newParent
      } else {
        console.log("✅ Found existing parent record:", existingParent)
        parentData = existingParent
      }
    } catch (parentError) {
      console.error("❌ Parent record handling failed:", parentError)
      return NextResponse.json(
        {
          message: "Failed to verify parent account. Please contact support.",
          error: parentError.message,
        },
        { status: 500 },
      )
    }

    // Check for duplicate students
    try {
      const { data: existingStudent, error: duplicateCheckError } = await supabase
        .from("student")
        .select("studentid, firstname, lastname")
        .eq("parentid", user.id)
        .eq("firstname", firstName.trim())
        .eq("lastname", lastName.trim())
        .single()

      if (duplicateCheckError && duplicateCheckError.code !== "PGRST116") {
        console.error("❌ Error checking for duplicates:", duplicateCheckError)
        // Don't fail here, just log and continue
      }

      if (existingStudent) {
        console.log("❌ Duplicate student found:", existingStudent)
        return NextResponse.json(
          {
            message: `A student named ${firstName} ${lastName} already exists for this parent account.`,
            existingStudent: {
              id: existingStudent.studentid,
              name: `${existingStudent.firstname} ${existingStudent.lastname}`,
            },
          },
          { status: 409 },
        )
      }
    } catch (duplicateError) {
      console.error("❌ Duplicate check failed:", duplicateError)
      // Continue anyway - better to allow potential duplicate than fail completely
    }

    // Create the student record with comprehensive error handling
    const studentData = {
      parentid: user.id,
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      dob: dateOfBirth,
      grade: grade.toString(),
      ecname: emergencyContactName.trim(),
      ecphone: cleanPhone,
      ecrelationship: emergencyContactRelation.trim(),
      StudentDismisall: dismissal,
      // Optional fields - only include if they have content
      ...(medicalConditions && medicalConditions.trim() && { medical_conditions: medicalConditions.trim() }),
      ...(specialInstructions && specialInstructions.trim() && { special_instructions: specialInstructions.trim() }),
    }

    console.log("🔄 Creating student record with data:", {
      ...studentData,
      ecphone: `${cleanPhone.slice(0, 3)}***${cleanPhone.slice(-4)}`, // Mask phone for logging
    })

    let createdStudent
    try {
      // Try with regular client first
      const { data: studentResult, error: studentError } = await supabase
        .from("student")
        .insert(studentData)
        .select(`
          studentid,
          firstname,
          lastname,
          dob,
          grade,
          StudentDismisall,
          ecname,
          ecphone,
          ecrelationship,
          medical_conditions,
          special_instructions,
          created_at,
          updated_at
        `)
        .single()

      if (studentError) {
        console.error("❌ Regular client student creation failed:", studentError)
        throw studentError
      }

      createdStudent = studentResult
      console.log("✅ Student created with regular client:", createdStudent.studentid)
    } catch (regularError) {
      console.log("🔄 Regular client failed, trying admin client...")

      try {
        const { data: adminResult, error: adminError } = await supabaseAdmin
          .from("student")
          .insert(studentData)
          .select(`
            studentid,
            firstname,
            lastname,
            dob,
            grade,
            ecname,
            ecphone,
            ecrelationship,
            medical_conditions,
            special_instructions,
            created_at,
            updated_at
          `)
          .single()

        if (adminError) {
          console.error("❌ Admin client student creation failed:", adminError)
          throw adminError
        }

        createdStudent = adminResult
        console.log("✅ Student created with admin client:", createdStudent.studentid)
      } catch (adminError) {
        console.error("❌ Both regular and admin clients failed:", {
          regularError: regularError.message,
          adminError: adminError.message,
          studentData: {
            ...studentData,
            ecphone: `${cleanPhone.slice(0, 3)}***${cleanPhone.slice(-4)}`,
          },
        })

        return NextResponse.json(
          {
            message: "Failed to create student record. Please try again or contact support.",
            error: adminError.message,
            details: "Database insertion failed with both regular and admin access",
          },
          { status: 500 },
        )
      }
    }

    if (!createdStudent) {
      console.error("❌ No student data returned after creation")
      return NextResponse.json(
        {
          message: "Student record creation failed - no data returned",
          error: "Unknown database error",
        },
        { status: 500 },
      )
    }

    // Format the successful response
    const responseData = {
      message: "Child record created successfully!",
      student: {
        id: createdStudent.studentid,
        firstName: createdStudent.firstname,
        lastName: createdStudent.lastname,
        fullName: `${createdStudent.firstname} ${createdStudent.lastname}`,
        dateOfBirth: createdStudent.dob,
        grade: createdStudent.grade,
        age: actualAge,
        emergencyContact: {
          name: createdStudent.ecname,
          phone: formatPhoneNumber(createdStudent.ecphone),
          relationship: createdStudent.ecrelationship,
        },
        medicalConditions: createdStudent.medical_conditions || null,
        specialInstructions: createdStudent.special_instructions || null,
        parent: {
          id: parentData.parentid,
          name: `${parentData.firstname || ""} ${parentData.lastname || ""}`.trim() || "Unknown",
          email: parentData.email || user.email,
        },
        createdAt: createdStudent.created_at || new Date().toISOString(),
      },
      nextSteps: [
        "Your child's information has been saved to your account",
        "You can now register them for teams and programs",
        "Update their information anytime from your parent dashboard",
      ],
    }

    console.log("✅ Student creation successful:", createdStudent.studentid)
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error("❌ Unexpected error in student creation:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Handle specific database errors
    if (error.code === "23505") {
      return NextResponse.json(
        {
          message: "A student with this information already exists",
          error: "Duplicate entry",
        },
        { status: 409 },
      )
    }

    if (error.code === "23503") {
      return NextResponse.json(
        {
          message: "Invalid parent reference. Please log out and log in again.",
          error: "Foreign key constraint violation",
        },
        { status: 400 },
      )
    }

    if (error.code === "42501") {
      return NextResponse.json(
        {
          message: "Permission denied. Please contact support.",
          error: "Insufficient privileges",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        message: "An unexpected error occurred while creating the student record. Please try again.",
        error: error.message || "Unknown error",
        errorCode: error.code || "UNKNOWN",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log("🔄 GET students request received")

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Authentication failed in GET:", authError)
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    console.log("✅ Authenticated user for GET:", user.id)

    // Get all students for this parent
    const { data: students, error: studentsError } = await supabase
      .from("student")
      .select(`
        studentid,
        firstname,
        lastname,
        dob,
        grade,
        StudentDismisall,
        ecname,
        ecphone,
        ecrelationship,
        medical_conditions,
        special_instructions,
        created_at,
        updated_at
      `)
      .eq("parentid", user.id)
      .order("created_at", { ascending: false })

    if (studentsError) {
      console.error("❌ Error fetching students:", studentsError)
      return NextResponse.json(
        {
          message: "Failed to fetch student records",
          error: studentsError.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Found ${students.length} students for parent ${user.id}`)

    // Format the response
    const formattedStudents = students.map((student) => {
      const dob = new Date(student.dob)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age

      return {
        id: student.studentid,
        firstName: student.firstname,
        lastName: student.lastname,
        fullName: `${student.firstname} ${student.lastname}`,
        dateOfBirth: student.dob,
        grade: student.grade,
        dismissal: student.StudentDismisall,
        age: actualAge,
        emergencyContact: {
          name: student.ecname,
          phone: formatPhoneNumber(student.ecphone),
          relationship: student.ecrelationship,
        },
        medicalConditions: student.medical_conditions,
        specialInstructions: student.special_instructions,
        createdAt: student.created_at,
        updatedAt: student.updated_at,
      }
    })

    return NextResponse.json({
      students: formattedStudents,
      total: formattedStudents.length,
      message:
        formattedStudents.length > 0
          ? `Found ${formattedStudents.length} student record(s)`
          : "No student records found",
    })
  } catch (error) {
    console.error("❌ Error in GET /api/students:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
