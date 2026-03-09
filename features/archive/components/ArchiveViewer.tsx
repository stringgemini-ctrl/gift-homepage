"use client"

interface ArchiveViewerProps {
    pdfUrl?: string | null
    content?: string | null
}

export default function ArchiveViewer({ pdfUrl, content }: ArchiveViewerProps) {
    if (!pdfUrl && !content) {
        return (
            <div
                className="p-8 rounded-2xl text-center text-sm"
                style={{
                    background: "rgba(28,25,23,0.03)",
                    border: "1px solid #e7e5e4",
                    color: "#a8a29e",
                }}
            >
                PDF 파일이 제공되지 않는 자료입니다.
            </div>
        )
    }

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: "#ffffff",
                border: "1px solid #e7e5e4",
                boxShadow: "0 4px 24px rgba(28,25,23,0.08)",
            }}
        >
            {pdfUrl ? (
                <>
                    {/* PDF 뷰어 헤더 */}
                    <div
                        className="flex items-center justify-between px-6 py-3"
                        style={{ borderBottom: "1px solid #f0efee", background: "#fafaf9" }}
                    >
                        <span
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{ color: "#059669" }}
                        >
                            PDF 논문 원문
                        </span>
                        <div className="flex items-center gap-3">
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                                style={{
                                    background: "rgba(5,150,105,0.12)",
                                    color: "#047857",
                                    border: "1px solid rgba(5,150,105,0.35)",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(5,150,105,0.20)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(5,150,105,0.12)")}
                            >
                                ↗ 전체화면 보기
                            </a>
                            <a
                                href={pdfUrl}
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                                style={{
                                    background: "#f5f5f4",
                                    color: "#57534e",
                                    border: "1px solid #d6d3d1",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#e7e5e4")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#f5f5f4")}
                            >
                                ↓ 다운로드
                            </a>
                        </div>
                    </div>

                    {/* 네이티브 브라우저 PDF 뷰어 */}
                    <iframe
                        src={pdfUrl}
                        className="w-full min-h-[800px] block"
                        title="PDF 뷰어"
                        style={{ border: "none" }}
                    />
                </>
            ) : (
                <div
                    className="p-8 leading-relaxed text-sm md:text-base"
                    style={{ color: "#44403c" }}
                >
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
