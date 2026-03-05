import { unstable_noStore as noStore } from "next/cache"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import ArchiveViewer from "@/features/archive/components/ArchiveViewer"

// revalidate = 0 + noStore() 이중 캐시 우회 — DB 변경사항 즉각 반영
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

/** YYYY.MM.DD 포맷 헬퍼 */
function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "미상"
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  // Next.js 데이터 캐시를 완전히 우회 — 매 요청마다 Supabase에서 최신 데이터 조회
  noStore()

  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  let archive: any = null
  try {
    const { data, error } = await supabase
      .from("archives").select("*").eq("id", id).single()
    if (error) throw error
    archive = data
  } catch (error) {
    console.error("[ArchiveDetailPage] Failed to fetch:", error)
  }

  if (!archive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        자료를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const createdAt   = fmt(archive.created_at)       // 게시일 (DB 등록 시각)
  const publishedAt = fmt(archive.published_date)   // 실제 학술 발행일

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          히어로 섹션
          — 제목 + 게시일 / 저자 / 카테고리 메타 3종
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-gradient-to-b from-teal-950 to-slate-900 pt-12 pb-28 px-6">
        <div className="max-w-4xl mx-auto">

          {/* 뒤로 가기 */}
          <Link
            href="/archive"
            className="inline-flex items-center gap-1 text-sm text-teal-300 hover:text-teal-100 transition-colors mb-8"
          >
            ← 자료실 목록으로
          </Link>

          {/* 카테고리 뱃지 — category 없으면 '학술논문' 기본값 */}
          <div className="mb-5">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-700/60 text-teal-200 tracking-wider uppercase">
              {archive.category || "학술논문"}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-white mb-8">
            {archive.title}
          </h1>

          {/* 메타 3종: 게시일 | 저자 | 분류 */}
          <div className="flex flex-wrap items-start gap-x-5 gap-y-3 text-sm text-teal-300/80">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-teal-400/60 uppercase tracking-widest">
                게시일
              </span>
              <span>{createdAt}</span>
            </div>
            <span className="text-white/20 pt-4 leading-none">|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-teal-400/60 uppercase tracking-widest">
                저자
              </span>
              <span>{archive.author || "저자 미상"}</span>
            </div>
            <span className="text-white/20 pt-4 leading-none">|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-teal-400/60 uppercase tracking-widest">
                분류
              </span>
              <span>{archive.category || "학술논문"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          본문 영역 — 히어로에서 겹쳐 올라오는 카드 스택
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-4xl mx-auto px-6 -mt-14 space-y-6 pb-16">

        {/* 논문 상세 정보 카드 (실제 발행일 명시) */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-xl rounded-3xl overflow-hidden">
          <div className="px-6 md:px-8 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-widest">
              논문 상세 정보
            </span>
          </div>
          {/* 4-열 메타 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
            <MetaCell label="저자" value={archive.author || "저자 미상"} />
            {/* 실제 발행일 — 가장 중요한 학술 메타이므로 강조색 적용 */}
            <MetaCell label="실제 발행일" value={publishedAt} highlight />
            <MetaCell label="자료 유형" value="학술 논문 (PDF)" />
            <MetaCell label="분류" value={archive.category || "학술논문"} />
          </div>
        </div>

        {/* 초록 카드 */}
        {archive.abstract_text && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8">
            <h2 className="text-[11px] font-semibold text-teal-700 uppercase tracking-widest mb-4">
              초록 (Abstract)
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {archive.abstract_text}
            </p>
          </div>
        )}

        {/* PDF 뷰어 */}
        <ArchiveViewer pdfUrl={archive.pdf_url} content={archive.content} />

      </div>
    </div>
  )
}

/** 논문 정보 카드 내 개별 셀 */
function MetaCell({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 px-6 md:px-8 py-5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-sm font-semibold ${highlight ? "text-teal-700" : "text-slate-800"}`}>
        {value}
      </span>
    </div>
  )
}
