import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    console.log('🧪 Testing upload system configuration...')
    
    const testReport = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      database: {
        drteamTableAccess: false,
        error: null as string | null
      },
      storage: {
        resumeBucketAccess: false,
        bucketExists: false,
        error: null as string | null
      },
      recommendations: [] as string[]
    }
    
    // Test 1: Database Access (Drteam table)
    try {
      console.log('📊 Testing Drteam table access...')
      
      // Try to select from Drteam table
      const { data, error } = await supabaseAdmin
        .from('Drteam')
        .select('id')
        .limit(1)
      
      if (error) {
        testReport.database.error = error.message
        testReport.recommendations.push('❌ Cannot access Drteam table. Check if table exists and permissions.')
      } else {
        testReport.database.drteamTableAccess = true
        console.log('✅ Drteam table accessible')
      }
    } catch (dbError) {
      testReport.database.error = dbError instanceof Error ? dbError.message : 'Unknown database error'
      testReport.recommendations.push('❌ Database connection failed. Check Supabase configuration.')
    }
    
    // Test 2: Storage Access (resume bucket)
    try {
      console.log('📁 Testing resume bucket access...')
      
      // Try to list objects in resume bucket
      const { data: bucketData, error: bucketError } = await supabaseAdmin.storage
        .from('resume')
        .list('', { limit: 1 })
      
      if (bucketError) {
        testReport.storage.error = bucketError.message
        
        if (bucketError.message.includes('bucket') && bucketError.message.includes('not found')) {
          testReport.recommendations.push('❌ Resume bucket does not exist. Create it in Supabase Dashboard > Storage.')
        } else if (bucketError.message.includes('permission')) {
          testReport.recommendations.push('❌ No permission to access resume bucket. Check Service Role Key permissions.')
        } else {
          testReport.recommendations.push(`❌ Storage error: ${bucketError.message}`)
        }
      } else {
        testReport.storage.resumeBucketAccess = true
        testReport.storage.bucketExists = true
        console.log('✅ Resume bucket accessible')
      }
    } catch (storageError) {
      testReport.storage.error = storageError instanceof Error ? storageError.message : 'Unknown storage error'
      testReport.recommendations.push('❌ Storage connection failed. Check Supabase configuration.')
    }
    
    // Generate summary
    const allTestsPassed = testReport.database.drteamTableAccess && testReport.storage.resumeBucketAccess
    
    if (allTestsPassed) {
      testReport.recommendations.push('✅ All systems ready! You can now test the upload functionality.')
    } else {
      testReport.recommendations.push('⚠️ Fix the issues above before testing uploads.')
    }
    
    console.log('🧪 Upload system test completed')
    
    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'Upload system is ready' : 'Upload system has configuration issues',
      report: testReport
    })
    
  } catch (error) {
    console.error('❌ Error testing upload system:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test upload system',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Test endpoint for actual file upload (small test)
export async function POST() {
  try {
    console.log('🧪 Testing actual file upload...')
    
    // Create a small test PDF content (1KB)
    const testPdfContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xC7, 0xEC, 0x8F, 0xA2, 0x0A,
      0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65,
      0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20,
      0x32, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x2F, 0x4D, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6F, 0x78,
      0x20, 0x5B, 0x30, 0x20, 0x30, 0x20, 0x35, 0x39, 0x35, 0x20, 0x38, 0x34, 0x32, 0x5D, 0x0A,
      0x2F, 0x52, 0x65, 0x73, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x73, 0x20, 0x33, 0x20, 0x30, 0x20,
      0x52, 0x0A, 0x2F, 0x43, 0x6F, 0x6E, 0x74, 0x65, 0x6E, 0x74, 0x73, 0x20, 0x34, 0x20, 0x30,
      0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72,
      0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x0A, 0x0A, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x20, 0x6E, 0x0A, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x2F,
      0x53, 0x69, 0x7A, 0x65, 0x20, 0x35, 0x0A, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20,
      0x30, 0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65,
      0x66, 0x0A, 0x31, 0x32, 0x35, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
    ])
    
    const testFileName = `test-upload-${Date.now()}.pdf`
    const testPath = `test/${testFileName}`
    
    console.log(`📤 Testing upload to: ${testPath}`)
    
    // Try to upload test file
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resume')
      .upload(testPath, testPdfContent, {
        contentType: 'application/pdf',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError)
      return NextResponse.json({
        success: false,
        message: 'Test upload failed',
        error: uploadError.message
      }, { status: 500 })
    }
    
    console.log('✅ Test upload successful:', uploadData.path)
    
    // Clean up: delete test file
    try {
      await supabaseAdmin.storage
        .from('resume')
        .remove([testPath])
      console.log('🧹 Test file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up test file:', cleanupError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test upload successful - system is working!',
      testPath: uploadData.path,
      fileSize: testPdfContent.length
    })
    
  } catch (error) {
    console.error('❌ Error in test upload:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Test upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

















