import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SESSION_REFRESH_TIMEOUT_MS = 5_000

async function refreshSessionWithTimeout(refresh: Promise<unknown>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      refresh,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Session refresh timed out')), SESSION_REFRESH_TIMEOUT_MS)
      }),
    ])
  } catch {
    // A temporary auth outage should not prevent public pages from rendering.
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', "base-uri 'self'; frame-ancestors 'none'; object-src 'none'")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const hasSupabaseAuthCookie = request.cookies.getAll().some(({ name }) =>
    name.startsWith('sb-') && name.includes('-auth-token')
  )

  // 비로그인 방문자는 외부 인증 확인을 기다릴 필요가 없습니다.
  if (hasSupabaseAuthCookie) {
    await refreshSessionWithTimeout(supabase.auth.getUser())
  }

  setSecurityHeaders(supabaseResponse)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
