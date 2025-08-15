import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderType = searchParams.get('reminder_type'); // '30d', '7d', '1d'
    
    if (!reminderType || !['30d', '7d', '1d'].includes(reminderType)) {
      return NextResponse.json(
        { error: "Invalid reminder_type. Must be '30d', '7d', or '1d'" },
        { status: 400 }
      );
    }

    // Calcular fechas según el tipo de recordatorio
    const now = new Date();
    let targetDate = new Date();
    
    switch (reminderType) {
      case '30d':
        targetDate.setDate(now.getDate() + 30);
        break;
      case '7d':
        targetDate.setDate(now.getDate() + 7);
        break;
      case '1d':
        targetDate.setDate(now.getDate() + 1);
        break;
    }

    // Rango de fechas (±2 horas para tolerancia)
    const startRange = new Date(targetDate);
    startRange.setHours(startRange.getHours() - 2);
    
    const endRange = new Date(targetDate);
    endRange.setHours(endRange.getHours() + 2);

    console.log(`🔄 Buscando sesiones para recordatorio ${reminderType}`);
    console.log(`📅 Rango: ${startRange.toISOString()} - ${endRange.toISOString()}`);

    // Obtener sesiones que necesitan recordatorio
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select(`
        sessionid,
        teamid,
        startdate,
        enddate,
        starttime,
        endtime,
        daysofweek,
        team:teamid (
          teamid,
          name,
          description,
          price,
          school:schoolid (
            name,
            location
          )
        )
      `)
      .gte('startdate', startRange.toISOString().split('T')[0])
      .lte('startdate', endRange.toISOString().split('T')[0]);

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.log(`ℹ️ No sessions found for ${reminderType} reminder`);
      return NextResponse.json({ sessions: [] });
    }

    // Para cada sesión, obtener enrollments activos
    const sessionsWithEnrollments = await Promise.all(
      sessions.map(async (session) => {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollment')
          .select(`
            enrollmentid,
            studentid,
            isactive,
            student:studentid (
              studentid,
              firstname,
              lastname,
              grade,
              parent:parentid (
                parentid,
                firstname,
                lastname,
                email,
                phone
              )
            )
          `)
          .eq('teamid', session.teamid)
          .eq('isactive', true);

        if (enrollmentsError) {
          console.error(`❌ Error fetching enrollments for session ${session.sessionid}:`, enrollmentsError);
          return { ...session, enrollments: [] };
        }

        // Filtrar enrollments que ya tienen recordatorio enviado
        const enrollmentsToNotify = [];
        
        for (const enrollment of enrollments || []) {
          const { data: existingReminder } = await supabase
            .from('session_reminders')
            .select('id')
            .eq('session_id', session.sessionid)
            .eq('enrollment_id', enrollment.enrollmentid)
            .eq('reminder_type', reminderType)
            .single();

          if (!existingReminder) {
            enrollmentsToNotify.push(enrollment);
          }
        }

        return {
          ...session,
          enrollments: enrollmentsToNotify
        };
      })
    );

    // Filtrar sesiones que tienen enrollments para notificar
    const sessionsToProcess = sessionsWithEnrollments.filter(
      session => session.enrollments.length > 0
    );

    console.log(`✅ Found ${sessionsToProcess.length} sessions needing ${reminderType} reminders`);

    return NextResponse.json({
      sessions: sessionsToProcess,
      reminder_type: reminderType,
      target_date: targetDate.toISOString(),
      total_notifications: sessionsToProcess.reduce(
        (sum, session) => sum + session.enrollments.length, 0
      )
    });

  } catch (error) {
    console.error('❌ Error in upcoming sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
