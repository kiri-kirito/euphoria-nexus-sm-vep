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

  // RBAC Logic: Fallback to mockUserRole cookie if DB isn't connected
  const roleCookie = request.cookies.get('mockUserRole')?.value || 'buyer'
  
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && roleCookie !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Protect /seller routes
  if (request.nextUrl.pathname.startsWith('/seller') && roleCookie !== 'seller' && roleCookie !== 'admin') {
    // Allow access to /seller/apply for buyers
    if (request.nextUrl.pathname !== '/seller/apply') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect /delivery routes
  if (request.nextUrl.pathname.startsWith('/delivery') && roleCookie !== 'delivery') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect /support routes
  if (request.nextUrl.pathname.startsWith('/support') && roleCookie !== 'support') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
