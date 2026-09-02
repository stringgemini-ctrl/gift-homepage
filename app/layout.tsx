import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import MobileNav from '@/features/core/components/MobileNav'

export const metadata = {
  title: 'GIFT - 글로벌사중복음연구소',
  description: '서울신학대학교 글로벌사중복음연구소 — 중생, 성결, 신유, 재림의 사중복음 신학을 연구하고 전파합니다.',
  openGraph: {
    title: 'GIFT - 글로벌사중복음연구소',
    description: '서울신학대학교 글로벌사중복음연구소 — 중생, 성결, 신유, 재림의 사중복음 신학을 연구하고 전파합니다.',
    locale: 'ko_KR',
    type: 'website',
  },
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
            <div className="flex h-20 w-full items-center justify-between px-3 sm:px-6 lg:px-10">

              {/* 왼쪽: 로고 영역 */}
              <div className="min-w-0 flex items-center">
                <Link href="/" className="flex items-center gap-3">
                  {/* ⚠️ 로고가 안 보이면 public 폴더의 파일명을 확인해서 수정하세요 (예: logo.png) */}
                  <img src="/logo.png" alt="GIFT Logo" className="h-8 w-auto shrink-0 sm:h-10" />
                  <div className="hidden flex-col sm:flex">
                    <span className="text-xl font-black text-slate-900 leading-none">글로벌사중복음연구소</span>
                    <span className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase mt-1">Seoul Theological University</span>
                  </div>
                </Link>
              </div>

              {/* 오른쪽: 메뉴 영역 (데스크톱 + 모바일 햄버거) */}
              <MobileNav />
            </div>
          </nav>

          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
