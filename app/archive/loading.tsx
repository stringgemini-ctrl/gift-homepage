export default function ArchiveLoading() {
  return (
    <div className="min-h-screen pt-28 px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="flex gap-3 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-slate-100 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
              <div className="h-5 w-20 bg-emerald-100 rounded-full mb-4" />
              <div className="h-6 w-full bg-slate-200 rounded mb-3" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
