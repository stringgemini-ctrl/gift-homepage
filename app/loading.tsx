export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400">로딩 중...</p>
      </div>
    </div>
  )
}
