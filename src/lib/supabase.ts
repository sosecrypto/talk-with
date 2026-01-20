import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) return supabaseAdminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase admin environment variables not configured')
  }

  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  return supabaseAdminClient
}

// Export lazy getters for backward compatibility
export const supabase = {
  get storage() {
    return getSupabaseClient().storage
  },
  get auth() {
    return getSupabaseClient().auth
  },
  get from() {
    return getSupabaseClient().from.bind(getSupabaseClient())
  },
}

export const supabaseAdmin = {
  get storage() {
    return getSupabaseAdmin().storage
  },
  get auth() {
    return getSupabaseAdmin().auth
  },
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin())
  },
}
