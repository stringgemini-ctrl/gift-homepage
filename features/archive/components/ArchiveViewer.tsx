"use client"

interface ArchiveViewerProps {
    pdfUrl?: string | null
    content?: string | null
}

export default function ArchiveViewer({ pdfUrl, content }: ArchiveViewerProps) {
    if (!pdfUrl && !content) return null

    return (
        <div className="mt-8 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md">
            {pdfUrl ? (
                <div className="w-full h-[80vh] min-h-[600px]">
                    <object
                        data={pdfUrl}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <embed
                            src={pdfUrl}
                            type="application/pdf"
                            className="w-full h-full"
                        />
                    </object>
                </div>
            ) : (
                <div className="p-8 prose prose-invert max-w-none text-gray-300 leading-loose">
                    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
                </div>
            )}
        </div>
    )
}
