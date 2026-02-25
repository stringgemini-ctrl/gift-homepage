'use client'

import { useState } from 'react'
import PdfModal from './PdfModal'

// Supabase project URL 환경변수 — 상대경로를 절대경로로 변환할 때 사용
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

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

    /*
      resolvedUrl: iframe에 실제로 꽂힐 최종 절대 URL 확정
      1) null/undefined → 빈 문자열
      2) 이미 http/https로 시작하는 절대경로 → 그대로 사용
      3) 상대경로(pdfs/journal_1.pdf) → Supabase Storage public URL로 변환
    */
    const resolvedUrl = (() => {
        if (!pdfUrl) return ''
        if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) return pdfUrl
        // 상대경로 → Supabase Storage journals 버킷 public URL 조립
        return `${SUPABASE_URL}/storage/v1/object/public/journals/${pdfUrl}`
    })()

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // 콘솔에서 실제 PDF URL 확인 (디버깅용)
        console.log('[JournalPdfButton] iframe에 전달될 PDF URL:', resolvedUrl)
        if (!resolvedUrl) {
            alert('PDF 경로가 등록되지 않았습니다. 관리자에게 문의해 주세요.')
            return
        }
        setIsPdfOpen(true)
    }

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={!resolvedUrl}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-black transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #065f46, #059669)', color: '#a7f3d0' }}
                title={resolvedUrl ? 'PDF 저널 보기' : 'PDF가 등록되지 않았습니다'}
            >
                <span>📄</span> PDF 저널 보기
            </button>

            {isPdfOpen && resolvedUrl && (
                <PdfModal
                    pdfUrl={resolvedUrl}
                    title={title}
                    onClose={() => setIsPdfOpen(false)}
                />
            )}
        </>
    )
}
