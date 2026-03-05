'use client'
import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'

type OAuthProvider = 'google' | 'kakao'

export default function OAuthButtons() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoading(provider)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // 인증 완료 후 /auth/callback 라우트에서 세션을 교환하고 /archive로 리다이렉트
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err?.message ?? '소셜 로그인 중 오류가 발생했습니다.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Google 로그인 */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {loading === 'google' ? '연결 중...' : 'Google로 계속하기'}
      </button>

      {/* Kakao 로그인 */}
      <button
        type="button"
        onClick={() => handleOAuth('kakao')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#FEE500] hover:bg-[#F5DC00] transition-colors text-sm font-medium text-[#191919] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <KakaoIcon />
        {loading === 'kakao' ? '연결 중...' : 'Kakao로 계속하기'}
      </button>

      {error && (
        <p className="text-xs text-red-500 text-center pt-1">{error}</p>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function KakaoIcon() {
  return (
    // 카카오 공식 말풍선 아이콘 (단색 #191919)
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="#191919">
      <path d="M12 3C6.477 3 2 6.582 2 11c0 2.795 1.686 5.258 4.27 6.836-.188.703-.68 2.547-.778 2.942-.12.487.178.48.374.35.153-.102 2.438-1.656 3.43-2.328.549.076 1.113.115 1.704.115 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
    </svg>
  )
}
