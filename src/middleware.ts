import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Buat response yang bisa dimodifikasi. Ini adalah pola standar dari @supabase/ssr.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inisialisasi Supabase client di dalam middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Ambil data user. Ini juga akan me-refresh token jika perlu.
  const { data: { user } } = await supabase.auth.getUser()

  // ---- LOGIKA PROTEKSI RUTE & REDIRECT ----

  // Definisikan rute-rute
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = ['/login', '/register'].includes(request.nextUrl.pathname)

  // 1. Jika pengguna BELUM LOGIN dan mencoba mengakses RUTE TERPROTEKSI (/dashboard/*)
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (user && request.nextUrl.pathname.startsWith('/dashboard/users')) {
    const { data: profile } = await supabase
        .from('users')
        .select('roles(name)')
        .eq('id', user.id)
        .single()
    
    const role = (profile as any)?.roles?.name
    
    if (role !== 'SuperAdmin') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [

    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}