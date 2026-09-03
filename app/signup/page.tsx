'use client'
import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import Link from 'next/link'

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
          <h1 className="text-2xl font-bold">회원가입이 완료되었습니다</h1>
          <p className="text-slate-500 text-sm">입력하신 이메일과 비밀번호로 서비스를 이용하실 수 있습니다.</p>
          <Link href="/" className="inline-block mt-4 text-sm font-bold text-[#0098a6] hover:underline">
            홈으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
        <h1 className="mb-6 text-2xl font-bold text-black text-center">연구소 회원가입</h1>

        {/* 이메일/비밀번호 폼 */}
        <form onSubmit={handleSignup} className="space-y-4 text-left">
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
          <p className="text-center text-sm text-black">
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
