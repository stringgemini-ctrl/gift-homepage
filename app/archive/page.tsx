import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"

export const revalidate = 0

const ITEMS_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

// 카테고리별 뱃지 색상
const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  "사중복음 논문":       { bg: "rgba(16,185,129,0.18)", color: "#34d399" },
  "활천":               { bg: "rgba(246,141,46,0.16)",  color: "#f6a84e" },
  "중생":               { bg: "rgba(96,165,250,0.16)",  color: "#93c5fd" },
  "성결":               { bg: "rgba(167,139,250,0.16)", color: "#c4b5fd" },
  "신유":               { bg: "rgba(251,113,133,0.16)", color: "#fda4af" },
  "재림":               { bg: "rgba(52,211,153,0.14)",  color: "#6ee7b7" },
  "사중복음 교단발행물": { bg: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" },
}

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
}

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}

export default async function ArchivePage({ searchParams }: PageProps) {
  noStore()

  const { category, page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10))
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  let archives: any[] = []
  let categories: string[] = []
  let totalCount = 0

  try {
    // 카테고리 목록 (archive 단수 테이블)
    const { data: catData } = await supabase
      .from("archive")
      .select("category")
    if (catData) {
      categories = Array.from(
        new Set(catData.map((d: any) => d.category).filter(Boolean))
      ).sort() as string[]
    }

    // 목록 쿼리
    let query = supabase
      .from("archive")
      .select("id, title, author, category, published_date, abstract_text", { count: "exact" })
      .order("published_date", { ascending: false, nullsFirst: false })
      .range(from, to)

    if (category && category !== "전체") {
      query = query.eq("category", category)
    }

    const { data, count } = await query
    archives = data || []
    totalCount = count || 0
  } catch (err) {
    console.error("[ArchivePage] fetch error:", err)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1

  function buildUrl(p: number, cat?: string) {
    const params = new URLSearchParams()
    const c = cat !== undefined ? cat : category
    if (c && c !== "전체") params.set("category", c)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return `/archive${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="min-h-screen" style={{ background: "#040c09" }}>
      <style>{`
        .archive-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 2px 16px rgba(0,0,0,0.30);
          transition: background 200ms, border-color 200ms, transform 200ms;
        }
        .archive-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(52,211,153,0.22);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── 히어로 헤더 ────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 120% 80% at 20% 40%, rgba(16,185,129,0.16) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 90% at 5% 50%, rgba(6,78,59,0.22) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: "#34d399" }}>
            GIFT Research Institute
          </p>
          <h1
            className="font-black tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", color: "#e2e8f0" }}
          >
            자료실
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
            총 {totalCount}건의 학술 자료가 있습니다.
          </p>
        </div>
      </div>

      {/* ── 카테고리 필터 Pill ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          {/* 전체 */}
          <Link href={buildUrl(1, "전체")}>
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={
                !category || category === "전체"
                  ? { background: "rgba(16,185,129,0.25)", color: "#34d399", border: "1px solid rgba(52,211,153,0.40)" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.09)" }
              }
            >
              전체
            </span>
          </Link>

          {categories.map((cat) => {
            const style = getCategoryStyle(cat)
            const isActive = category === cat
            return (
              <Link key={cat} href={buildUrl(1, cat)}>
                <span
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={
                    isActive
                      ? { background: style.bg, color: style.color, border: `1px solid ${style.color}55` }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {cat}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── 카드 그리드 ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {archives.length === 0 ? (
          <div
            className="py-24 text-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p style={{ color: "rgba(255,255,255,0.28)" }}>해당 카테고리의 자료가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map((item) => {
              const catStyle = getCategoryStyle(item.category || "")
              const dateStr = fmt(item.published_date)
              return (
                <Link key={item.id} href={`/archive/${item.id}`}>
                  <div className="archive-card flex flex-col h-full p-6 rounded-2xl">
                    {/* 카테고리 뱃지 */}
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                        style={{ background: catStyle.bg, color: catStyle.color }}
                      >
                        {item.category || "기타"}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h2
                      className="font-bold leading-snug mb-3 line-clamp-3 flex-1"
                      style={{ fontSize: "15px", color: "#e2e8f0" }}
                    >
                      {item.title}
                    </h2>

                    {/* 초록 미리보기 */}
                    {item.abstract_text && (
                      <p
                        className="text-xs leading-relaxed mb-4 line-clamp-2"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {item.abstract_text}
                      </p>
                    )}

                    {/* 메타: 저자 | 날짜 */}
                    <div
                      className="flex items-center gap-2 text-xs pt-3 mt-auto"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.40)" }}
                    >
                      {item.author && (
                        <span className="font-semibold" style={{ color: "#34d399" }}>
                          {item.author}
                        </span>
                      )}
                      {item.author && dateStr && (
                        <span style={{ color: "rgba(255,255,255,0.18)" }}>|</span>
                      )}
                      {dateStr && <span>{dateStr}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── 페이지네이션 ─────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-10">
            {currentPage > 1 ? (
              <Link
                href={buildUrl(currentPage - 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                ← 이전
              </Link>
            ) : (
              <span
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                ← 이전
              </span>
            )}

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // 현재 페이지 주변 7개만 표시
              const half = 3
              let start = Math.max(1, currentPage - half)
              const end = Math.min(totalPages, start + 6)
              start = Math.max(1, end - 6)
              return start + i
            }).filter(p => p >= 1 && p <= totalPages).map((p) => (
              <Link
                key={p}
                href={buildUrl(p)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors"
                style={
                  p === currentPage
                    ? { background: "rgba(16,185,129,0.28)", color: "#34d399", border: "1px solid rgba(52,211,153,0.40)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {p}
              </Link>
            ))}

            {currentPage < totalPages ? (
              <Link
                href={buildUrl(currentPage + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                다음 →
              </Link>
            ) : (
              <span
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                다음 →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
