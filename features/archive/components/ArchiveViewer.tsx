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

    return (
        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    className="w-full min-h-[800px] rounded-xl"
                    title="PDF 뷰어"
                />
            ) : (
                <div className="p-8 prose prose-slate max-w-none text-slate-700 leading-loose">
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
