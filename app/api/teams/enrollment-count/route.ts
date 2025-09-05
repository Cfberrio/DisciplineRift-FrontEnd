import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Counting active enrollments for team: ${teamId}`);

    // Count active enrollments with paid status
    const { data: enrollmentCount, error: countError } = await supabaseAdmin
      .from("enrollment")
      .select("enrollmentid", { count: "exact", head: false })
      .eq("teamid", teamId)
      .eq("isactive", true);

    if (countError) {
      console.error("❌ Error counting enrollments:", countError);
      throw new Error(`Database query failed: ${countError.message}`);
    }

    // Also check for enrollments with pending payments that might become active
    const { data: pendingEnrollments, error: pendingError } = await supabaseAdmin
      .from("enrollment")
      .select(`
        enrollmentid,
        payment!inner(paymentid, status)
      `)
      .eq("teamid", teamId)
      .eq("isactive", false);

    if (pendingError) {
      console.error("❌ Error checking pending enrollments:", pendingError);
      // Don't fail the request for this, just use 0
    }

    const currentActiveCount = enrollmentCount?.length || 0;
    const pendingCount = pendingEnrollments?.filter(e => 
      e.payment && e.payment.some((p: any) => p.status === 'pending')
    ).length || 0;

    console.log(`✅ Team ${teamId}: ${currentActiveCount} active enrollments, ${pendingCount} pending payments`);

    return NextResponse.json({
      teamId,
      activeEnrollments: currentActiveCount,
      pendingEnrollments: pendingCount,
      totalReserved: currentActiveCount + pendingCount
    });

  } catch (error) {
    console.error("❌ Error in enrollment count API:", error);
    
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to count enrollments",
        details: errorMessage,
        teamId: new URL(request.url).searchParams.get("teamId"),
        activeEnrollments: 0,
        pendingEnrollments: 0,
        totalReserved: 0
      },
      { status: 500 }
    );
  }
}
