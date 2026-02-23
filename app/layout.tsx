import './globals.css'
import Link from 'next/link'
import NavAuth from '@/features/auth/components/NavAuth'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

export const metadata = {
  title: 'GIFT - 글로벌사중복음연구소',
  description: 'Seoul Theological University',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {/* 상단 헤더: 화면 끝까지 늘어나는 레이아웃 */}
          <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="w-full px-10 h-20 flex items-center justify-between">

              {/* 왼쪽: 로고 영역 */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-3">
                  {/* ⚠️ 로고가 안 보이면 public 폴더의 파일명을 확인해서 수정하세요 (예: logo.png) */}
                  <img src="/logo.png" alt="GIFT Logo" className="h-10 w-auto" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900 leading-none">글로벌사중복음연구소</span>
                    <span className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase mt-1">Seoul Theological University</span>
                  </div>
                </Link>
              </div>

              {/* 오른쪽: 메뉴 영역 (하위 항목 삭제됨) */}
              <div className="flex items-center gap-10">
                {/* 연구소 소개: 이제 드롭다운 없이 바로 클릭해서 이동합니다 */}
                <Link href="/about" className="text-[15px] font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  연구소 소개
                </Link>

                <Link href="/archive" className="text-[15px] font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  자료실
                </Link>

                <Link href="/contact" className="text-[15px] font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  문의 및 요청
                </Link>

                {/* 관리자 아이콘 */}
                <Link href="/admin" className="p-2 bg-slate-50 rounded-full hover:bg-emerald-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-400 hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>

                {/* 로그인 / 마이페이지·로그아웃 */}
                <NavAuth />
              </div>
            </div>
          </nav>

          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}