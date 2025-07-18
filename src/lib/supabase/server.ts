// File: src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase'

export function createClient() { // <-- TIDAK ADA ARGUMEN
  const cookieStore = cookies() // <-- Panggil cookies() di dalam

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) { return (await cookieStore).get(name)?.value },
        async set(name: string, value: string, options: CookieOptions) {
          try { (await cookieStore).set({ name, value, ...options }) } catch (error) {}
        },
        async remove(name: string, options: CookieOptions) {
          try { (await cookieStore).delete({ name, ...options }) } catch (error) {}
        },
      },
    }
  )
}