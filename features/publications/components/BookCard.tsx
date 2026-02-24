'use client'

import Link from 'next/link'

type Book = {
    id: string
    title: string
    author: string
    translator: string | null
    publisher: string | null
    published_year: number | null
    series: string | null
    description: string | null
    cover_url: string | null
    buy_link: string | null
    price: number | null
    is_featured: boolean
}

function formatPrice(price: number) {
    return '₩' + price.toLocaleString('ko-KR')
}

const SPINE_W = 24   // 책등 두께 (px) - 묵직한 양장본 느낌
const PAGE_H = 12   // 하단 종이 두께 (px)

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            <div className="relative" style={{ perspective: '900px', perspectiveOrigin: '55% 40%' }}>

                {/* ── 책 본체 (preserve-3d) ── */}
                <div
                    className="relative"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(-12deg) rotateX(3deg)',
                        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        willChange: 'transform',
                    }}
                    onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.transform =
                        'rotateY(-6deg) rotateX(1.5deg) translateY(-8px) translateZ(20px)')
                    }
                    onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.transform =
                        'rotateY(-12deg) rotateX(3deg)')
                    }
                >
                    {/* ── 앞면: 표지 ── */}
                    <div
                        className="relative rounded-r-md overflow-hidden"
                        style={{
                            borderLeft: `${SPINE_W}px solid transparent`,
                            boxShadow: `
                ${SPINE_W}px 4px 0 rgba(0,0,0,0.0),
                4px 8px 24px rgba(0,0,0,0.22),
                8px 20px 48px rgba(0,0,0,0.16),
                12px 32px 72px rgba(0,0,0,0.10)
              `,
                        }}
                    >
                        {/* 표지 이미지 컨테이너: GPU 레이어 강제 할당 → 깜빡임 방지 */}
                        <div
                            className="aspect-[3/4] bg-zinc-800 overflow-hidden relative"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'translateZ(0)',
                                willChange: 'transform',
                            }}
                        >
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    // 스크롤 깜빡임 방지: GPU 레이어 고정
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transform: 'translateZ(0)',
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden' as 'hidden',
                                        willChange: 'transform',
                                        transition: 'scale 0.7s ease-out',
                                    }}
                                    className="group-hover:scale-[1.03]"
                                    // priority 처리: fetchpriority 속성으로 대체 (Next.js img 태그)
                                    {...(priority ? { fetchPriority: 'high' as 'high' } : {})}
                                />
                            ) : (
                                /* 표지 없을 때: 무광 질감 플레이스홀더 */
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-3"
                                    style={{ background: 'linear-gradient(160deg, #1c2822, #121a16)' }}
                                >
                                    <span className="text-4xl opacity-10">📖</span>
                                    {book.series && (
                                        <p className="text-[9px] font-bold text-emerald-800/60 uppercase tracking-widest text-center px-4">
                                            {book.series}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/*
                추천 뱃지 - 딥 에메랄드
              */}
                            {book.is_featured && (
                                <div
                                    className="absolute top-3 right-3 z-10 px-2.5 py-1 text-[8px] font-black tracking-widest uppercase rounded-md"
                                    style={{ background: 'rgba(16,120,80,0.92)', color: '#c8f5e0' }}
                                >
                                    FEATURED
                                </div>
                            )}

                            {/*
                호버 오버레이: opacity 0 → 1 (0.5s ease)
                딥 에메랄드 포인트 컬러 적용
              */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(to top, rgba(5,30,20,0.90) 0%, rgba(5,30,20,0.35) 55%, transparent 100%)',
                                    transition: 'opacity 0.5s ease',
                                }}
                            >
                                {book.description && (
                                    <p className="text-white/70 text-[11px] leading-relaxed line-clamp-3 mb-2">
                                        {book.description}
                                    </p>
                                )}
                                {book.price && (
                                    <p
                                        className="text-[13px] font-bold mb-2"
                                        style={{ color: '#6ee7b7', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#34d399' }}>
                                    자세히 보기 →
                                </p>
                            </div>
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="px-4 py-4 bg-white flex flex-col gap-1">
                            {book.series && (
                                <p
                                    className="text-[9px] font-black uppercase tracking-[0.15em]"
                                    style={{ color: '#059669' }}
                                >
                                    {book.series}
                                </p>
                            )}
                            <h3 className="text-[14px] font-black text-zinc-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors duration-300">
                                {book.title}
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {book.author}
                                {book.translator && <span className="text-zinc-400"> / 역 {book.translator}</span>}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                                {(book.publisher || book.published_year) && (
                                    <p className="text-[10px] text-zinc-300">
                                        {[book.publisher, book.published_year].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                                {book.price && (
                                    <p
                                        className="text-[12px] font-bold ml-auto"
                                        style={{ color: '#047857', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 책등(Spine): 딥 다크 그린 우드 ── */}
                    <div
                        className="absolute top-0 left-0 h-full rounded-l-sm"
                        style={{
                            width: `${SPINE_W}px`,
                            background: 'linear-gradient(to right, #0a120e, #182d21, #0a120e)',
                            transform: `rotateY(90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'left center',
                            boxShadow: 'inset -2px 0 5px rgba(255,255,255,0.04)',
                        }}
                    />

                    {/*
            ── 종이 단면(Pages): 수백 장 종이 겹침 질감 ──
            크림/아이보리 계열 + 1px 경계선 반복으로
            실제 양장본 페이지 단면 구현
          */}
                    <div
                        className="absolute right-0 top-0"
                        style={{
                            width: `${SPINE_W}px`,
                            height: '75%',
                            transform: `rotateY(-90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'right center',
                            background: `repeating-linear-gradient(
                to bottom,
                #f2ede4 0px,
                #f2ede4 1.2px,
                #e5dfd5 1.2px,
                #e5dfd5 2.4px,
                #ede8df 2.4px,
                #ede8df 3.4px,
                #e0d9cf 3.4px,
                #e0d9cf 4px
              )`,
                            opacity: 0.95,
                        }}
                    />

                    {/* ── 책 하단 페이지 두께 ── */}
                    <div
                        className="absolute bottom-0 left-0 w-full"
                        style={{
                            height: `${PAGE_H}px`,
                            background: 'linear-gradient(to bottom, #ece7de, #d8d2c8)',
                            transform: `rotateX(-90deg) translateZ(${-PAGE_H / 2}px)`,
                            transformOrigin: 'bottom center',
                        }}
                    />
                </div>

                {/* ── 바닥 반사 ── */}
                {book.cover_url && (
                    <div
                        className="absolute left-4 right-0 overflow-hidden pointer-events-none"
                        style={{
                            top: '100%',
                            height: '36px',
                            transform: 'rotateY(-12deg)',
                            transformOrigin: 'top center',
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
                            filter: 'blur(3px)',
                        }}
                    >
                        <img
                            src={book.cover_url}
                            alt=""
                            className="w-full object-cover"
                            style={{ transform: 'scaleY(-1)', objectPosition: 'top' }}
                        />
                    </div>
                )}

                {/* ── 바닥 그림자 ── */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-14px',
                        left: '10%',
                        right: '10%',
                        height: '20px',
                        background: 'radial-gradient(ellipse, rgba(0,0,0,0.26) 0%, transparent 70%)',
                        filter: 'blur(7px)',
                        transform: 'scaleX(0.88)',
                    }}
                />
            </div>
        </Link>
    )
}
