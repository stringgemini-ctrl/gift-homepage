"use client"

interface ArchiveViewerProps {
    pdfUrl?: string | null
    content?: string | null
}

export default function ArchiveViewer({ pdfUrl, content }: ArchiveViewerProps) {
    if (!pdfUrl && !content) {
        return (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center text-slate-400 text-sm">
                PDF 파일이 제공되지 않는 자료입니다.
            </div>
        )
    }

    return (
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg">
            {pdfUrl ? (
                <>
                    {/* PDF 뷰어 헤더 – 다운로드 & 전체화면 버튼 */}
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            PDF 논문 원문
                        </span>
                        <div className="flex items-center gap-3">
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition-colors"
                            >
                                ↗ 전체화면 보기
                            </a>
                            <a
                                href={pdfUrl}
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                                ↓ 다운로드
                            </a>
                        </div>
                    </div>

                    {/* 네이티브 브라우저 PDF 뷰어 */}
                    <iframe
                        src={pdfUrl}
                        className="w-full min-h-[800px]"
                        title="PDF 뷰어"
                    />
                </>
            ) : (
                <div className="p-8 prose prose-slate max-w-none text-slate-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
