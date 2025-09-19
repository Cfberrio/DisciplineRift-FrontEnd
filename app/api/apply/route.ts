import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Configuración para el endpoint
export const runtime = 'nodejs'

// Función para sanitizar nombre de archivo
function sanitizeFilename(filename: string): string {
  // Extraer extensión
  const ext = filename.split('.').pop()?.toLowerCase() || 'pdf'
  
  // Limpiar nombre base
  const baseName = filename
    .replace(/\.[^/.]+$/, '') // remover extensión
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // solo alfanumérico y guiones
    .replace(/-+/g, '-') // multiple guiones a uno solo
    .replace(/^-|-$/g, '') // remover guiones al inicio/final
    .substring(0, 80) // máximo 80 caracteres
  
  return `${baseName}.${ext}`
}

// Validar PDF
function validatePDF(file: File): { valid: boolean; error?: string } {
  // Validar tipo de contenido
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024 // 10MB en bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  let insertedId: string | null = null
  
  try {
    console.log('📋 Starting application submission process...')
    
    // Parsear formulario multipart
    const formData = await request.formData()
    
    // Extraer campos de texto
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const number = formData.get('number') as string
    const currentAddre = formData.get('currentAddre') as string
    const sport = formData.get('sport') as string
    const description = formData.get('description') as string
    const resumeFile = formData.get('resume') as File
    
    // Validaciones obligatorias (sport es opcional)
    const requiredFields = {
      firstName,
      lastName,
      email,
      number,
      currentAddre,
      description
    }
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          { ok: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Validar archivo PDF (opcional)
    let hasValidResume = false
    if (resumeFile && resumeFile instanceof File && resumeFile.size > 0) {
      const pdfValidation = validatePDF(resumeFile)
      if (!pdfValidation.valid) {
        const status = pdfValidation.error?.includes('size') ? 413 : 415
        return NextResponse.json(
          { ok: false, error: pdfValidation.error },
          { status }
        )
      }
      hasValidResume = true
    }
    
    console.log(`✅ Validation passed for ${email}`)
    
    // PASO 1: Insertar fila en Drteam con resume = null
    const applicationData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      number: number.trim(),
      currentAddre: currentAddre.trim(),
      sport: sport && sport.trim() ? sport.trim() : null,
      description: description.trim(),
      resume: null
    }
    
    console.log('📝 Inserting application data...')
    const { data: insertedRow, error: insertError } = await supabaseAdmin
      .from('Drteam')
      .insert([applicationData])
      .select('id')
      .single()
    
    if (insertError) {
      console.error('❌ Database insertion error:', insertError)
      return NextResponse.json(
        { ok: false, error: 'Failed to save application data' },
        { status: 500 }
      )
    }
    
    if (!insertedRow?.id) {
      console.error('❌ No ID returned from insertion')
      return NextResponse.json(
        { ok: false, error: 'Failed to create application record' },
        { status: 500 }
      )
    }
    
    insertedId = insertedRow.id
    console.log(`✅ Application record created with ID: ${insertedId}`)
    
    // PASO 2: Subir PDF a Supabase Storage (solo si hay archivo)
    if (hasValidResume) {
      try {
        const timestamp = Date.now()
        const sanitizedFilename = sanitizeFilename(resumeFile.name)
        const storagePath = `drteam/${insertedId}/${timestamp}-${sanitizedFilename}`
        
        console.log(`📤 Uploading PDF to: ${storagePath}`)
        
        // Convertir File a ArrayBuffer para la subida
        const fileBuffer = await resumeFile.arrayBuffer()
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('resume')
          .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true
          })
        
        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError)
          throw new Error(`Failed to upload PDF: ${uploadError.message}`)
        }
        
        console.log(`✅ PDF uploaded successfully: ${uploadData.path}`)
        
        // PASO 3: Actualizar la fila con la ruta del archivo
        const { error: updateError } = await supabaseAdmin
          .from('Drteam')
          .update({
            resume: uploadData.path
          })
          .eq('id', insertedId)
        
        if (updateError) {
          console.error('❌ Database update error:', updateError)
          throw new Error(`Failed to update resume path: ${updateError.message}`)
        }
        
        console.log(`✅ Database updated with resume path`)
        
        // PASO 4: Generar URL pública
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('resume')
          .getPublicUrl(uploadData.path)
        
        const publicUrl = publicUrlData.publicUrl
        
        console.log(`🎉 Application submission completed successfully`)
        console.log(`📄 Resume accessible at: ${publicUrl}`)
        
        // Respuesta de éxito con archivo
        return NextResponse.json({
          ok: true,
          id: insertedId,
          resume_path: uploadData.path,
          publicUrl: publicUrl
        })
        
      } catch (storageError) {
        console.error('❌ Storage operation failed:', storageError)
      
      // ROLLBACK: Eliminar la fila insertada si la subida falló
      if (insertedId) {
        console.log(`🔄 Rolling back - deleting record ${insertedId}`)
        try {
          await supabaseAdmin
            .from('Drteam')
            .delete()
            .eq('id', insertedId)
          console.log(`✅ Rollback completed`)
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError)
        }
      }
      
        return NextResponse.json(
          { 
            ok: false, 
            error: storageError instanceof Error ? storageError.message : 'File upload failed'
          },
          { status: 500 }
        )
      }
    } else {
      // No hay archivo de resume, aplicación completada sin archivo
      console.log(`🎉 Application submission completed successfully (without resume)`)
      return NextResponse.json({
        ok: true,
        id: insertedId,
        resume_path: null,
        publicUrl: null
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in /api/apply:', error)
    
    // Si hay un ID y hubo error, intentar rollback
    if (insertedId) {
      try {
        await supabaseAdmin
          .from('Drteam')
          .delete()
          .eq('id', insertedId)
        console.log(`✅ Emergency rollback completed`)
      } catch (rollbackError) {
        console.error('❌ Emergency rollback failed:', rollbackError)
      }
    }
    
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// GET method for testing endpoint availability
export async function GET() {
  return NextResponse.json({
    message: 'Application submission endpoint is available',
    methods: ['POST'],
    requiredFields: ['firstName', 'lastName', 'email', 'number', 'currentAddre', 'description'],
    optionalFields: ['sport', 'resume'],
    maxFileSize: '10MB',
    acceptedTypes: ['application/pdf']
  })
}
