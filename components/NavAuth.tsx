'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NavAuth() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ?? null)
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (user) {
    return (
      <div className="flex items-center gap-6">
        <Link
          href="/mypage"
          className="text-[15px] font-bold text-slate-600 hover:text-[#0098a6] transition-colors"
        >
          마이페이지
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[15px] font-bold text-slate-600 hover:text-[#0098a6] transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6">
      <Link
        href="/login"
        className="text-[15px] font-bold text-slate-600 hover:text-[#0098a6] transition-colors"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="text-[15px] font-bold text-[#0098a6] hover:text-[#007c88] transition-colors"
      >
        회원가입
      </Link>
    </div>
  )
}
