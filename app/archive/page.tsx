import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import ArchiveFilter from "@/features/archive/components/ArchiveFilter"

export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  let archives: any[] = []
  let categories: string[] = []
  try {
    const { data: allData } = await supabase.from("archives").select("category")
    if (allData) {
      categories = Array.from(
        new Set(allData.map((d) => d.category).filter(Boolean))
      ).sort() as string[]
    }

    // '전체' 또는 카테고리 파라미터가 없으면 전체 데이터 페칭
    let query = supabase
      .from("archives")
      .select("id, title, author, category, created_at")
      .order("created_at", { ascending: false })

    if (category && category !== "전체") {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    if (error) throw error
    archives = data || []
  } catch (error) {
    console.error("[ArchivePage] Failed to fetch archives:", error)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          자료실
        </h1>

        <Suspense fallback={<div className="h-9" />}>
          <ArchiveFilter
            categories={categories}
            activeCategory={category || ""}
          />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {archives.map((item) => (
            <Link key={item.id} href={`/archive/${item.id}`}>
              <div className="p-6 h-full rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="text-xs text-emerald-700 mb-2 font-medium">
                  {item.category || "기타"}
                </div>
                <h2 className="text-base font-medium leading-relaxed mb-4 text-slate-900 line-clamp-2">
                  {item.title}
                </h2>
                <div className="text-sm text-slate-500">
                  {item.author || "저자 미상"}
                </div>
              </div>
            </Link>
          ))}
          {archives.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 border border-slate-200 bg-white rounded-2xl">
              해당 카테고리의 자료가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
