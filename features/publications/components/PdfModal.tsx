'use client'

import { useEffect, useRef } from 'react'

interface PdfModalProps {
    pdfUrl: string
    title: string
    onClose: () => void
}

/*
  PdfModal: iframe 기반 인앱 PDF 뷰어
  - 화면의 90%를 덮는 전체화면 모달
  - 에메랄드빛이 살짝 감도는 어두운 backdrop
  - 브라우저 기본 PDF 뷰어 (확대·인쇄 지원)
  - Esc 키 및 바깥 클릭으로 닫기
*/
export default function PdfModal({ pdfUrl, title, onClose }: PdfModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        /*
          pdfUrl이 비어있거나 절대경로가 아니면 콘솔에 경고 — 인셉션 버그 추적용
          실제 배포에서도 남겨두어 Vercel 함수 로그로 확인 가능
        */
        if (!pdfUrl) {
            console.error('[PdfModal] pdfUrl이 비어있습니다. iframe을 렌더링하지 않습니다.')
        } else if (!pdfUrl.startsWith('http')) {
            console.warn('[PdfModal] pdfUrl이 절대경로가 아닙니다:', pdfUrl)
        } else {
            console.log('[PdfModal] iframe src:', pdfUrl)
        }

        // Esc 키로 닫기
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        // 모달 열리는 동안 배경 스크롤 차단
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [onClose, pdfUrl])

    const handleBackdropClick = (e: React.MouseEvent) => {
        // backdrop 자체를 클릭했을 때만 닫기 (모달 내부 클릭 제외)
        if (e.target === backdropRef.current) onClose()
    }

    /*
      인셉션 버그 원천 차단:
      pdfUrl이 없거나 http/https로 시작하지 않으면 iframe 렌더링 자체를 막음.
      브라우저는 빈 src나 상대경로를 현재 페이지 URL로 해석하여 자기 자신을 렌더링.
    */
    const isSafeUrl = !!pdfUrl && pdfUrl.startsWith('http')

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
            style={{
                /*
                  에메랄드 틴트가 살짝 감도는 어두운 블러 backdrop:
                  - rgba(2, 10, 8, 0.85): 짙은 흑녹색
                  - backdrop-filter blur로 배경 흐리게
                */
                background: 'rgba(2,10,8,0.86)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            {/* 모달 패널 */}
            <div
                className="relative flex flex-col w-full max-w-6xl rounded-2xl overflow-hidden"
                style={{
                    height: '90vh',
                    background: '#0a0f0a',
                    border: '1px solid rgba(52,211,153,0.15)',
                    boxShadow: '0 0 60px rgba(16,185,129,0.08), 0 25px 50px rgba(0,0,0,0.6)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{
                        background: 'rgba(16,185,129,0.06)',
                        borderBottom: '1px solid rgba(52,211,153,0.12)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.20)' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                English Journal
                            </p>
                            <p className="text-[13px] font-bold text-white/90 line-clamp-1">{title}</p>
                        </div>
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[12px] transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.70)',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'
                                ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.30)'
                                ; (e.currentTarget as HTMLElement).style.color = '#fca5a5'
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                                ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'
                                ; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.70)'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        닫기
                    </button>
                </div>

                {/* PDF 뷰어 — object 태그로 type 강제 명시, contentType 없는 구파일도 렌더링 */}
                <div className="flex-1 bg-slate-100">
                    {isSafeUrl ? (
                        <object
                            data={`${pdfUrl}#view=FitH`}
                            type="application/pdf"
                            className="w-full h-full border-none"
                            aria-label={title}
                        >
                            {/* object 미지원 브라우저 폴백: embed 태그 */}
                            <embed
                                src={`${pdfUrl}#view=FitH`}
                                type="application/pdf"
                                className="w-full h-full border-none"
                            />
                        </object>
                    ) : (
                        /* URL 없거나 비정상일 때: 인셉션 방지 에러 UI */
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-white/60 text-sm font-medium">PDF 경로를 불러올 수 없습니다.</p>
                            <p className="text-white/30 text-xs">관리자 페이지에서 PDF 파일을 다시 업로드해 주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
