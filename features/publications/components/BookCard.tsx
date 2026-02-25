'use client'

import Link from 'next/link'
import Image from 'next/image'

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

function formatPrice(price: number) {
    return '₩' + price.toLocaleString('ko-KR')
}

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            <div
                className="relative"
                /*
                  perspective 컨테이너: 3D 효과를 위한 원근감 설정
                  책 하단이 선반에 닿아야 하므로 하단 여백 없음
                */
                style={{ perspective: '800px', perspectiveOrigin: '60% 50%' }}
            >
                {/* ── 책 본체: 호버 시 살짝 들림 ── */}
                <div
                    className="relative transition-transform duration-700"
                    style={{ willChange: 'transform' }}
                    onMouseEnter={e =>
                        ((e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)')
                    }
                    onMouseLeave={e =>
                        ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')
                    }
                >
                    {/*
            하드커버 3D 두께 효과:
            - border-r: 오른쪽 종이 단면 (얇은 테두리들 여러 겹)
            - box-shadow로 실제 두껍고 무거운 책 입체감 구현
            - aspect-[2/3] 강제 비율 통일
          */}
                    <div
                        className="relative overflow-hidden rounded-r-sm"
                        style={{
                            /*
                              다중 box-shadow로 두껍게 쌓인 종이 단면 표현:
                              - 1~5px: 주황빛 가장자리 (책 커버 측면)
                              - 6~22px: 종이 쌓임 표현 (밝음→어두움 그라디언트)
                              - 마지막: 환경 그림자
                            */
                            boxShadow: `
                2px 0 0 #c8b89a,
                4px 0 0 #d4c4aa,
                6px 0 0 #e8dcc8,
                8px 0 0 #f0e8d8,
                10px 0 0 #ede4d4,
                12px 0 0 #e4dac8,
                14px 0 0 #ddd0be,
                16px 0 0 #d4c8b4,
                18px 0 0 #c8bca8,
                20px 0 0 #b8ac9a,
                8px 6px 20px rgba(0,0,0,0.22),
                14px 12px 40px rgba(0,0,0,0.14),
                20px 20px 60px rgba(0,0,0,0.08)
              `,
                            // 오른쪽 책등 공간 확보
                            marginRight: '20px',
                        }}
                    >
                        {/* 표지 이미지: aspect-[2/3] 강제, GPU 레이어 고정 */}
                        <div
                            className="aspect-[2/3] w-full overflow-hidden relative bg-zinc-800"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                            }}
                        >
                            {book.cover_url ? (
                                <Image
                                    src={book.cover_url}
                                    alt={book.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                    style={{ willChange: 'transform' }}
                                    priority={priority}
                                    sizes="260px"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center gap-3 px-4"
                                    style={{ background: 'linear-gradient(160deg, #1c2822, #121a16)' }}
                                >
                                    <span className="text-4xl opacity-10">📖</span>
                                    <p className="text-[9px] font-bold text-emerald-800/50 uppercase tracking-widest text-center">
                                        {book.series ?? book.title}
                                    </p>
                                </div>
                            )}

                            {/* NEW RELEASE 뱃지 (Featured 도서에만) */}
                            {book.is_featured && (
                                <div
                                    className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-sm"
                                    style={{
                                        background: 'rgba(5,150,105,0.92)',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid rgba(52,211,153,0.30)',
                                    }}
                                >
                                    <span className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse" />
                                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-emerald-100">
                                        NEW
                                    </span>
                                </div>
                            )}

                            {/* 호버 오버레이: 높은 대비 정보 노출 */}
                            <div
                                className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'linear-gradient(to top, rgba(4,20,14,0.94) 0%, rgba(4,20,14,0.40) 55%, transparent 100%)',
                                    transition: 'opacity 0.4s ease',
                                }}
                            >
                                {book.description && (
                                    <p className="text-white/90 text-[10px] leading-relaxed line-clamp-2 mb-1.5">
                                        {book.description}
                                    </p>
                                )}
                                {book.price && (
                                    <p className="text-[12px] font-bold mb-1" style={{ color: '#6ee7b7', fontVariantNumeric: 'tabular-nums' }}>
                                        {formatPrice(book.price)}
                                    </p>
                                )}
                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>
                                    자세히 보기 →
                                </p>
                            </div>
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="px-3 py-3 bg-white flex flex-col gap-1">
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
                                {book.translator && (
                                    <span className="text-zinc-400"> / 역 {book.translator}</span>
                                )}
                            </p>
                            {(book.published_year || book.price) && (
                                <div className="flex items-center justify-between mt-1">
                                    {book.published_year && (
                                        <p className="text-[9px] text-zinc-300">{book.published_year}</p>
                                    )}
                                    {book.price && (
                                        <p className="text-[11px] font-black ml-auto" style={{ color: '#047857', fontVariantNumeric: 'tabular-nums' }}>
                                            {formatPrice(book.price)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
