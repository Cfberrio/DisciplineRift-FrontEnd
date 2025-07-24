/**
 * API Route for checking registration status
 * This endpoint queries the backend dashboard for the current status of a registration
 */
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the registration ID from the query parameters
  const { searchParams } = new URL(request.url)
  const registrationId = searchParams.get("id")

  if (!registrationId) {
    return NextResponse.json({ message: "Registration ID is required" }, { status: 400 })
  }

  try {
    // Query the dashboard API for the registration status
    const dashboardResponse = await fetch(`${process.env.DASHBOARD_API_URL}/registrations/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${process.env.DASHBOARD_API_KEY}`,
      },
    })

    if (!dashboardResponse.ok) {
      if (dashboardResponse.status === 404) {
        return NextResponse.json({ message: "Registration not found" }, { status: 404 })
      }

      return NextResponse.json({ message: "Failed to retrieve registration status" }, { status: 500 })
    }

    // Get the registration data from the dashboard
    const registrationData = await dashboardResponse.json()

    // Return the relevant status information
    return NextResponse.json({
      registrationId,
      status: registrationData.status,
      paymentStatus: registrationData.paymentStatus,
      message: registrationData.statusMessage,
      nextSteps: registrationData.nextSteps,
      lastUpdated: registrationData.lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching registration status:", error)

    return NextResponse.json(
      { message: "An unexpected error occurred while checking registration status" },
      { status: 500 },
    )
  }
}
