import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: '자료실 — GIFT 글로벌사중복음연구소',
  description: '사중복음 관련 학술 논문, 연구 자료, 간행물을 열람할 수 있는 아카이브입니다.',
}

export const revalidate = 0

const ITEMS_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

// 카테고리별 뱃지 색상 — 라이트 배경 기준 (진한 색상)
const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  "사중복음 논문":       { bg: "rgba(5,150,105,0.10)",   color: "#047857" },  // emerald-700
  "활천":               { bg: "rgba(217,119,6,0.10)",    color: "#b45309" },  // amber-700
  "중생":               { bg: "rgba(29,78,216,0.10)",    color: "#1d4ed8" },  // blue-700
  "성결":               { bg: "rgba(109,40,217,0.10)",   color: "#6d28d9" },  // violet-700
  "신유":               { bg: "rgba(190,18,60,0.10)",    color: "#be123c" },  // rose-700
  "재림":               { bg: "rgba(6,95,70,0.10)",      color: "#065f46" },  // emerald-800
  "사중복음 교단발행물": { bg: "rgba(28,25,23,0.07)",    color: "#44403c" },  // stone-700
}

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? { bg: "rgba(28,25,23,0.06)", color: "#57534e" }
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
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  let archives: any[] = []
  let categories: string[] = []
  let totalCount = 0

  try {
    const { data: catData } = await supabase.from("archive").select("category")
    if (catData) {
      categories = Array.from(
        new Set(catData.map((d: any) => d.category).filter(Boolean))
      ).sort() as string[]
    }

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
    <div className="min-h-screen" style={{ background: "#fdfcf9" }}>
      <style>{`
        .archive-card {
          background: #ffffff;
          border: 1px solid #e7e5e4;
          box-shadow: 0 2px 12px rgba(28,25,23,0.07);
          transition: background 200ms, border-color 200ms, box-shadow 200ms, transform 200ms;
        }
        .archive-card:hover {
          background: #f6fdf9;
          border-color: rgba(5,150,105,0.35);
          box-shadow: 0 6px 24px rgba(5,150,105,0.10);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── 히어로 헤더 ────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-20 pb-16 px-6">
        {/* 은은한 민트 광원 (형태 유지, 투명도 대폭 낮춤) */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 120% 80% at 20% 40%, rgba(16,185,129,0.07) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 90% at 5% 50%, rgba(6,78,59,0.04) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: "#059669" }}>
            GIFT Research Institute
          </p>
          <h1
            className="font-black tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", color: "#1c1917" }}
          >
            자료실
          </h1>
          <p className="text-sm" style={{ color: "#78716c" }}>
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
                  ? { background: "rgba(5,150,105,0.12)", color: "#047857", border: "1px solid rgba(5,150,105,0.35)" }
                  : { background: "#f5f5f4", color: "#78716c", border: "1px solid #d6d3d1" }
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
                      : { background: "#f5f5f4", color: "#78716c", border: "1px solid #d6d3d1" }
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
            style={{ background: "rgba(28,25,23,0.03)", border: "1px solid #e7e5e4" }}
          >
            <p style={{ color: "#a8a29e" }}>해당 카테고리의 자료가 없습니다.</p>
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
                      style={{ fontSize: "15px", color: "#1c1917" }}
                    >
                      {item.title}
                    </h2>

                    {/* 초록 미리보기 */}
                    {item.abstract_text && (
                      <p
                        className="text-xs leading-relaxed mb-4 line-clamp-2"
                        style={{ color: "#a8a29e" }}
                      >
                        {item.abstract_text}
                      </p>
                    )}

                    {/* 메타: 저자 | 날짜 */}
                    <div
                      className="flex items-center gap-2 text-xs pt-3 mt-auto"
                      style={{ borderTop: "1px solid #f0efee", color: "#78716c" }}
                    >
                      {item.author && (
                        <span className="font-semibold" style={{ color: "#059669" }}>
                          {item.author}
                        </span>
                      )}
                      {item.author && dateStr && (
                        <span style={{ color: "#d6d3d1" }}>|</span>
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
                style={{ background: "#f5f5f4", color: "#57534e", border: "1px solid #d6d3d1" }}
              >
                ← 이전
              </Link>
            ) : (
              <span
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                style={{ background: "#fafaf9", color: "#d6d3d1", border: "1px solid #e7e5e4" }}
              >
                ← 이전
              </span>
            )}

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
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
                    ? { background: "rgba(5,150,105,0.14)", color: "#047857", border: "1px solid rgba(5,150,105,0.40)" }
                    : { background: "#f5f5f4", color: "#57534e", border: "1px solid #d6d3d1" }
                }
              >
                {p}
              </Link>
            ))}

            {currentPage < totalPages ? (
              <Link
                href={buildUrl(currentPage + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#f5f5f4", color: "#57534e", border: "1px solid #d6d3d1" }}
              >
                다음 →
              </Link>
            ) : (
              <span
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                style={{ background: "#fafaf9", color: "#d6d3d1", border: "1px solid #e7e5e4" }}
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
