import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Resume upload API called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ No file provided in request')
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Please upload PDF, DOC, or DOCX files only." },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 5MB." },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `resume_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `pdf/${fileName}`

    console.log('🎯 Upload target:', {
      bucket: 'resume',
      path: filePath,
      fileName: fileName
    })

    // Convert File to ArrayBuffer for upload
    console.log('🔄 Converting file to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)
    console.log('✅ File converted, buffer size:', fileBuffer.length)

    // Upload file directly to existing 'resume' bucket
    console.log('☁️ Uploading to Supabase Storage...')
    const { data, error } = await supabase.storage
      .from('resume')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    console.log('📊 Upload result:', { data, error })

    if (error) {
      console.error('❌ Upload failed:', error)
      
      // Return detailed error for debugging
      return NextResponse.json({
        success: false,
        message: `Upload failed: ${error.message}`,
        errorCode: error.statusCode || 'unknown',
        errorDetails: error,
        debugInfo: {
          bucket: 'resume',
          path: filePath,
          fileSize: file.size,
          fileType: file.type
        }
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resume')
      .getPublicUrl(filePath)

    console.log('✅ Upload successful!', {
      fileName: fileName,
      filePath: filePath,
      publicUrl: urlData.publicUrl
    })

    return NextResponse.json({
      success: true,
      fileUrl: urlData.publicUrl,
      message: "File uploaded successfully",
      fileName: fileName,
      filePath: filePath,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Resume upload API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}