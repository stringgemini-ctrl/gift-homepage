'use client'
import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('로그인 실패: ' + error.message)
    else {
      // 성공 알림 없이 바로 리다이렉트 (흐름 끊김 방지)
      router.push('/archive')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">로그인</h1>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-6 p-3 border rounded-lg" required />
        <button type="submit" className="w-full bg-[#0098a6] text-white py-3 font-bold rounded-lg">로그인</button>
        <p className="mt-6 text-center text-sm text-slate-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-bold text-[#0098a6] hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  )
}
