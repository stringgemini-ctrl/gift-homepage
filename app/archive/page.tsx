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
    // 전체 카테고리 목록은 필터와 관계없이 항상 전부 가져옴
    const { data: allData } = await supabase
      .from("archives")
      .select("category")

    if (allData) {
      const uniqueCategories = Array.from(
        new Set(allData.map((d) => d.category).filter(Boolean))
      ) as string[]
      categories = uniqueCategories.sort()
    }

    // 카테고리 필터가 적용된 데이터 페칭
    let query = supabase
      .from("archives")
      .select("id, title, author, category, created_at")
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    if (error) throw error
    archives = data || []
  } catch (error) {
    console.error("[ArchivePage] Failed to fetch archives:", error)
  }

  return (
    <div className="min-h-screen bg-[#0a0f12] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-light tracking-wider text-emerald-400">
          ARCHIVE
        </h1>

        {/* Pill Filters — useSearchParams 사용으로 Suspense 필요 */}
        <Suspense fallback={<div className="h-9" />}>
          <ArchiveFilter
            categories={categories}
            activeCategory={category || ""}
          />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {archives.map((item) => (
            <Link key={item.id} href={`/archive/${item.id}`}>
              <div className="p-6 h-full rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md transition-all hover:bg-[rgba(255,255,255,0.08)] hover:-translate-y-1">
                <div className="text-xs text-emerald-400 mb-2 font-medium">
                  {item.category || "Uncategorized"}
                </div>
                <h2 className="text-lg font-medium leading-relaxed mb-4 text-white line-clamp-2">
                  {item.title}
                </h2>
                <div className="text-sm text-gray-400">
                  {item.author || "Unknown"}
                </div>
              </div>
            </Link>
          ))}
          {archives.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] rounded-2xl">
              해당 카테고리의 자료가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
