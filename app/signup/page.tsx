'use client'
import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import Link from 'next/link'
import OAuthButtons from '@/features/auth/components/OAuthButtons'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h1 className="text-2xl font-bold">이메일을 확인해 주세요</h1>
          <p className="text-slate-500 text-sm">
            <span className="font-semibold text-black">{email}</span>으로 인증 링크를 보냈습니다.
            <br />
            링크를 클릭하면 가입이 완료됩니다.
          </p>
          <p className="text-xs text-slate-400">스팸 폴더도 확인해 보세요.</p>
          <Link href="/login" className="inline-block mt-4 text-sm font-bold text-[#0098a6] hover:underline">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center">연구소 회원가입</h1>

        {/* 소셜 로그인 버튼 */}
        <OAuthButtons />

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <hr className="flex-1 border-slate-200" />
          <span className="text-xs text-slate-400 whitespace-nowrap">또는 이메일로 계속하기</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        {/* 이메일/비밀번호 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#0098a6]/40 text-black"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#0098a6]/40 text-black"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-[#1d1d1f] hover:bg-[#3a3a3c] transition-colors py-3 font-bold text-white"
          >
            가입하기
          </button>
          <p className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-bold text-[#0098a6] hover:underline">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
