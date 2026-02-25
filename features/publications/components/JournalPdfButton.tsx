'use client'

import { useState } from 'react'
import PdfModal from './PdfModal'

interface Props {
    pdfUrl: string
    title: string
}

/*
  JournalPdfButton: 저널 상세 페이지 전용 PDF 뷰어 버튼
  - 서버 컴포넌트 안에서 use client 불가 → 별도 클라이언트 컴포넌트로 분리
  - 클릭 시 e.preventDefault() + e.stopPropagation()으로 이벤트 버블링 완전 차단
  - isPdfOpen state를 이 컴포넌트 내부에서만 관리 → 외부 리렌더링으로 인한 초기화 없음
*/
export default function JournalPdfButton({ pdfUrl, title }: Props) {
    const [isPdfOpen, setIsPdfOpen] = useState(false)

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault()       // 링크/폼 기본 동작 차단
        e.stopPropagation()      // 상위 요소(Link, 딤드 등)로의 버블링 차단
        setIsPdfOpen(true)
    }

    return (
        <>
            <button
                onClick={handleOpen}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-black transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #065f46, #059669)', color: '#a7f3d0' }}
            >
                <span>📄</span> PDF 저널 보기
            </button>

            {/*
              isPdfOpen이 true일 때만 PdfModal 마운트.
              PdfModal 내부의 onClose가 이 컴포넌트의 setIsPdfOpen(false)만 호출하므로
              외부 페이지 라우팅이나 리렌더링과 완전히 독립됨.
            */}
            {isPdfOpen && (
                <PdfModal
                    pdfUrl={pdfUrl}
                    title={title}
                    onClose={() => setIsPdfOpen(false)}
                />
            )}
        </>
    )
}
