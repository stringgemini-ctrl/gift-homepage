import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import ArchiveViewer from "@/features/archive/components/ArchiveViewer"

export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { id } = await params
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

  let archive = null
  try {
    const { data, error } = await supabase
      .from("archives")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    archive = data
  } catch (error) {
    console.error("[ArchiveDetailPage] Failed to fetch archive detail:", error)
  }

  if (!archive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        자료를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/archive" className="inline-block text-sm text-emerald-700 hover:underline transition-colors">
          ← 목록으로 돌아가기
        </Link>

        {/* 논문 메타 정보 카드 */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            {archive.category || "기타"}
          </div>
          <h1 className="text-2xl font-bold leading-relaxed text-slate-900">
            {archive.title}
          </h1>
          <div className="text-slate-500 text-sm">
            저자: <span className="text-slate-700 font-medium">{archive.author || "저자 미상"}</span>
          </div>

          {archive.abstract_text && (
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-base font-semibold mb-2 text-emerald-700">
                요약 (Abstract)
              </h2>
              <p className="text-slate-600 leading-loose whitespace-pre-wrap text-sm md:text-base">
                {archive.abstract_text}
              </p>
            </div>
          )}
        </div>

        {/* PDF 뷰어 */}
        <ArchiveViewer pdfUrl={archive.pdf_url} content={archive.content} />
      </div>
    </div>
  )
}
