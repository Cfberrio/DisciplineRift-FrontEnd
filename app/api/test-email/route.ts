import { NextResponse } from "next/server"
import { verifyEmailConfiguration, sendPaymentConfirmationEmail } from "@/lib/email-service"

export async function GET() {
  try {
    // Verificar configuración de email
    const configCheck = await verifyEmailConfiguration()
    
    if (!configCheck.configured) {
      return NextResponse.json({
        success: false,
        message: "Email configuration is not valid",
        error: configCheck.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration is valid and ready to use",
      details: configCheck.message
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error verifying email configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email address is required for test"
      }, { status: 400 })
    }

    // Datos de prueba para el email
    const testStudentData = {
      firstName: "Juan",
      lastName: "Pérez",
      grade: "10th Grade",
      emergencyContact: {
        name: "María Pérez",
        phone: "(555) 123-4567",
        relationship: "Madre"
      }
    }

    const testTeamData = {
      teamid: "test-team-001",
      name: "Equipo de Prueba - Volleyball",
      description: "Este es un equipo de prueba para verificar el sistema de emails de confirmación.",
      price: 299,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      school: {
        name: "Escuela de Prueba",
        location: "Ciudad de Prueba, Estado"
      },
      session: [
        {
          startdate: "2024-02-01",
          enddate: "2024-05-01",
          starttime: "15:00",
          endtime: "16:30",
          daysofweek: "Lunes, Miércoles, Viernes",
          staff: {
            name: "Entrenador de Prueba",
            email: "coach@test.com",
            phone: "(555) 987-6543"
          }
        }
      ]
    }

    const testPaymentData = {
      amount: 299,
      date: new Date().toISOString(),
      sessionId: "test_session_12345"
    }

    const testParentData = {
      firstName: "Carlos",
      lastName: "Pérez",
      email: email
    }

    // Enviar email de prueba
    const emailResult = await sendPaymentConfirmationEmail(
      email,
      testStudentData,
      testTeamData,
      testPaymentData,
      testParentData
    )

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        messageId: emailResult.messageId
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to send test email",
        error: emailResult.error
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error sending test email",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 