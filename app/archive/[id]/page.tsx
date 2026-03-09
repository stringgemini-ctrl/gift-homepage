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
      .from("archive").select("*").eq("id", id).single()
    if (error) throw error
    archive = data
  } catch (error) {
    console.error("[ArchiveDetailPage] Failed to fetch:", error)
  }

  if (!archive) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400"
        style={{ background: "#040c09" }}>
        자료를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const createdAt   = fmt(archive.created_at)
  const publishedAt = fmt(archive.published_date)

  return (
    <div className="min-h-screen" style={{ background: "#040c09" }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          히어로 섹션
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden pt-16 pb-28 px-6">

        {/* 에메랄드 방사형 광원 레이어 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 140% 80% at 30% 50%, rgba(16,185,129,0.18) 0%, transparent 65%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 100% at 10% 50%, rgba(6,78,59,0.24) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* 뒤로 가기 */}
          <Link
            href="/archive"
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors mb-10"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            ← 자료실 목록으로
          </Link>

          {/* 카테고리 뱃지 */}
          <div className="mb-5">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: "rgba(16,185,129,0.14)", color: "#34d399" }}
            >
              {archive.category || "학술논문"}
            </span>
          </div>

          {/* 제목 */}
          <h1
            className="font-black tracking-[-0.03em] leading-[1.15] mb-8"
            style={{ fontSize: "clamp(26px, 4vw, 46px)", color: "#e2e8f0" }}
          >
            {archive.title}
          </h1>

          {/* 메타 3종: 게시일 | 저자 | 분류 */}
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#34d399" }}>
                게시일
              </span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{createdAt}</span>
            </div>
            <span className="pt-4 leading-none" style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#34d399" }}>
                저자
              </span>
              <span className="font-semibold" style={{ color: "#34d399" }}>{archive.author || "저자 미상"}</span>
            </div>
            <span className="pt-4 leading-none" style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#34d399" }}>
                분류
              </span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{archive.category || "학술논문"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          본문 영역 — 히어로에서 겹쳐 올라오는 카드 스택
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-4xl mx-auto px-6 -mt-14 space-y-5 pb-20">

        {/* 논문 상세 정보 카드 */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
          }}
        >
          <div
            className="px-6 md:px-8 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#34d399" }}>
              논문 상세 정보
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4"
            style={{ borderTop: "none" }}>
            <MetaCell label="저자" value={archive.author || "저자 미상"} />
            <MetaCell label="실제 발행일" value={publishedAt} highlight />
            <MetaCell label="자료 유형" value="학술 논문 (PDF)" />
            <MetaCell label="분류" value={archive.category || "학술논문"} />
          </div>
        </div>

        {/* 초록 카드 */}
        {archive.abstract_text && (
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: "#34d399" }}>
              초록 (Abstract)
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base" style={{ color: "rgba(255,255,255,0.62)" }}>
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
    <div
      className="flex flex-col gap-1 px-6 md:px-8 py-5"
      style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(52,211,153,0.55)" }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: highlight ? "#34d399" : "#e2e8f0" }}
      >
        {value}
      </span>
    </div>
  )
}
