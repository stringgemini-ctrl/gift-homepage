import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // ─── 1단계: 유저 식별 ───
  // getUser()는 Supabase 서버에 재검증 요청을 보내므로 Edge에서 실패할 수 있습니다.
  // getSession()은 쿠키에 저장된 JWT를 직접 파싱하므로 Edge에서도 안정적으로 동작합니다.
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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession()으로 쿠키의 JWT를 직접 파싱합니다. (네트워크 왕복 없음 = Edge에서 안정적)
  const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
  const user = session?.user

  console.log('[MW] 1. Session User ID:', user?.id ?? 'NULL')
  if (sessionError) console.error('[MW] Session Error:', sessionError.message)

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 유저 없음 → 로그인 페이지로
    if (!user) {
      console.error('[MW] No user in session. Redirecting to /unauthorized.')
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const res = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
      return res
    }

    // ─── 2단계: 권한 조회 (RLS 완전 우회) ───
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role ?? null

    console.log('[MW] 2. Profile Role READ:', userRole)
    if (profileError) console.error('[MW] Profile Fetch Error:', profileError.message, '| Code:', profileError.code)

    if (!userRole || userRole.toUpperCase() !== 'ADMIN') {
      console.error(`[MW] Access DENIED. Role was: "${userRole}". Expected ADMIN. Redirecting.`)
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      const res = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
      return res
    }

    console.log('[MW] Access GRANTED. Role:', userRole)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
