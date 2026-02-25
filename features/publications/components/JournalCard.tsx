'use client'

import { useState } from 'react'
import Link from 'next/link'

type JournalBook = {
    id: string
    title: string
    author: string
    journal_name: string | null
    volume_issue: string | null
    description: string | null
    cover_url: string | null
    download_url: string | null   // PDF URL로 사용
    is_featured: boolean
}

/*
  JournalCard: 영문저널 전용 카드
  - BookCard의 3D 효과(기울기, box-shadow)를 유지하면서
  - 클릭 시 Link 대신 인앱 PdfModal을 열어 UX 개선
*/
export default function JournalCard({ journal }: { journal: JournalBook }) {
    const [imgError, setImgError] = useState(false)

    const hasPdf = !!journal.download_url

    return (
        <>
            {/* 카드 클릭 시 /publications/[id] 상세 페이지로 이동 — PDF 뷰어는 상세 페이지 내 버튼으로 처리 */}
            <Link
                href={`/publications/${journal.id}`}
                className="block w-full text-left outline-none group"
                aria-label={journal.title}
            >
                <div className="relative" style={{ perspective: '800px' }}>
                    {/* 2도 기울기 + 호버 리프트 (BookCard와 동일한 UX) */}
                    <div
                        className="relative transition-transform duration-700"
                        style={{ transform: 'rotate(2deg)', transformOrigin: 'bottom left', willChange: 'transform' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'rotate(1deg) translateY(-10px)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'rotate(2deg)')}
                    >
                        {/* 15단계 종이 질감 box-shadow (BookCard와 동일) */}
                        <div
                            className="relative overflow-hidden rounded-r-[2px]"
                            style={{
                                boxShadow: `
                                    1px 0 0 #f9f9f9, 2px 0 0 #d0d0d0, 3px 0 0 #f5f5f5,
                                    4px 0 0 #ececec, 5px 0 0 #c8c8c8, 6px 0 0 #f2f2f2,
                                    7px 0 0 #e8e8e8, 8px 0 0 #c0c0c0, 9px 0 0 #eeeeee,
                                    10px 0 0 #e5e5e5, 11px 0 0 #bebebe, 12px 0 0 #ebebeb,
                                    13px 0 0 #e2e2e2, 14px 0 0 #b8b8b8, 15px 0 0 #e8e8e8,
                                    8px 8px 24px rgba(0,0,0,0.20), 14px 16px 40px rgba(0,0,0,0.12)
                                `,
                                marginRight: '15px',
                            }}
                        >
                            {/* 표지 영역 */}
                            <div className="aspect-[2/3] w-full relative bg-zinc-100 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                                {journal.cover_url && !imgError ? (
                                    <img
                                        src={journal.cover_url}
                                        alt={journal.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    /* 에메랄드 저널 플레이스홀더 */
                                    <div
                                        className="w-full h-full flex flex-col items-center justify-center gap-2 px-3"
                                        style={{ background: 'linear-gradient(160deg, #0d2b22, #0a1f18)' }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <p className="text-[8px] font-bold text-center" style={{ color: 'rgba(52,211,153,0.55)' }}>
                                            {journal.journal_name ?? 'Journal'}
                                        </p>
                                    </div>
                                )}

                                {/* LATEST 뱃지 */}
                                {journal.is_featured && (
                                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-[3px]"
                                        style={{ background: 'rgba(5,150,105,0.92)', border: '1px solid rgba(52,211,153,0.30)' }}>
                                        <span className="w-[5px] h-[5px] rounded-full bg-emerald-300 animate-pulse" />
                                        <span className="text-[7px] font-black tracking-[0.18em] uppercase" style={{ color: '#a7f3d0' }}>LATEST</span>
                                    </div>
                                )}

                                {/* 호버 오버레이: PDF 뷰어 안내 */}
                                <div
                                    className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(4,20,14,0.96) 0%, rgba(4,20,14,0.40) 55%, transparent 100%)',
                                        transition: 'opacity 0.4s ease',
                                    }}
                                >
                                    {hasPdf ? (
                                        <>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                                    PDF 열람하기
                                                </p>
                                            </div>
                                            {journal.volume_issue && (
                                                <p className="text-[8px] text-white/60">{journal.volume_issue}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-[9px] text-white/40">PDF 준비 중</p>
                                    )}
                                </div>
                            </div>

                            {/* 텍스트 영역 */}
                            <div className="px-3 py-3 bg-white flex flex-col gap-0.5">
                                {journal.journal_name && (
                                    <p className="text-[8px] font-black uppercase tracking-[0.12em] truncate" style={{ color: '#059669' }}>
                                        {journal.journal_name}
                                    </p>
                                )}
                                <h3 className="text-[12px] font-black text-zinc-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors duration-300">
                                    {journal.title}
                                </h3>
                                {journal.volume_issue && (
                                    <p className="text-[9px] text-zinc-400 font-medium">{journal.volume_issue}</p>
                                )}
                                <p className="text-[10px] text-zinc-500 font-medium break-words leading-snug">{journal.author}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    )
}
