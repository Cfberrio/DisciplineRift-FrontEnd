import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO:");
    
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 
          'NO CONFIGURADO'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
          'NO CONFIGURADO'
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
          `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 
          'NO CONFIGURADO'
      }
    };

    console.log("📊 Estado de variables de entorno:", envStatus);

    // Detectar el problema más común
    let problema = "CONFIGURACIÓN CORRECTA";
    let solucion = "Todas las variables están configuradas";

    if (!envStatus.NEXT_PUBLIC_SUPABASE_URL.exists) {
      problema = "FALTA SUPABASE_URL";
      solucion = "Crear archivo .env.local con NEXT_PUBLIC_SUPABASE_URL";
    } else if (!envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists) {
      problema = "FALTA ANON_KEY";
      solucion = "Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY al .env.local";
    } else if (!envStatus.SUPABASE_SERVICE_ROLE_KEY.exists) {
      problema = "FALTA SERVICE_ROLE_KEY";
      solucion = "Agregar SUPABASE_SERVICE_ROLE_KEY al .env.local";
    }

    return NextResponse.json({
      message: "Diagnóstico de variables de entorno",
      problema,
      solucion,
      envStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    return NextResponse.json(
      {
        message: "Error en diagnóstico",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}