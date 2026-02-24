import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // IMPORTANT: DO NOT USE getSession(). Use getUser() as it validates the token on the server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const response = NextResponse.redirect(url)
      // 세션 쿠키를 리다이렉트 응답에 복사
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || user.user_metadata?.role

    console.log('[Middleware Debug] path:', request.nextUrl.pathname);
    console.log('[Middleware Debug] user.id:', user.id);
    console.log('[Middleware Debug] profile fetch error:', error);
    console.log('[Middleware Debug] profile fetched data:', profile);
    console.log('[Middleware Debug] user_metadata role:', user.user_metadata?.role);
    console.log('[Middleware Debug] evaluated userRole:', userRole);
    console.log('[Middleware Debug] Check result (userRole?.toUpperCase() !== "ADMIN"):', userRole?.toUpperCase() !== 'ADMIN');

    if (userRole?.toUpperCase() !== 'ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const response = NextResponse.redirect(url)
      // 세션 쿠키를 리다이렉트 응답에 복사
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
