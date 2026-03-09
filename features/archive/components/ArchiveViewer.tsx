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
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.32)",
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
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.50)",
            }}
        >
            {pdfUrl ? (
                <>
                    {/* PDF 뷰어 헤더 */}
                    <div
                        className="flex items-center justify-between px-6 py-3"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <span
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{ color: "#34d399" }}
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
                                    background: "rgba(16,185,129,0.20)",
                                    color: "#34d399",
                                    border: "1px solid rgba(52,211,153,0.30)",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.32)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(16,185,129,0.20)")}
                            >
                                ↗ 전체화면 보기
                            </a>
                            <a
                                href={pdfUrl}
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                                style={{
                                    background: "rgba(255,255,255,0.07)",
                                    color: "rgba(255,255,255,0.55)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
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
                    style={{ color: "rgba(255,255,255,0.72)" }}
                >
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
