import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Checking bucket configuration...")
    
    // 1. Listar todos los buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        success: false,
        step: "list_buckets",
        error: bucketsError.message,
        suggestion: "Cannot access Storage API"
      })
    }

    console.log("Available buckets:", buckets?.map(b => b.name))

    // 2. Buscar bucket 'resume' o cualquier bucket similar
    const resumeBucket = buckets?.find(b => b.name === 'resume')
    const possibleBuckets = buckets?.filter(b => 
      b.name.toLowerCase().includes('resume') || 
      b.name.toLowerCase().includes('document') ||
      b.name.toLowerCase().includes('file')
    )

    if (!resumeBucket) {
      return NextResponse.json({
        success: false,
        step: "find_bucket",
        availableBuckets: buckets?.map(b => ({ name: b.name, public: b.public })),
        possibleBuckets: possibleBuckets?.map(b => ({ name: b.name, public: b.public })),
        suggestion: "Bucket 'resume' not found. Check available buckets above."
      })
    }

    // 3. Probar acceso al bucket
    const { data: files, error: listError } = await supabase.storage
      .from('resume')
      .list('', { limit: 1 })

    if (listError) {
      return NextResponse.json({
        success: false,
        step: "access_bucket",
        bucket: resumeBucket,
        error: listError.message,
        suggestion: "Bucket exists but cannot be accessed. Check RLS policies."
      })
    }

    // 4. Intentar un upload de prueba en la carpeta pdf
    const testFileName = `pdf/test_${Date.now()}.txt`
    const testContent = new TextEncoder().encode("Test file for bucket verification")
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600'
      })

    if (uploadError) {
      return NextResponse.json({
        success: false,
        step: "test_upload",
        bucket: resumeBucket,
        error: uploadError.message,
        suggestion: "Cannot upload to bucket. RLS policy issue or permissions."
      })
    }

    // 5. Limpiar archivo de prueba
    await supabase.storage.from('resume').remove([testFileName])

    return NextResponse.json({
      success: true,
      bucket: resumeBucket,
      message: "Bucket 'resume' is working correctly",
      uploadTest: "SUCCESS"
    })

  } catch (error) {
    console.error("Bucket check error:", error)
    return NextResponse.json({
      success: false,
      step: "general_error",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}