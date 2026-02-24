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

// 원화 포맷: 25000 → ₩25,000
function formatPrice(price: number) {
    return '₩' + price.toLocaleString('ko-KR')
}

// 책등 너비(px): 실제 책 두께감
const SPINE_W = 22
const PAGE_H = 10

export default function BookCard({ book }: { book: Book }) {
    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            {/*
        구조:
        [perspective wrapper]
          └─ [book-group: transform-style preserve-3d + rotateY(-12deg)]
               ├─ [front face: 표지 이미지]
               ├─ [spine: 책등 - 왼쪽 세로면]
               └─ [pages: 종이 단면 - 오른쪽 세로면]
        [reflection: 표지를 뒤집어 흐리게 표시]
      */}
            <div className="relative" style={{ perspective: '900px', perspectiveOrigin: '55% 40%' }}>

                {/* ── 책 본체 (preserve-3d) ── */}
                <div
                    className="relative"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(-12deg) rotateX(3deg)',
                        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'rotateY(-6deg) rotateX(1.5deg) translateY(-8px) translateZ(20px)'
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'rotateY(-12deg) rotateX(3deg)'
                    }}
                >
                    {/* ── 앞면: 표지 ── */}
                    <div
                        className="relative rounded-r-md overflow-hidden"
                        style={{
                            boxShadow: `
                ${SPINE_W}px 0 0 rgba(0,0,0,0.0),
                4px 8px 24px rgba(0,0,0,0.25),
                8px 20px 50px rgba(0,0,0,0.20),
                12px 32px 80px rgba(0,0,0,0.12)
              `,
                            borderLeft: `${SPINE_W}px solid transparent`, // 책등 공간 확보
                        }}
                    >
                        {/* 표지 이미지 */}
                        <div className="aspect-[3/4] bg-zinc-800 overflow-hidden relative">
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                                    style={{ background: 'linear-gradient(160deg, #2d2d35, #1a1a22)' }}>
                                    <span className="text-4xl opacity-20">📖</span>
                                    {book.series && (
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center px-4">
                                            {book.series}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 표면 조명 그라디언트 (고급 갤러리 조명 느낌) */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,0,0,0.08) 100%)',
                                }}
                            />

                            {/* 추천 뱃지 */}
                            {book.is_featured && (
                                <div className="absolute top-3 right-3 z-10 px-2 py-1 text-[8px] font-black tracking-widest uppercase rounded-md"
                                    style={{ background: 'rgba(180,130,60,0.9)', color: '#fff3d0' }}>
                                    FEATURED
                                </div>
                            )}

                            {/* 호버 오버레이 */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0.30) 55%, transparent 100%)',
                                    transition: 'opacity 0.5s ease',
                                }}
                            >
                                {book.description && (
                                    <p className="text-white/70 text-[11px] leading-relaxed line-clamp-3 mb-2">
                                        {book.description}
                                    </p>
                                )}
                                {book.price && (
                                    <p className="text-amber-300/90 text-[13px] font-bold mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest">
                                    자세히 보기 →
                                </p>
                            </div>
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="px-4 py-4 bg-white flex flex-col gap-1">
                            {book.series && (
                                <p className="text-[9px] font-black uppercase tracking-[0.15em]"
                                    style={{ color: '#8a6a3a' }}>{book.series}</p>
                            )}
                            <h3 className="text-[14px] font-black text-zinc-900 leading-snug line-clamp-2">
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
                                    <p className="text-[12px] font-bold text-zinc-700 ml-auto" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 책등 (Spine) ── */}
                    <div
                        className="absolute top-0 left-0 h-full rounded-l-[2px]"
                        style={{
                            width: `${SPINE_W}px`,
                            background: 'linear-gradient(to right, #1a1412, #2d2420, #1a1412)',
                            transform: `rotateY(90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'left center',
                            boxShadow: 'inset -3px 0 6px rgba(255,255,255,0.05)',
                        }}
                    />

                    {/* ── 종이 단면 (Pages) - 오른쪽 세로 ── */}
                    <div
                        className="absolute right-0 top-0"
                        style={{
                            width: `${SPINE_W}px`,
                            height: '75%', // 표지 영역만 (텍스트 영역 제외)
                            background: 'repeating-linear-gradient(to bottom, #f5f0e8, #f5f0e8 1.5px, #e8e2d8 1.5px, #e8e2d8 3px)',
                            transform: `rotateY(-90deg) translateZ(${-SPINE_W / 2}px)`,
                            transformOrigin: 'right center',
                            opacity: 0.9,
                        }}
                    />

                    {/* ── 책 하단 페이지 두께 (Pages bottom) ── */}
                    <div
                        className="absolute bottom-0 left-0 w-full"
                        style={{
                            height: `${PAGE_H}px`,
                            background: 'linear-gradient(to bottom, #eceae4, #dddad2)',
                            transform: `rotateX(-90deg) translateZ(${-PAGE_H / 2}px)`,
                            transformOrigin: 'bottom center',
                        }}
                    />
                </div>

                {/* ── 바닥 반사 (Reflection) ── */}
                <div
                    className="absolute left-4 right-0 overflow-hidden pointer-events-none"
                    style={{
                        top: '100%',
                        height: '40px',
                        transform: 'rotateY(-12deg)',
                        transformOrigin: 'top center',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)',
                        filter: 'blur(2px)',
                    }}
                >
                    {book.cover_url && (
                        <img
                            src={book.cover_url}
                            alt=""
                            className="w-full object-cover"
                            style={{ transform: 'scaleY(-1)', objectPosition: 'top' }}
                        />
                    )}
                </div>

                {/* ── 바닥 그림자 (깊이감 극대화) ── */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        bottom: '-16px',
                        left: '8%',
                        right: '8%',
                        height: '24px',
                        background: 'radial-gradient(ellipse, rgba(0,0,0,0.30) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                        transform: 'scaleX(0.9)',
                    }}
                />
            </div>
        </Link>
    )
}
