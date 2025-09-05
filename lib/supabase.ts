import { createClient } from "@supabase/supabase-js";

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validation function
function validateSupabaseConfig() {
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    console.warn(
      `Missing Supabase environment variables: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
}

// Create mock client for when Supabase isn't configured
function createMockClient() {
  return {
    auth: {
      signUp: async () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      setSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }),
          limit: () => ({ data: [], error: null }),
          ilike: () => ({
            order: () => ({
              limit: () => ({ data: [], error: null }),
            }),
          }),
        }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
        in: () => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      insert: () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
      update: () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
      delete: () => ({
        data: null,
        error: { message: "Supabase not configured" },
      }),
    }),
  };
}

// Create Supabase client with validation
let supabase: any;

// Check if we're in build time (when Vercel builds)
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV;

try {
  if (validateSupabaseConfig() && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client initialized successfully");
  } else {
    if (isBuildTime) {
      console.log("⚠️ Build time detected - using mock client");
    } else {
      console.warn(
        "⚠️ Using mock Supabase client - check environment variables"
      );
    }
    supabase = createMockClient();
  }
} catch (error) {
  console.error("❌ Failed to initialize Supabase client:", error);
  supabase = createMockClient();
}

export { supabase };

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return validateSupabaseConfig();
}

// Helper function to get configuration status
export function getSupabaseStatus() {
  return {
    configured: validateSupabaseConfig(),
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  };
}

// Database types based on the schema
export interface School {
  schoolid: string;
  name: string;
  location: string;
}

export interface Team {
  teamid: string;
  schoolid: string;
  name: string;
  description: string;
  price: number;
  participants: number;
  currentEnrollments?: number;
  isactive: boolean;
  created_at: string;
  updated_at: string;
  school?: School;
  session?: Session[];
}

export interface Session {
  sessionid: string;
  teamid: string;
  startdate: string;
  enddate: string;
  starttime: string;
  endtime: string;
  daysofweek: string;
  repeat: string;
  coachid: string;
  staff?: Staff;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Student {
  studentid: string;
  parentid: string;
  firstname: string;
  lastname: string;
  dob: string;
  grade: string;
  ecname: string;
  ecphone: string;
  ecrelationship: string;
  studentdismisall: string;
}

export interface Parent {
  parentid: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface Enrollment {
  enrollmentid: string;
  studentid: string;
  teamid: string;
  isactive: boolean;
}

export interface Payment {
  paymentid: string;
  date: string;
  amount: number;
  enrollmentid: string;
}

export interface Newsletter {
  id: string;
  email: string;
  sport: string | null;
  created_at: string;
  updated_at: string;
}
