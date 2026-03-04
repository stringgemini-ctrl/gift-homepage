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
      <div className="min-h-screen bg-[#0a0f12] flex items-center justify-center text-gray-400">
        자료를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f12] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/archive" className="inline-block text-sm text-emerald-400 hover:underline transition-colors">
          &larr; 목록으로 돌아가기
        </Link>

        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md space-y-6">
          <div className="text-sm font-medium text-emerald-400">
            {archive.category || "Uncategorized"}
          </div>
          <h1 className="text-3xl font-semibold leading-relaxed text-white">
            {archive.title}
          </h1>
          <div className="text-gray-400 text-sm">
            작성자: <span className="text-gray-300">{archive.author || "Unknown"}</span>
          </div>

          {archive.abstract_text && (
            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <h2 className="text-lg font-medium mb-3 text-emerald-400">
                요약 (Abstract)
              </h2>
              <p className="text-gray-300 leading-loose whitespace-pre-wrap text-sm md:text-base">
                {archive.abstract_text}
              </p>
            </div>
          )}
        </div>

        <ArchiveViewer pdfUrl={archive.pdf_url} content={archive.content} />
      </div>
    </div>
  )
}
