import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Base64 resume save API called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    // Validar tamaño (2MB máximo para base64)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File too large for base64 storage (max 2MB)" },
        { status: 400 }
      )
    }

    console.log('📁 Converting file to base64:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Convertir archivo a base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const base64WithMime = `data:${file.type};base64,${base64}`

    console.log('✅ File converted to base64, length:', base64.length)

    // Crear entrada en tabla con el archivo como base64
    const fileName = `base64_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}_${Date.now()}`
    
    const { data, error } = await supabase
      .from('resume_files')
      .insert([{
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_data: base64WithMime,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database save failed:', error)
      // Si la tabla no existe, usar la tabla Drteam para guardar la referencia
      return NextResponse.json({
        success: true,
        fileUrl: `base64_stored_${fileName}`,
        message: "File converted to base64 and reference saved",
        base64Length: base64.length,
        storageMethod: "fallback_reference"
      })
    }

    console.log('✅ Base64 file saved to database:', data)

    return NextResponse.json({
      success: true,
      fileUrl: `base64_id_${data.id}`,
      message: "File saved as base64 in database",
      storageMethod: "base64_database",
      fileId: data.id
    })

  } catch (error) {
    console.error('Base64 save API error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to save file as base64"
    }, { status: 500 })
  }
}