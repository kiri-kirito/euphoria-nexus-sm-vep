import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from './server'

export class AdminServiceKeyMissingError extends Error {
  constructor() {
    super('SUPABASE_SERVICE_ROLE_KEY is not configured')
    this.name = 'AdminServiceKeyMissingError'
  }
}

/** Service-role client — required for privileged writes (create user, ban, etc.). */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new AdminServiceKeyMissingError()
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Supabase client for admin server pages.
 * Uses service role when available; otherwise falls back to the logged-in admin session.
 */
export async function getAdminSupabase(): Promise<SupabaseClient> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return createServerClient()
}

export function hasAdminServiceKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}
