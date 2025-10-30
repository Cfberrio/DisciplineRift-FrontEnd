import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    // Only log in development for security
    if (process.env.NODE_ENV === 'development') {
      console.log("Registration request received:", formData)
    } else {
      console.log("Registration request received for user:", formData.userId)
    }

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

    // Check environment variables
    console.log("🔍 Environment check:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      usingServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("⚠️ No SUPABASE_SERVICE_ROLE_KEY found - may have permission issues")
    }

    // Test basic database connectivity first
    console.log("🔍 Testing database connectivity...")
    try {
      const { data: testQuery, error: testError } = await supabaseAdmin
        .from("parent")
        .select("parentid")
        .limit(1)
      
      if (testError) {
        console.error("❌ Database connection test failed:", testError)
        return NextResponse.json(
          {
            message: "Database connection failed",
            error: testError.message,
            code: testError.code
          },
          { status: 503 }
        )
      }
      console.log("✅ Database connection test successful")
    } catch (connectionError) {
      console.error("❌ Database connection exception:", connectionError)
      return NextResponse.json(
        {
          message: "Database service unavailable",
          error: "Connection failed"
        },
        { status: 503 }
      )
    }

    console.log("Checking/updating parent record...")

    // Check if parent record exists for this user
    const { data: existingParent, error: parentCheckError } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", formData.userId)
      .maybeSingle()

    if (parentCheckError) {
      console.error("Error checking parent:", parentCheckError)
    }

    console.log("🔍 User ID:", formData.userId)
    console.log("🔍 Existing parent found:", !!existingParent)
    
    let parentError = null;
    
    if (existingParent) {
      // Update existing parent record
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
      
      parentError = updateError
      if (!updateError) {
        console.log("✅ Parent record updated successfully")
      }
    } else {
      // Create new parent record with error handling for email conflict
      console.log("Creating new parent record...")
      console.log("🔍 Parent data to insert:", {
        parentid: formData.userId,
        firstname: formData.parentFirstName,
        lastname: formData.parentLastName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      })
      
      let insertError = null;
      
      // Try with admin client first
      console.log("🔍 Attempting insert with admin client...")
      const { error: adminError } = await supabaseAdmin
        .from("parent")
        .insert({
          parentid: formData.userId,
          firstname: formData.parentFirstName,
          lastname: formData.parentLastName,
          email: formData.parentEmail,
          phone: formData.parentPhone,
        })
      
      if (adminError) {
        console.error("❌ Admin client insert failed:", adminError)
        
        // Fallback: try with service key client directly
        console.log("🔄 Trying fallback with direct service key client...")
        
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const fallbackClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: { autoRefreshToken: false, persistSession: false }
            }
          )
          
          const { error: fallbackError } = await fallbackClient
            .from("parent")
            .insert({
              parentid: formData.userId,
              firstname: formData.parentFirstName,
              lastname: formData.parentLastName,
              email: formData.parentEmail,
              phone: formData.parentPhone,
            })
          
          insertError = fallbackError
          if (!fallbackError) {
            console.log("✅ Parent record created with fallback client")
          }
        } else {
          insertError = adminError
        }
      } else {
        console.log("✅ Parent record created successfully with admin client")
      }
      
      parentError = insertError
      if (insertError) {
        console.error("❌ All insert attempts failed:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        })
      }
    }

    if (parentError) {
      console.error("❌ Parent save error - FULL DETAILS:", {
        message: parentError.message,
        code: parentError.code,
        details: parentError.details,
        hint: parentError.hint,
        statusCode: parentError.statusCode
      })
      console.error("❌ Parent data being saved:", {
        parentid: formData.userId,
        firstname: formData.parentFirstName,
        lastname: formData.parentLastName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      })
      
      // Handle specific error cases
      if (parentError.code === "23505" && parentError.message.includes("parent_email_key")) {
        return NextResponse.json(
          {
            message: "This email is already associated with another parent account. Please use a different email or log in with the existing account.",
            error: "Email already in use",
            code: parentError.code
          },
          { status: 400 },
        )
      }
      
      return NextResponse.json(
        {
          message: "Failed to save parent record",
          error: parentError.message,
          code: parentError.code,
          details: parentError.details,
          hint: parentError.hint
        },
        { status: 500 },
      )
    }
    console.log("Parent record saved successfully")

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
          teacher: formData.teacherName,
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
            teacher: formData.teacherName,
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
            teacher: formData.teacherName,
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
            teacher: formData.teacherName,
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

    console.log("Checking team capacity and existing enrollment...")

    // First, check team capacity
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from("team")
      .select("participants")
      .eq("teamid", formData.selectedTeam.id)
      .single()

    if (teamError) {
      console.error("Error fetching team data:", teamError)
      return NextResponse.json({ message: "Error validating team capacity" }, { status: 500 })
    }

    // Count current active enrollments for this team
    const { data: currentEnrollments, error: countError } = await supabaseAdmin
      .from("enrollment")
      .select("enrollmentid", { count: "exact", head: false })
      .eq("teamid", formData.selectedTeam.id)
      .eq("isactive", true)

    if (countError) {
      console.error("Error counting enrollments:", countError)
      return NextResponse.json({ message: "Error validating team capacity" }, { status: 500 })
    }

    const currentEnrollmentCount = currentEnrollments?.length || 0
    const maxParticipants = teamData.participants || 0

    console.log(`Team capacity check: ${currentEnrollmentCount}/${maxParticipants} spots filled`)

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

      // Check if there's already a completed payment for this specific enrollment (student + team combination)
      const { data: existingPayment, error: paymentCheckError } = await supabaseAdmin
        .from("payment")
        .select("paymentid, status")
        .eq("enrollmentid", enrollmentId)
        .eq("status", "paid")
        .maybeSingle()

      if (paymentCheckError) {
        console.error("Error checking existing payment:", paymentCheckError)
      }

      if (existingPayment) {
        console.log("Payment already exists for this specific team enrollment")
        return NextResponse.json(
          { 
            message: "Student is already enrolled and paid for this specific team. Please select a different team or check your dashboard.",
            enrollmentId: enrollmentId,
            alreadyPaid: true
          }, 
          { status: 400 }
        )
      }

      console.log("Enrollment exists but no payment found, allowing retry...")
    } else {
      // Check team capacity before creating new enrollment
      if (currentEnrollmentCount >= maxParticipants) {
        console.log(`❌ Team is full: ${currentEnrollmentCount}/${maxParticipants} spots`)
        return NextResponse.json(
          { 
            message: "This team is currently full. Please select a different team or check back later for availability.",
            teamFull: true,
            currentEnrollments: currentEnrollmentCount,
            maxParticipants: maxParticipants
          }, 
          { status: 400 }
        )
      }

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