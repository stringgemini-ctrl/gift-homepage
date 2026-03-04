import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import ArchiveFilter from "@/features/archive/components/ArchiveFilter"

export const revalidate = 0

const ITEMS_PER_PAGE = 9

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const { category, page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10))
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

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
  let totalPages = 1

  try {
    // 카테고리 목록은 필터 없이 전체에서 추출
    const { data: allData } = await supabase.from("archives").select("category")
    if (allData) {
      categories = Array.from(
        new Set(allData.map((d) => d.category).filter(Boolean))
      ).sort() as string[]
    }

    // 현재 페이지에 해당하는 9개 데이터 + 전체 개수를 함께 가져옴
    let query = supabase
      .from("archives")
      .select("id, title, author, category, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (category && category !== "전체") {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query
    if (error) throw error
    archives = data || []

    // 전체 데이터 수를 바탕으로 총 페이지 수 계산
    totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1
  } catch (error) {
    console.error("[ArchivePage] Failed to fetch archives:", error)
  }

  // 페이지 버튼에 사용할 URL 빌더 헬퍼
  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    if (category && category !== "전체") params.set("category", category)
    params.set("page", String(p))
    return `/archive?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          자료실
        </h1>

        {/* 카테고리 Pill 필터 */}
        <Suspense fallback={<div className="h-9" />}>
          <ArchiveFilter
            categories={categories}
            activeCategory={category || ""}
          />
        </Suspense>

        {/* 논문 카드 그리드 */}
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

        {/* 페이지네이션 UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {/* 이전 버튼 */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-3 py-2 text-sm rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                ← 이전
              </Link>
            ) : (
              <span className="px-3 py-2 text-sm rounded-lg bg-white text-slate-300 border border-slate-200 cursor-not-allowed">
                ← 이전
              </span>
            )}

            {/* 페이지 번호 버튼 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPageUrl(p)}
                className={[
                  "px-3 py-2 text-sm rounded-lg transition-colors",
                  p === currentPage
                    ? "bg-emerald-700 text-white font-semibold shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {p}
              </Link>
            ))}

            {/* 다음 버튼 */}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-3 py-2 text-sm rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                다음 →
              </Link>
            ) : (
              <span className="px-3 py-2 text-sm rounded-lg bg-white text-slate-300 border border-slate-200 cursor-not-allowed">
                다음 →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
