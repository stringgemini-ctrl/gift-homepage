import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import ArchiveViewer from "@/features/archive/components/ArchiveViewer"

export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArchiveDetailPage({ params }: PageProps) {
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

  // 발행일 포맷
  const publishedAt = archive.created_at
    ? new Date(archive.created_at).toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric",
    })
    : "미상"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── 상단 히어로 섹션 ── */}
      <div className="bg-gradient-to-b from-teal-950 to-slate-900 pt-12 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/archive"
            className="inline-flex items-center gap-1 text-sm text-teal-300 hover:text-teal-100 transition-colors mb-8"
          >
            ← 자료실 목록으로
          </Link>

          {/* 카테고리 태그 */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-700/60 text-teal-200 tracking-wider uppercase">
              {archive.category || "기타"}
            </span>
          </div>

          {/* 세리프 폰트 대제목 */}
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight text-white mb-6"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {archive.title}
          </h1>

          {/* 메타 정보 인라인 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-teal-300/80">
            <span>✍️ {archive.author || "저자 미상"}</span>
            <span>📅 {publishedAt}</span>
            <span>📂 {archive.category || "기타"}</span>
          </div>
        </div>
      </div>

      {/* ── 본문 컨텐츠 섹션 (히어로에서 겹쳐 올라오는 카드) ── */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 space-y-6 pb-16">

        {/* 메타데이터 글래스카드 */}
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-6 md:p-8">
          <h2 className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-5">
            논문 정보
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium">저자</span>
              <span className="text-base font-semibold text-slate-800">
                {archive.author || "저자 미상"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium">발행일</span>
              <span className="text-base font-semibold text-slate-800">{publishedAt}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium">자료 유형</span>
              <span className="text-base font-semibold text-slate-800">학술 논문 (PDF)</span>
            </div>
          </div>
        </div>

        {/* 초록(Abstract) 카드 */}
        {archive.abstract_text && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8">
            <h2 className="text-sm font-semibold text-teal-700 uppercase tracking-widest mb-4">
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
