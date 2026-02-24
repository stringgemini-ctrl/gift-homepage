import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1단계: 유저 식별 (ANON 키 활용 - 쿠키 기반 세션 확인)
  const supabaseAuth = createServerClient(
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

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  console.log('1. User ID:', user?.id)

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      console.log('User not logged in. Redirecting to /unauthorized.')
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }

    // 2단계: 권한 조회 (SERVICE ROLE 키 활용 - RLS 완전 우회)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('2. Profile Role:', profile?.role, '| Error:', error?.message)

    const userRole = profile?.role

    if (!userRole || userRole.toUpperCase() !== 'ADMIN') {
      console.log('User is not ADMIN. Redirecting to /unauthorized.')
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const response = NextResponse.redirect(url)
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
