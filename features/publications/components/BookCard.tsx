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

const SPINE_W = 26  // 양장본 책등 두께
const PAGE_H = 14  // 책 하단 두께

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            <div className="relative" style={{ perspective: '900px', perspectiveOrigin: '55% 40%' }}>

                {/* ── 책 본체 ── */}
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
                        'rotateY(-6deg) rotateX(1deg) translateY(-10px) translateZ(24px)')
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
                4px 10px 28px rgba(0,0,0,0.22),
                8px 24px 56px rgba(0,0,0,0.16),
                14px 36px 80px rgba(0,0,0,0.10)
              `,
                        }}
                    >
                        {/* 표지 이미지: GPU 레이어 고정 (깜빡임 방지) */}
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
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transform: 'translateZ(0)',
                                        backfaceVisibility: 'hidden',
                                        willChange: 'transform',
                                        transition: 'scale 0.7s ease-out',
                                    }}
                                    className="group-hover:scale-[1.03]"
                                    {...(priority ? { fetchPriority: 'high' as 'high' } : {})}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-4"
                                    style={{ background: 'linear-gradient(160deg, #1c2822, #121a16)' }}
                                >
                                    <span className="text-5xl opacity-10">📖</span>
                                    {book.series && (
                                        <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest text-center px-6">
                                            {book.series}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 추천 뱃지 */}
                            {book.is_featured && (
                                <div
                                    className="absolute top-4 right-4 z-10 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-md"
                                    style={{ background: 'rgba(16,120,80,0.92)', color: '#a7f3d0' }}
                                >
                                    FEATURED
                                </div>
                            )}

                            {/* 호버 오버레이: 높은 대비(텍스트 white/90) */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(to top, rgba(4,20,14,0.94) 0%, rgba(4,20,14,0.40) 55%, transparent 100%)',
                                    transition: 'opacity 0.5s ease',
                                }}
                            >
                                {book.description && (
                                    <p className="text-white/90 text-[13px] leading-relaxed line-clamp-3 mb-3">
                                        {book.description}
                                    </p>
                                )}
                                {book.price && (
                                    <p
                                        className="text-[15px] font-bold mb-2"
                                        style={{ color: '#6ee7b7', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                    자세히 보기 →
                                </p>
                            </div>
                        </div>

                        {/* 텍스트 영역: 더 큰 폰트, 확장된 패딩 */}
                        <div className="px-5 py-5 bg-white flex flex-col gap-1.5">
                            {book.series && (
                                <p className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: '#059669' }}>
                                    {book.series}
                                </p>
                            )}
                            <h3 className="text-[16px] font-black text-zinc-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors duration-300">
                                {book.title}
                            </h3>
                            <p className="text-[13px] text-zinc-600 mt-0.5 font-medium">
                                {book.author}
                                {book.translator && <span className="text-zinc-400"> / 역 {book.translator}</span>}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                {(book.publisher || book.published_year) && (
                                    <p className="text-[11px] text-zinc-400">
                                        {[book.publisher, book.published_year].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                                {book.price && (
                                    <p
                                        className="text-[14px] font-black ml-auto"
                                        style={{ color: '#047857', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 책등(Spine): 딥 다크 그린 ── */}
                    <div
                        className="absolute top-0 left-0 h-full rounded-l-sm"
                        style={{
                            width: `${SPINE_W}px`,
                            background: 'linear-gradient(to right, #06100a, #183024, #06100a)',
                            transform: `rotateY(90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'left center',
                            boxShadow: 'inset -2px 0 5px rgba(255,255,255,0.03)',
                        }}
                    />

                    {/* ── 종이 단면(Pages): 실제 양장본 겹침 질감 ── */}
                    <div
                        className="absolute right-0 top-0"
                        style={{
                            width: `${SPINE_W}px`,
                            height: '75%',
                            transform: `rotateY(-90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'right center',
                            background: `repeating-linear-gradient(
                to bottom,
                #f4efe6 0px,
                #f4efe6 1.2px,
                #e8e2d8 1.2px,
                #e8e2d8 2.4px,
                #eee8df 2.4px,
                #eee8df 3.4px,
                #e2dcd2 3.4px,
                #e2dcd2 4px
              )`,
                            opacity: 0.95,
                        }}
                    />

                    {/* ── 하단 페이지 두께 ── */}
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
                        className="absolute left-5 right-0 overflow-hidden pointer-events-none"
                        style={{
                            top: '100%',
                            height: '40px',
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

                {/*
          ── 사이버네틱 선반 글로우 (Futuristic Glassmorphism Shelf) ──
          책 하단에 얇은 에메랄드 라이팅 보더 + 타원 글로우로
          미래적 진열장 위에 거치된 느낌 구현
        */}
                {/* 선반 라이팅 라인 */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-3px',
                        left: '12%',
                        right: '8%',
                        height: '1.5px',
                        background: 'linear-gradient(to right, transparent, rgba(52,211,153,0.7) 30%, rgba(52,211,153,0.9) 50%, rgba(52,211,153,0.7) 70%, transparent)',
                        borderRadius: '100%',
                        filter: 'blur(0.5px)',
                    }}
                />
                {/* 사이버네틱 타원 글로우 */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-18px',
                        left: '5%',
                        right: '5%',
                        height: '28px',
                        background: 'radial-gradient(ellipse, rgba(16,185,129,0.28) 0%, rgba(16,185,129,0.06) 60%, transparent 80%)',
                        filter: 'blur(6px)',
                    }}
                />
                {/* 딥 섀도우 */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-22px',
                        left: '10%',
                        right: '10%',
                        height: '18px',
                        background: 'radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, transparent 70%)',
                        filter: 'blur(6px)',
                    }}
                />
            </div>
        </Link>
    )
}
