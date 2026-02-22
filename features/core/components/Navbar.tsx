'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: '소장 인사말', href: '/about#greeting' },
    { name: '사명선언문', href: '/about' },
    { name: '연구소 정관', href: '/about#bylaws' },
    { name: '연구소 가족 소개', href: '/about#family' },
    { name: '연구소 연혁', href: '/about#history' },
    { name: '오시는 길', href: '/about#map' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
      <div className="mx-auto max-w-[1300px] px-6 h-20 flex items-center justify-between">
        
        {/* [복원] logo.png 이미지 및 서울신대 텍스트 레이아웃 */}
        <Link href="/" className="flex items-center gap-4 group">
          <img src="/logo.png" alt="GIFT Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="flex flex-col justify-center hidden md:flex">
            <span className="text-[15px] font-black text-slate-800 leading-tight tracking-tighter">글로벌사중복음연구소</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight">Seoul Theological University</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-8">
          {/* 연구소 소개 드롭다운 메뉴 (기능 유지) */}
          <div 
            className="relative group py-2"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button className="text-[15px] font-black text-slate-700 hover:text-emerald-600 transition-all flex items-center gap-1.5">
              연구소 소개
              <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 드롭다운 박스 */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 w-52 bg-white/90 backdrop-blur-3xl rounded-[1.5rem] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 transition-all duration-300 ${isOpen ? 'opacity-100 visible translate-y-3' : 'opacity-0 invisible translate-y-0'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-full h-4 bg-transparent"></div>
              {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="block px-5 py-2.5 text-[13.5px] font-bold text-slate-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all mb-1 last:mb-0"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/archive" className="text-[15px] font-black text-slate-700 hover:text-emerald-600 transition-all">자료실</Link>
          <Link href="/contact" className="text-[15px] font-black text-slate-700 hover:text-emerald-600 transition-all">문의 및 요청</Link>
        </div>
      </div>
    </nav>
  )
}
