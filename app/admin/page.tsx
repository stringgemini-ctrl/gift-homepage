'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/components/AuthProvider'
import MemberManagement from '@/features/admin/components/MemberManagement'
import GalleryUpload from '@/features/admin/components/GalleryUpload'
import BookManagement from '@/features/admin/components/BookManagement'
import ArchiveManagement from '@/features/admin/components/ArchiveManagement'

// 사이드바 메뉴 정의
const NAV_ITEMS = [
  {
    id: 'members',
    label: '회원 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'gallery',
    label: '갤러리 업로드',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'books',
    label: '도서 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'archive',
    label: '자료실 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
] as const

type TabId = typeof NAV_ITEMS[number]['id']

export default function AdminDashboardPage() {
  const { user } = useAuth()
  // 기본 랜딩 탭: 회원 관리
  const [activeTab, setActiveTab] = useState<TabId>('members')

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto flex">

        {/* ─── 사이드바 ─── */}
        <aside className="w-64 shrink-0 min-h-[calc(100vh-80px)] bg-white border-r border-slate-100 flex flex-col pt-8 px-4">
          {/* 관리자 프로필 영역 */}
          <div className="mb-8 px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ADMIN PANEL</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-700 truncate">{user?.email?.split('@')[0]}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#f68d2e]/10 text-[#f68d2e] text-[10px] font-black uppercase">
                  👑 Admin
                </span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-slate-100 mb-4 mx-2" />

          {/* 내비게이션 메뉴 */}
          <nav className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">관리 메뉴</p>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${activeTab === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className={activeTab === item.id ? 'text-emerald-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* 하단 링크 */}
          <div className="mt-auto pb-8 px-2">
            <div className="h-px bg-slate-100 mb-4" />
            <Link
              href="/mypage"
              className="flex items-center gap-2 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              마이페이지로
            </Link>
          </div>
        </aside>

        {/* ─── 콘텐츠 영역 ─── */}
        <main className="flex-1 p-8 min-h-[calc(100vh-80px)]">
          {activeTab === 'members' && <MemberManagement />}
          {activeTab === 'gallery' && <GalleryUpload />}
          {activeTab === 'books' && <BookManagement />}
          {activeTab === 'archive' && <ArchiveManagement />}
        </main>

      </div>
    </div>
  )
}