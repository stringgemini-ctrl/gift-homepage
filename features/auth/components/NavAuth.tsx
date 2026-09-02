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
      <div className="flex items-center gap-2 md:gap-6">
        <div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div>
        <div className="hidden h-5 w-16 animate-pulse rounded bg-slate-100 md:block"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-6">
        <Link
          href="/mypage"
          className="whitespace-nowrap text-[14px] font-bold text-slate-600 transition-colors hover:text-emerald-600 md:text-[15px]"
        >
          마이페이지
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="hidden cursor-pointer whitespace-nowrap text-[15px] font-bold text-slate-600 transition-colors hover:text-emerald-600 md:inline"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 md:gap-6">
      <Link
        href="/login"
        className="whitespace-nowrap text-[14px] font-bold text-black transition-colors hover:text-emerald-600 md:text-[15px]"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="hidden whitespace-nowrap text-[15px] font-bold text-black transition-colors hover:text-emerald-600 md:inline"
      >
        회원가입
      </Link>
    </div>
  )
}
