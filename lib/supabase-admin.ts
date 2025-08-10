import { createClient } from '@supabase/supabase-js'

// Environment variables for admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Production-safe environment variable validation
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Production logging - only log configuration status, not sensitive details
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Admin Configuration:')
  console.log('  - URL configured:', !!supabaseUrl)
  console.log('  - SERVICE_ROLE_KEY configured:', !!supabaseServiceKey)
  console.log('  - ANON_KEY configured:', !!supabaseAnonKey)
}

// Validate keys are not placeholder values
const isValidServiceKey = supabaseServiceKey && 
  supabaseServiceKey !== 'your_service_role_key_here' && 
  supabaseServiceKey.startsWith('eyJ')

const isValidAnonKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_anon_key_here' && 
  supabaseAnonKey.startsWith('eyJ')

// Only log validation in development
if (process.env.NODE_ENV === 'development') {
  console.log('  - SERVICE_ROLE_KEY valid format:', isValidServiceKey)
  console.log('  - ANON_KEY valid format:', isValidAnonKey)
}

// Critical error handling for production
if (!isValidServiceKey && !isValidAnonKey) {
  const error = 'CRITICAL: Neither SERVICE_ROLE_KEY nor ANON_KEY are valid! Check environment variables.'
  console.error('❌', error)
  throw new Error(error)
}

// Create admin client with production-safe configuration
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Simplified configuration for production reliability
    ...(supabaseServiceKey ? {} : {
      global: {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        }
      }
    })
  }
)

export { supabaseAdmin }

// Helper function to check if admin client is properly configured
export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl && (supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
}

// Validation function for admin client access
export function validateAdminClientAccess() {
  const isValid = isSupabaseAdminConfigured()
  return {
    isValid,
    error: isValid ? null : "Supabase admin client is not properly configured.",
  }
}
