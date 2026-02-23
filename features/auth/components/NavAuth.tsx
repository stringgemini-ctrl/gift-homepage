'use client'

import { useAuth } from './AuthProvider'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NavAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-6">
        <div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div>
        <div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div>
      </div>
    )
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
          className="text-[15px] font-bold text-slate-600 hover:text-[#0098a6] transition-colors cursor-pointer"
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
