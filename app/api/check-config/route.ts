import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate keys
    const isValidServiceKey = supabaseServiceKey && 
      supabaseServiceKey !== 'your_service_role_key_here' && 
      supabaseServiceKey.startsWith('eyJ');

    const isValidAnonKey = supabaseAnonKey && 
      supabaseAnonKey !== 'your_anon_key_here' && 
      supabaseAnonKey.startsWith('eyJ');

    const config = {
      url: {
        exists: !!supabaseUrl,
        preview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING'
      },
      serviceKey: {
        exists: !!supabaseServiceKey,
        isValid: isValidServiceKey,
        preview: supabaseServiceKey ? 
          (supabaseServiceKey === 'your_service_role_key_here' ? 'PLACEHOLDER VALUE' : `${supabaseServiceKey.substring(0, 20)}...`) : 
          'MISSING'
      },
      anonKey: {
        exists: !!supabaseAnonKey,
        isValid: isValidAnonKey,
        preview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
      }
    };

    let status = 'OK';
    let problem = null;
    let solution = null;

    if (!config.serviceKey.isValid && !config.anonKey.isValid) {
      status = 'CRITICAL ERROR';
      if (config.serviceKey.preview === 'PLACEHOLDER VALUE') {
        problem = 'SUPABASE_SERVICE_ROLE_KEY tiene valor placeholder';
        solution = 'Reemplazar "your_service_role_key_here" con la clave real de Supabase';
      } else if (!config.anonKey.isValid) {
        problem = 'NEXT_PUBLIC_SUPABASE_ANON_KEY está truncada o es inválida';
        solution = 'Verificar que la clave ANON esté completa en .env.local';
      }
    }

    return NextResponse.json({
      status,
      problem,
      solution,
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error verificando configuración:", error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}