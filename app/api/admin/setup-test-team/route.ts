import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    console.log('🏗️ Configurando equipo de prueba "prueba"...')

    // Verificar si ya existe un equipo llamado "prueba"
    const { data: existingTeam, error: existingError } = await supabaseAdmin
      .from('team')
      .select('teamid, name, isactive')
      .ilike('name', '%prueba%')
      .single()

    if (existingTeam) {
      console.log('✅ Ya existe un equipo de prueba:', existingTeam.name)
      
      // Asegurar que esté marcado como inactivo
      if (existingTeam.isactive !== false) {
        const { error: updateError } = await supabaseAdmin
          .from('team')
          .update({ isactive: false })
          .eq('teamid', existingTeam.teamid)

        if (updateError) {
          throw new Error(`Error actualizando equipo: ${updateError.message}`)
        }
        console.log('✅ Equipo marcado como inactivo')
      }

      return NextResponse.json({
        success: true,
        message: 'Equipo de prueba ya existe y está configurado',
        team: { ...existingTeam, isactive: false }
      })
    }

    // Buscar una escuela existente
    const { data: schools, error: schoolError } = await supabaseAdmin
      .from('school')
      .select('schoolid, name')
      .limit(1)

    if (schoolError || !schools || schools.length === 0) {
      throw new Error('No se encontraron escuelas en la base de datos')
    }

    const school = schools[0]
    console.log('🏫 Usando escuela:', school.name)

    // Crear equipo "prueba" inactivo
    const teamId = randomUUID()
    const { data: newTeam, error: teamError } = await supabaseAdmin
      .from('team')
      .insert({
        teamid: teamId,
        schoolid: school.schoolid,
        name: 'prueba',
        description: 'Equipo de prueba para sistema de emails de cancelación',
        price: 129,
        participants: 0,
        isactive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      throw new Error(`Error creando equipo: ${teamError.message}`)
    }

    console.log('✅ Equipo "prueba" creado exitosamente')

    // Crear padre de prueba
    const parentId = randomUUID()
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parent')
      .insert({
        parentid: parentId,
        firstname: 'Juan',
        lastname: 'Prueba',
        email: 'test.cancellation@example.com',
        phone: '555-0123'
      })
      .select()
      .single()

    if (parentError) {
      throw new Error(`Error creando padre: ${parentError.message}`)
    }

    // Crear estudiante de prueba
    const studentId = randomUUID()
    const { data: student, error: studentError } = await supabaseAdmin
      .from('student')
      .insert({
        studentid: studentId,
        parentid: parentId,
        firstname: 'María',
        lastname: 'Prueba',
        dob: '2010-01-01',
        grade: '8th',
        ecname: 'Ana Prueba',
        ecphone: '555-0124',
        ecrelationship: 'Tía',
        StudentDismisall: 'Parent pickup'
      })
      .select()
      .single()

    if (studentError) {
      throw new Error(`Error creando estudiante: ${studentError.message}`)
    }

    // Crear inscripción activa en equipo inactivo
    const enrollmentId = randomUUID()
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollment')
      .insert({
        enrollmentid: enrollmentId,
        studentid: studentId,
        teamid: teamId,
        isactive: true
      })
      .select()
      .single()

    if (enrollmentError) {
      throw new Error(`Error creando inscripción: ${enrollmentError.message}`)
    }

    console.log('✅ Configuración de prueba completada')

    return NextResponse.json({
      success: true,
      message: 'Equipo de prueba configurado exitosamente',
      team: newTeam,
      parent: parent,
      student: student,
      enrollment: enrollment,
      school: school
    })

  } catch (error) {
    console.error('❌ Error configurando equipo de prueba:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error configurando equipo de prueba',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}




