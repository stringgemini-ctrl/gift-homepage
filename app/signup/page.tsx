'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert('가입 실패: ' + error.message)
    else {
      alert('가입 승인! 이메일 확인이 필요할 수 있습니다.')
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center">연구소 회원가입</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border p-3" required />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border p-3" required />
          <button type="submit" className="w-full rounded-lg bg-[#1d1d1f] py-3 font-bold text-white">가입하기</button>
        </form>
      </div>
    </div>
  )
}
