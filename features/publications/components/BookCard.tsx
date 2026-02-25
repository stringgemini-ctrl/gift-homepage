'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

type Book = {
    id: string
    title: string
    author: string
    translator: string | null
    publisher: string | null
    published_year: number | null
    series: string | null
    category: string | null
    description: string | null
    cover_url: string | null
    buy_link: string | null
    download_url: string | null
    price: number | null
    is_featured: boolean
}

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
    // 이미지 로드 실패 추적 → Fallback UI 표시
    const [imgError, setImgError] = useState(false)

    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            <div className="relative" style={{ perspective: '800px' }}>

                {/* 책 본체: 살짝 오른쪽으로 기울어진 진열 자세 + 호버 시 리프트 */}
                <div
                    className="relative transition-transform duration-700"
                    style={{
                        /*
                          5도 기울이기: 선반 위에 기대어 있는 자연스러운 자세
                          - rotate(3deg): 너무 과하지 않게 3도
                          - transform-origin: bottom left → 하단 왼쪽을 축으로 기울어짐
                        */
                        transform: 'rotate(3deg)',
                        transformOrigin: 'bottom left',
                        willChange: 'transform',
                    }}
                    onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.transform =
                        'rotate(1deg) translateY(-10px)')
                    }
                    onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.transform =
                        'rotate(3deg)')
                    }
                >
                    {/*
            종이 페이지 두께감 box-shadow:
            - 흰색/밝은회색 계열 (#f9f9f9 ~ #e0e0e0)
            - 짝수 스텝마다 어두운 라인 (#c8c8c8) 으로 낱장 페이지 경계 표현
            - marginRight로 페이지 단면이 보이는 공간 확보
          */}
                    <div
                        className="relative overflow-hidden rounded-r-[2px]"
                        style={{
                            boxShadow: `
                1px 0 0 #f9f9f9,
                2px 0 0 #d0d0d0,
                3px 0 0 #f5f5f5,
                4px 0 0 #ececec,
                5px 0 0 #c8c8c8,
                6px 0 0 #f2f2f2,
                7px 0 0 #e8e8e8,
                8px 0 0 #c0c0c0,
                9px 0 0 #eeeeee,
                10px 0 0 #e5e5e5,
                11px 0 0 #bebebe,
                12px 0 0 #ebebeb,
                13px 0 0 #e2e2e2,
                14px 0 0 #b8b8b8,
                15px 0 0 #e8e8e8,
                8px 8px 24px rgba(0,0,0,0.20),
                14px 16px 40px rgba(0,0,0,0.12),
                20px 24px 60px rgba(0,0,0,0.07)
              `,
                            marginRight: '15px',
                        }}
                    >
                        {/* 표지: aspect-[2/3] 고정 비율, GPU 레이어 */}
                        <div
                            className="aspect-[2/3] w-full relative bg-zinc-100 overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {book.cover_url && !imgError ? (
                                <Image
                                    src={book.cover_url}
                                    alt={book.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                    priority={priority}
                                    sizes="285px"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                /* Fallback: 이미지 없음 / 로드 실패 시 에메랄드 플레이스홀더 */
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-2 px-3"
                                    style={{ background: 'linear-gradient(160deg, #0d2b22, #0a1f18)' }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-[8px] font-bold text-center leading-relaxed"
                                        style={{ color: 'rgba(52,211,153,0.55)' }}>
                                        이미지<br />준비 중
                                    </p>
                                </div>
                            )}

                            {/* LATEST 뱃지 (featured 도서) */}
                            {book.is_featured && (
                                <div
                                    className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-[3px]"
                                    style={{
                                        background: 'rgba(5,150,105,0.92)',
                                        border: '1px solid rgba(52,211,153,0.30)',
                                        backdropFilter: 'blur(4px)',
                                    }}
                                >
                                    <span className="w-[5px] h-[5px] rounded-full bg-emerald-300 animate-pulse" />
                                    <span className="text-[7px] font-black tracking-[0.18em] uppercase" style={{ color: '#a7f3d0' }}>
                                        LATEST
                                    </span>
                                </div>
                            )}

                            {/* 호버 오버레이: 가격 정보 완전 제거 */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(to top, rgba(4,20,14,0.94) 0%, rgba(4,20,14,0.40) 55%, transparent 100%)',
                                    transition: 'opacity 0.4s ease',
                                }}
                            >
                                {book.description && (
                                    <p className="text-white/90 text-[10px] leading-relaxed line-clamp-3 mb-2">
                                        {book.description}
                                    </p>
                                )}
                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                    자세히 보기 →
                                </p>
                            </div>
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="px-3 py-3 bg-white flex flex-col gap-0.5">
                            {book.series && (
                                <p className="text-[8px] font-black uppercase tracking-[0.12em] truncate" style={{ color: '#059669' }}>
                                    {book.series}
                                </p>
                            )}
                            <h3 className="text-[12px] font-black text-zinc-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors duration-300">
                                {book.title}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-medium truncate">
                                {book.author}
                                {book.translator && <span className="text-zinc-400"> / 역 {book.translator}</span>}
                            </p>
                            {book.published_year && (
                                <p className="text-[9px] text-zinc-300 mt-0.5">{book.published_year}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
