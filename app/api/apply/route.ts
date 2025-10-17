import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { checkBotId } from 'botid/server'

// Configuración para el endpoint
export const runtime = 'nodejs'

// List of disposable email domains to block (includes popular ones in US/Latin America)
const DISPOSABLE_EMAIL_DOMAINS = [
  // General disposable domains
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'trashmail.com', 'yopmail.com',
  'temp-mail.org', 'getnada.com', 'fakeinbox.com', 'sharklasers.com',
  'spam4.me', 'grr.la', 'dispostable.com',
  // Popular in US
  'guerrillamailblock.com', 'pokemail.net', 'spamgourmet.com', 'mintemail.com',
  'emailondeck.com', 'throwawaymail.com', 'tempinbox.com', 'anonbox.net',
  // Popular in Latin America
  'correotemporal.org', 'emailtemporanea.com', 'emailtemporario.com.br',
  'mohmal.com', 'mytemp.email', 'tempmail.io', 'inboxkitten.com',
  // Other common ones
  '10minutemail.net', '20minutemail.com', '33mail.com', 'bugmenot.com',
  'getairmail.com', 'hidemail.de', 'incognitomail.com', 'jetable.org'
]

// Validate email format and check for disposable domains
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false
  
  const domain = email.split('@')[1]?.toLowerCase()
  return !DISPOSABLE_EMAIL_DOMAINS.includes(domain)
}

// Sanitize string to prevent injection attacks
function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '').trim()
}

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
    // STEP 1: Check BotID to detect bot traffic
    const botResult = await checkBotId()
    
    // Block if it's a bot (but allow verified bots like search engines)
    if (botResult.isBot && !botResult.isVerifiedBot) {
      console.log('🚫 Bot detected by BotID, blocking application submission')
      return NextResponse.json(
        { ok: false, error: 'Request blocked' },
        { status: 403 }
      )
    }

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
    const company = formData.get('company') as string // Honeypot field
    
    // STEP 2: Check honeypot field
    if (company && company.trim() !== '') {
      console.log('🚫 Honeypot triggered - bot detected, silently ignoring application')
      // Return success to fool the bot, but don't process
      return NextResponse.json({
        ok: true,
        id: 'ignored',
        resume_path: null,
        publicUrl: null
      })
    }
    
    // STEP 3: Validate required fields with minimum lengths
    if (!firstName || firstName.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: 'First name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (!lastName || lastName.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Last name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // STEP 4: Validate email format and check for disposable domains
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (!number || number.trim().length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid phone number' },
        { status: 400 }
      )
    }

    if (!currentAddre || currentAddre.trim().length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a complete address' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { ok: false, error: 'Description must be at least 20 characters long' },
        { status: 400 }
      )
    }

    // STEP 5: Sanitize inputs
    const sanitizedFirstName = sanitizeString(firstName)
    const sanitizedLastName = sanitizeString(lastName)
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedNumber = sanitizeString(number)
    const sanitizedCurrentAddre = sanitizeString(currentAddre)
    const sanitizedSport = sport ? sanitizeString(sport) : null
    const sanitizedDescription = sanitizeString(description)
    
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
    
    console.log(`✅ Validation passed for ${sanitizedEmail}`)
    
    // PASO 1: Insertar fila en Drteam con resume = null (using sanitized data)
    const applicationData = {
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      number: sanitizedNumber,
      currentAddre: sanitizedCurrentAddre,
      sport: sanitizedSport,
      description: sanitizedDescription,
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
