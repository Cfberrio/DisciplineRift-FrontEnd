import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "No authorization header" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Obtener pagos con enrollment, team, student info - solo status 'paid'
    const { data: paymentsData, error: paymentsError } = await supabaseAdmin
      .from("payment")
      .select(`
        paymentid,
        date,
        amount,
        status,
        enrollment (
          enrollmentid,
          student (
            studentid,
            firstname,
            lastname
          ),
          team (
            teamid,
            name,
            sport
          )
        )
      `)
      .eq("status", "paid")
      .not("enrollment", "is", null)
      .order("date", { ascending: false })

    if (paymentsError) {
      console.error("❌ Error fetching payments:", paymentsError)
      return NextResponse.json({ message: "Error fetching payments", error: paymentsError }, { status: 500 })
    }

    // Filtrar solo los pagos de students que pertenecen al parent
    const { data: myStudents } = await supabaseAdmin
      .from("student")
      .select("studentid")
      .eq("parentid", user.id)

    const myStudentIds = new Set(myStudents?.map(s => s.studentid) || [])
    
    const filteredPayments = (paymentsData || []).filter(payment => 
      payment.enrollment?.student && myStudentIds.has(payment.enrollment.student.studentid)
    )

    return NextResponse.json({ payments: filteredPayments })

  } catch (error) {
    console.error("❌ Payments API error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
