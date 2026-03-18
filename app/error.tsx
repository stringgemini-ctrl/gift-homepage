'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-red-200 mb-4">오류</p>
        <h1 className="text-2xl font-black text-slate-800 mb-3">
          문제가 발생했습니다
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block rounded-full bg-emerald-500 px-8 py-3 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
