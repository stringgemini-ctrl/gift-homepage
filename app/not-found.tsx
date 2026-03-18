import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-emerald-200 mb-4">404</p>
        <h1 className="text-2xl font-black text-slate-800 mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-emerald-500 px-8 py-3 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
