import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { checkBotId } from 'botid/server'
import nodemailer from 'nodemailer'

// Configuración para el endpoint
export const runtime = 'nodejs'

// Configurar el transportador de Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Enviar notificación al equipo sobre nueva aplicación
async function sendTeamNotificationEmail(applicationData: {
  firstName: string
  lastName: string
  email: string
  number: string
  currentAddre: string
  sport: string | null
  description: string
  applicationId: string
  hasResume: boolean
}) {
  try {
    const transporter = createTransporter()
    
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New DR Team Application</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #0085B7 0%, #005a7d 100%); padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">New Team Application Received</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
          A new application has been submitted to join the DR Team:
        </p>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 6px;">
          <tr style="background-color: #f9fafb;">
            <td style="font-weight: bold; color: #374151; width: 140px;">Name:</td>
            <td style="color: #1f2937;">${applicationData.firstName} ${applicationData.lastName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #374151;">Email:</td>
            <td style="color: #1f2937;"><a href="mailto:${applicationData.email}" style="color: #0085B7; text-decoration: none;">${applicationData.email}</a></td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="font-weight: bold; color: #374151;">Phone:</td>
            <td style="color: #1f2937;">${applicationData.number}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #374151;">Address:</td>
            <td style="color: #1f2937;">${applicationData.currentAddre}</td>
          </tr>
          ${applicationData.sport ? `
          <tr style="background-color: #f9fafb;">
            <td style="font-weight: bold; color: #374151;">Sport:</td>
            <td style="color: #1f2937;">${applicationData.sport}</td>
          </tr>
          ` : ''}
          <tr${applicationData.sport ? '' : ' style="background-color: #f9fafb;"'}>
            <td style="font-weight: bold; color: #374151;">Resume:</td>
            <td style="color: #1f2937;">${applicationData.hasResume ? '✅ Attached' : '❌ Not provided'}</td>
          </tr>
        </table>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #0085B7; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #374151;">Description / Why they want to join:</p>
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">${applicationData.description}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>Application ID:</strong> ${applicationData.applicationId}
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          © ${new Date().getFullYear()} Discipline Rift (Torres Rivero LLC)
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'info@disciplinerift.com',
      subject: `New DR Team Application: ${applicationData.firstName} ${applicationData.lastName}`,
      html: emailHtml,
    }
    
    await transporter.sendMail(mailOptions)
    console.log('✅ Team notification email sent to info@disciplinerift.com')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send team notification email:', error)
    // No lanzamos error, solo logueamos - el aplicante ya fue guardado exitosamente
    return { success: false, error }
  }
}

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

/**
 * Detecta si un texto parece gibberish/caracteres aleatorios
 */
function isGibberishText(text: string): boolean {
  if (!text || text.length < 10) return false
  
  const cleanText = text.toLowerCase().replace(/[^a-z]/g, '')
  if (cleanText.length < 5) return false
  
  // 1. Verificar ratio de vocales (debe estar entre 20% y 60%)
  const vowels = cleanText.match(/[aeiou]/g)?.length || 0
  const vowelRatio = vowels / cleanText.length
  if (vowelRatio < 0.2 || vowelRatio > 0.6) return true
  
  // 2. Detectar secuencias de teclado comunes
  const keyboardPatterns = [
    'qwerty', 'asdf', 'zxcv', 'qazwsx', 'poiuyt',
    'lkjhgf', 'mnbvcx', '123456', 'abcdef'
  ]
  for (const pattern of keyboardPatterns) {
    if (cleanText.includes(pattern)) return true
  }
  
  // 3. Detectar caracteres repetidos (más de 3 veces seguidas)
  if (/(.)\1{3,}/.test(cleanText)) return true
  
  // 4. Verificar palabras muy largas sin vocales (>8 caracteres)
  const words = text.split(/\s+/)
  for (const word of words) {
    const wordClean = word.toLowerCase().replace(/[^a-z]/g, '')
    if (wordClean.length > 8) {
      const wordVowels = wordClean.match(/[aeiou]/g)?.length || 0
      if (wordVowels === 0) return true
    }
  }
  
  // 5. Detectar demasiadas consonantes seguidas (>5)
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(cleanText)) return true
  
  return false
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

    // STEP 4.5: Validate text quality (detect gibberish)
    const fieldsToCheck = [
      { name: 'firstName', value: firstName },
      { name: 'lastName', value: lastName },
      { name: 'address', value: currentAddre },
      { name: 'description', value: description }
    ]

    for (const field of fieldsToCheck) {
      if (isGibberishText(field.value)) {
        console.log(`🚫 Gibberish text detected in field: ${field.name}`)
        return NextResponse.json(
          { ok: false, error: `Please provide valid information in the ${field.name} field` },
          { status: 400 }
        )
      }
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
        
        // Enviar notificación por email al equipo
        await sendTeamNotificationEmail({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          number: sanitizedNumber,
          currentAddre: sanitizedCurrentAddre,
          sport: sanitizedSport,
          description: sanitizedDescription,
          applicationId: insertedId,
          hasResume: true
        })
        
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
      
      // Enviar notificación por email al equipo
      await sendTeamNotificationEmail({
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: sanitizedEmail,
        number: sanitizedNumber,
        currentAddre: sanitizedCurrentAddre,
        sport: sanitizedSport,
        description: sanitizedDescription,
        applicationId: insertedId,
        hasResume: false
      })
      
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
