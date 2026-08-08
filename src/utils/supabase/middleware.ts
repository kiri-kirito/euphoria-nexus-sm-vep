import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = 'buyer'

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (userData && userData.role) {
      userRole = userData.role
    }
  } else {
    // If no user is logged in, redirect them away from protected routes
    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith('/admin') ||
      (request.nextUrl.pathname.startsWith('/seller') && request.nextUrl.pathname !== '/seller/apply') ||
      request.nextUrl.pathname.startsWith('/delivery') ||
      request.nextUrl.pathname.startsWith('/support')

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Protect /seller routes
  if (request.nextUrl.pathname.startsWith('/seller') && userRole !== 'seller' && userRole !== 'admin') {
    // Allow access to /seller/apply for anyone (buyers/guests)
    if (request.nextUrl.pathname !== '/seller/apply') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect /delivery routes
  if (request.nextUrl.pathname.startsWith('/delivery') && userRole !== 'delivery') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect /support routes
  if (request.nextUrl.pathname.startsWith('/support') && userRole !== 'support') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
