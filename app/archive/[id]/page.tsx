import { unstable_noStore as noStore } from "next/cache"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import ArchiveViewer from "@/features/archive/components/ArchiveViewer"

export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

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

  // 인증 체크: 비로그인 사용자 → /login?redirectTo=현재경로
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/archive/${id}`)}`)
  }

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
      <div
        className="min-h-screen flex items-center justify-center text-sm"
        style={{ background: "#fdfcf9", color: "#a8a29e" }}
      >
        자료를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const createdAt   = fmt(archive.created_at)
  const publishedAt = fmt(archive.published_date)
  // '활천' 카테고리는 상세 페이지 자료유형 표기만 '활천 기고문'으로 표시
  const displayType = archive.category === "활천" ? "활천 기고문" : "학술 논문 (PDF)"

  return (
    <div className="min-h-screen" style={{ background: "#fdfcf9" }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          히어로 섹션
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden pt-16 pb-28 px-6">

        {/* 은은한 민트 광원 (형태 유지, 투명도 낮춤) */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 140% 80% at 30% 50%, rgba(16,185,129,0.07) 0%, transparent 65%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 100% at 10% 50%, rgba(6,78,59,0.04) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* 뒤로 가기 */}
          <Link
            href="/archive"
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors mb-10"
            style={{ color: "#78716c" }}
          >
            ← 자료실 목록으로
          </Link>

          {/* 카테고리 뱃지 */}
          <div className="mb-5">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: "rgba(5,150,105,0.10)", color: "#047857" }}
            >
              {archive.category || "학술논문"}
            </span>
          </div>

          {/* 제목 */}
          <h1
            className="font-black tracking-[-0.03em] leading-[1.15] mb-8"
            style={{ fontSize: "clamp(26px, 4vw, 46px)", color: "#1c1917" }}
          >
            {archive.title}
          </h1>

          {/* 메타 3종: 게시일 | 저자 | 분류 */}
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#059669" }}>
                게시일
              </span>
              <span style={{ color: "#57534e" }}>{createdAt}</span>
            </div>
            <span className="pt-4 leading-none" style={{ color: "#d6d3d1" }}>|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#059669" }}>
                저자
              </span>
              <span className="font-semibold" style={{ color: "#047857" }}>{archive.author || "저자 미상"}</span>
            </div>
            <span className="pt-4 leading-none" style={{ color: "#d6d3d1" }}>|</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#059669" }}>
                분류
              </span>
              <span style={{ color: "#57534e" }}>{archive.category || "학술논문"}</span>
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
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            boxShadow: "0 4px 24px rgba(28,25,23,0.08)",
          }}
        >
          <div
            className="px-6 md:px-8 py-3"
            style={{ borderBottom: "1px solid #f0efee" }}
          >
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#059669" }}>
              논문 상세 정보
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            <MetaCell label="저자" value={archive.author || "저자 미상"} />
            <MetaCell label="실제 발행일" value={publishedAt} highlight />
            <MetaCell label="자료 유형" value={displayType} />
            <MetaCell label="분류" value={archive.category || "학술논문"} />
          </div>
        </div>

        {/* 초록 카드 */}
        {archive.abstract_text && (
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "#ffffff",
              border: "1px solid #e7e5e4",
            }}
          >
            <h2 className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: "#059669" }}>
              초록 (Abstract)
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base" style={{ color: "#57534e" }}>
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
      style={{ borderRight: "1px solid #f0efee" }}
    >
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(5,150,105,0.60)" }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: highlight ? "#047857" : "#1c1917" }}
      >
        {value}
      </span>
    </div>
  )
}
