import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we have valid Supabase configuration
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

// Create a singleton for the browser client
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseBrowser() {
  // Return null if no configuration
  if (!hasSupabaseConfig) {
    console.warn(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    )
    return null as any // Return null but typed as client for easier handling
  }

  if (browserClient) return browserClient

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return browserClient
}

// For server components - only create if we have service role key
export const supabaseServer =
  hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null
