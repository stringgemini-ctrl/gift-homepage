export default function PublicationsLoading() {
  return (
    <div className="min-h-screen pt-28 px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="flex gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
              <div className="h-64 bg-slate-200" />
              <div className="p-5">
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
