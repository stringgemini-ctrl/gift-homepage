'use client'
import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import OAuthButtons from '@/features/auth/components/OAuthButtons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/archive'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('로그인 실패: ' + error.message)
    else {
      router.push(redirectTo)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">로그인</h1>

        {/* 소셜 로그인 버튼 */}
        <OAuthButtons redirectTo={redirectTo} />

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <hr className="flex-1 border-slate-200" />
          <span className="text-xs text-slate-400 whitespace-nowrap">또는 이메일로 계속하기</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        {/* 이메일/비밀번호 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098a6]/40"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098a6]/40"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#0098a6] hover:bg-[#007f8c] transition-colors text-white py-3 font-bold rounded-lg"
          >
            로그인
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-bold text-[#0098a6] hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
