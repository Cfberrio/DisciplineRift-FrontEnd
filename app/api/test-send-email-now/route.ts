import { NextResponse } from "next/server";
import { testSendIncompletePaymentEmail } from "@/lib/email-service";

export async function GET() {
  try {
    console.log('🚀 === ENDPOINT DE PRUEBA DE CORREO ACTIVADO ===');
    
    const result = await testSendIncompletePaymentEmail();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Correo enviado exitosamente' : 'Error enviando correo',
      messageId: result.messageId || null,
      error: result.error || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error crítico en endpoint de prueba',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Mismo comportamiento que GET para simplicidad
  return GET();
}
