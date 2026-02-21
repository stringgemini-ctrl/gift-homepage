import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'GIFT - 글로벌사중복음연구소',
  description: '사중복음 신학을 연구하는 글로벌 신학 연구기관',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased font-pretendard">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
