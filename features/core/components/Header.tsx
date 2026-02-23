'use client'

import { useAuth } from '@/features/auth/components/AuthProvider'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    alert('로그아웃되었습니다.')
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm transition-all">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-8">

        {/* 좌측 영역: 로고 및 내비게이션 메뉴 */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-4 shrink-0 group">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=GIFT&background=0098a6&color=fff';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-gray-500 tracking-[0.1em] uppercase leading-none mb-1">Seoul Theological University</span>
              <span className="text-xl font-black tracking-tighter text-[#0098a6] leading-none">글로벌사중복음연구소</span>
            </div>
          </Link>

          {/* 중앙 메뉴 영역 (요청하신 4가지 항목 반영) */}
          <nav className="hidden md:flex items-center gap-8 border-l border-gray-200 pl-8">
            <Link href="/about" className="text-sm font-bold text-[#1d1d1f] hover:text-[#0098a6] transition-colors">연구소 소개</Link>
            <Link href="/news" className="text-sm font-bold text-[#1d1d1f] hover:text-[#0098a6] transition-colors">행사 및 소식</Link>
            <Link href="/archive" className="text-sm font-bold text-[#1d1d1f] hover:text-[#0098a6] transition-colors">자료실</Link>
            <Link href="/board" className="text-sm font-bold text-[#1d1d1f] hover:text-[#0098a6] transition-colors">자유게시판</Link>
          </nav>
        </div>

        {/* 우측 영역: 사용자 상태 및 컨트롤 */}
        <div className="flex items-center gap-5 shrink-0">
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-full"></div>
          ) : user ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-500 font-medium">{user.email?.split('@')[0]} 연구원</span>
              {/* 로그인한 사용자에게만 데이터 입력 권한 노출 */}
              <Link href="/write" className="text-xs font-bold text-[#0098a6] hover:underline">자료 등록</Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#1d1d1f] px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#0098a6] px-6 py-2 text-xs font-bold text-white hover:bg-[#007c88] transition-all shadow-sm"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
