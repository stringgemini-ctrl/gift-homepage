import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. 퍼블릭 경로 무한 루프 방지 (미들웨어 즉시 통과)
  const publicPaths = ['/login', '/pending', '/unauthorized']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isPublicPath) {
    return supabaseResponse
  }

  // 2. JWT 기반 일반 세션 확인 및 갱신
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

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
    return res
  }

  // 3 & 4. Supabase Admin 클라이언트 생성 (RLS 우회 및 fetch 캐싱 무효화)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        // Next.js 라우트 캐싱을 막기 위해 no-store 적용
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )

  // public.users 테이블 실시간 조회 (auth_id 매칭)
  const { data: dbUser, error } = await supabaseAdmin
    .from('users')
    .select('role, is_approved')
    .eq('auth_id', user.id)
    .single()

  if (error || !dbUser) {
    console.error('[MW] DB fetch error:', error?.message)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 5. 조건별 리다이렉트 처리
  // 승인 대기 상태 검증 (무한 루프 방지를 위해 이미 /pending은 위에서 처리됨)
  if (dbUser.is_approved === false) {
    const url = request.nextUrl.clone()
    url.pathname = '/pending'
    return NextResponse.redirect(url)
  }

  // 관리자(admin) 권한 검증
  if (request.nextUrl.pathname.startsWith('/admin') && dbUser.role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
