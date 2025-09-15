import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: Request) {
  try {
    console.log('🔍 Ejecutando diagnósticos de cancelación...')

    // 1. Verificar configuración de Supabase
    console.log('📋 Verificando configuración de Supabase...')
    
    // 2. Verificar esquema de tablas
    const diagnostics = {
      supabaseConfigured: true,
      tables: {},
      teams: [],
      inactiveTeams: [],
      pruebaTeam: null,
      sampleQuery: null
    }

    try {
      // Verificar tabla parent
      const { data: parentSchema, error: parentError } = await supabaseAdmin
        .from('parent')
        .select('*')
        .limit(1)

      if (parentError) {
        diagnostics.tables.parent = { error: parentError.message }
      } else {
        diagnostics.tables.parent = { 
          exists: true, 
          columns: parentSchema?.[0] ? Object.keys(parentSchema[0]) : [],
          sampleCount: parentSchema?.length || 0
        }
      }

      // Verificar tabla student
      const { data: studentSchema, error: studentError } = await supabaseAdmin
        .from('student')
        .select('*')
        .limit(1)

      if (studentError) {
        diagnostics.tables.student = { error: studentError.message }
      } else {
        diagnostics.tables.student = { 
          exists: true, 
          columns: studentSchema?.[0] ? Object.keys(studentSchema[0]) : [],
          sampleCount: studentSchema?.length || 0
        }
      }

      // Verificar tabla team
      const { data: teamSchema, error: teamError } = await supabaseAdmin
        .from('team')
        .select('*')
        .limit(1)

      if (teamError) {
        diagnostics.tables.team = { error: teamError.message }
      } else {
        diagnostics.tables.team = { 
          exists: true, 
          columns: teamSchema?.[0] ? Object.keys(teamSchema[0]) : [],
          sampleCount: teamSchema?.length || 0
        }
      }

      // Verificar tabla enrollment
      const { data: enrollmentSchema, error: enrollmentError } = await supabaseAdmin
        .from('enrollment')
        .select('*')
        .limit(1)

      if (enrollmentError) {
        diagnostics.tables.enrollment = { error: enrollmentError.message }
      } else {
        diagnostics.tables.enrollment = { 
          exists: true, 
          columns: enrollmentSchema?.[0] ? Object.keys(enrollmentSchema[0]) : [],
          sampleCount: enrollmentSchema?.length || 0
        }
      }

      // Verificar tabla school
      const { data: schoolSchema, error: schoolError } = await supabaseAdmin
        .from('school')
        .select('*')
        .limit(1)

      if (schoolError) {
        diagnostics.tables.school = { error: schoolError.message }
      } else {
        diagnostics.tables.school = { 
          exists: true, 
          columns: schoolSchema?.[0] ? Object.keys(schoolSchema[0]) : [],
          sampleCount: schoolSchema?.length || 0
        }
      }

      // 3. Buscar todos los equipos
      const { data: allTeams, error: teamsError } = await supabaseAdmin
        .from('team')
        .select('teamid, name, isactive')

      if (!teamsError && allTeams) {
        diagnostics.teams = allTeams
        diagnostics.inactiveTeams = allTeams.filter(team => team.isactive === false)
        
        // Buscar específicamente el equipo "prueba"
        const pruebaTeam = allTeams.find(team => 
          team.name.toLowerCase().includes('prueba')
        )
        diagnostics.pruebaTeam = pruebaTeam || null
      }

      // 4. Consulta de muestra para candidatos de cancelación
      const { data: sampleQuery, error: sampleError } = await supabaseAdmin
        .from('enrollment')
        .select(`
          enrollmentid,
          isactive,
          student:studentid (
            studentid,
            firstname,
            lastname,
            parent:parentid (
              parentid,
              firstname,
              lastname,
              email
            )
          ),
          team:teamid (
            teamid,
            name,
            isactive,
            school:schoolid (
              schoolid,
              name
            )
          )
        `)
        .eq('isactive', true)
        .eq('team.isactive', false)
        .limit(5)

      if (!sampleError) {
        diagnostics.sampleQuery = {
          success: true,
          count: sampleQuery?.length || 0,
          results: sampleQuery || []
        }
      } else {
        diagnostics.sampleQuery = {
          success: false,
          error: sampleError.message
        }
      }

    } catch (dbError) {
      console.error('❌ Error en diagnósticos de base de datos:', dbError)
      diagnostics.supabaseConfigured = false
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnósticos completados',
      diagnostics
    })

  } catch (error) {
    console.error('❌ Error en endpoint de diagnósticos:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}





