'use client'

import Link from 'next/link'
import { useState } from 'react'
import NavAuth from '@/features/auth/components/NavAuth'

const menuLinks = [
  { name: '연구소 소개', href: '/about' },
  { name: '자료실', href: '/archive' },
  { name: '출간 도서', href: '/publications' },
  { name: '문의 및 요청', href: '/contact' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 데스크톱 메뉴 */}
      <div className="hidden md:flex items-center gap-10">
        {menuLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-[15px] font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            {item.name}
          </Link>
        ))}
        <NavAuth />
      </div>

      {/* 모바일 햄버거 버튼 */}
      <button
        type="button"
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="메뉴 열기"
      >
        <span className={`block w-6 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* 모바일 오버레이 메뉴 */}
      {isOpen && (
        <div className="fixed inset-0 top-20 z-[99] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)}>
          <div
            className="absolute right-0 top-0 w-72 h-full bg-white shadow-xl p-8 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {menuLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-4 px-4 text-lg font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-4 pt-6 px-4">
              <NavAuth />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
