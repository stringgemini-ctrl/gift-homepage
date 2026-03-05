import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * OAuth 콜백 라우트
 * Supabase가 소셜 로그인 완료 후 이 URL로 code를 전달합니다.
 * code를 세션(토큰)으로 교환한 뒤 /archive로 리다이렉트합니다.
 *
 * Supabase Dashboard > Authentication > URL Configuration 에서
 * Redirect URL로 반드시 {YOUR_DOMAIN}/auth/callback 을 등록해야 합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/archive`)
}
