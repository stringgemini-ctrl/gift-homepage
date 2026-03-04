"use client"

interface ArchiveViewerProps {
    pdfUrl?: string | null
    content?: string | null
}

export default function ArchiveViewer({ pdfUrl, content }: ArchiveViewerProps) {
    if (!pdfUrl && !content) {
        return (
            <div className="mt-6 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
                PDF 파일이 제공되지 않는 자료입니다.
            </div>
        )
    }

    // Google Docs Viewer를 경유하여 백지 현상 우회
    // Supabase Storage의 퍼블릭 URL을 인코딩하여 Google 서버에서 직접 렌더링
    const googleViewerUrl = pdfUrl
        ? `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
        : null

    return (
        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {googleViewerUrl ? (
                <iframe
                    src={googleViewerUrl}
                    className="w-full min-h-[800px]"
                    title="PDF 뷰어"
                    allowFullScreen
                />
            ) : (
                // HTML 콘텐츠 폴백 (pdf_url이 없는 경우)
                <div className="p-8 prose prose-slate max-w-none text-slate-700 leading-loose">
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
