// This file is kept for backward compatibility but is no longer used
// All operations now use the regular client with email confirmation

// Environment variables for admin client (deprecated)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create mock admin client since we no longer use admin operations
function createMockAdminClient() {
  return {
    auth: {
      admin: {
        createUser: async () => ({
          data: null,
          error: { message: "Admin client deprecated - use email confirmation" },
        }),
        deleteUser: async () => ({ data: null, error: { message: "Admin client deprecated" } }),
        listUsers: async () => ({ data: { users: [] }, error: null }),
        generateLink: async () => ({ data: null, error: { message: "Admin client deprecated" } }),
      },
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: "Admin client deprecated" } }),
      update: () => ({ data: null, error: { message: "Admin client deprecated" } }),
      delete: () => ({ data: null, error: { message: "Admin client deprecated" } }),
    }),
  }
}

// Export mock admin client
const supabaseAdmin = createMockAdminClient()

export { supabaseAdmin }

// Helper function to check if admin client is properly configured (always false now)
export function isSupabaseAdminConfigured(): boolean {
  return false
}

// Validation function for admin client access (always returns invalid)
export function validateAdminClientAccess() {
  return {
    isValid: false,
    error: "Admin client is deprecated. Use email confirmation flow instead.",
  }
}
