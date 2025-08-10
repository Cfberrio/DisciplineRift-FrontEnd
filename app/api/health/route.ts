import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      configured: isSupabaseAdminConfigured()
    };

    // Only proceed with database test if configured
    if (!envCheck.configured) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not properly configured',
        environment: envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Simple database connectivity test
    const { data: schools, error } = await supabaseAdmin
      .from("school")
      .select("schoolid")
      .limit(1);

    if (error) {
      console.error('Database connectivity test failed:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Database connectivity failed',
        error: error.message,
        environment: envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      database: 'connected',
      schoolsCount: schools?.length || 0,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}