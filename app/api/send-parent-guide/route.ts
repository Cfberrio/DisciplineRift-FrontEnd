import { NextResponse } from "next/server"
import { sendParentGuideEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, sportInterest } = body

    // Validar que el email sea requerido
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    console.log("📧 Sending Parent Guide email to:", email, "Sport interest:", sportInterest)

    // Enviar el email
    const result = await sendParentGuideEmail(email, sportInterest)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Parent Guide email sent successfully",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email",
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error in send-parent-guide API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}