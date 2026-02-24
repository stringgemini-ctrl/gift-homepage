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
    is_featured: boolean
}

export default function BookCard({ book }: { book: Book }) {
    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            {/*
        3D 고도화 전략:
        1. 다중 레이어 그림자(Layered Shadows): 근거리, 중거리, 원거리 3단계
        2. 조명 그라디언트(Lighting): 카드 좌상단 → 우하단 방향의 은은한 빛 반사
        3. 호버: translateY + 그림자가 동시에 드라마틱하게 강화
        4. transition 0.7s cubic-bezier: 묵직하고 중후한 이징
      */}
            <article
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100/60 cursor-pointer relative"
                style={{
                    /*
                      3단계 다중 그림자:
                      - 1단계(근접): 매우 부드럽고 작은 그림자 → 표면 질감
                      - 2단계(중간): 실제 부유감을 주는 핵심 그림자
                      - 3단계(원거리): 환경 조명에 의한 넓고 옅은 그림자
                    */
                    boxShadow: `
            0 1px 3px rgba(0,0,0,0.04),
            0 6px 18px rgba(0,0,0,0.07),
            0 16px 40px rgba(0,0,0,0.05)
          `,
                    transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(-10px)'
                    el.style.boxShadow = `
            0 2px 4px rgba(0,0,0,0.05),
            0 12px 32px rgba(0,0,0,0.12),
            0 32px 72px rgba(0,0,0,0.10),
            0 0 0 1px rgba(16,185,129,0.06)
          `
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = `
            0 1px 3px rgba(0,0,0,0.04),
            0 6px 18px rgba(0,0,0,0.07),
            0 16px 40px rgba(0,0,0,0.05)
          `
                }}
            >
                {/* 카드 표면 조명 그라디언트 (glassmorphism-lite) */}
                <div
                    className="absolute inset-0 pointer-events-none z-10 rounded-2xl opacity-60"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.0) 50%, rgba(0,0,0,0.02) 100%)',
                    }}
                />

                {/* 표지 이미지 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {book.cover_url ? (
                        <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                    ) : (
                        /* 표지 없을 때 세련된 플레이스홀더 */
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                            style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                            <span className="text-5xl opacity-15">📖</span>
                            {book.series && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
                                    {book.series}
                                </p>
                            )}
                        </div>
                    )}

                    {/* 추천 뱃지 */}
                    {book.is_featured && (
                        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-[#f68d2e] text-white text-[9px] font-black rounded-lg tracking-widest uppercase shadow-md">
                            FEATURED
                        </div>
                    )}

                    {/* 호버 정보 오버레이 (0.5s fade-in) */}
                    <div
                        className="absolute inset-0 z-10 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100"
                        style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, transparent 100%)',
                            transition: 'opacity 0.5s ease',
                        }}
                    >
                        {book.description && (
                            <p className="text-white/80 text-[12px] leading-relaxed line-clamp-3 mb-3">
                                {book.description}
                            </p>
                        )}
                        <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                            자세히 보기 →
                        </p>
                    </div>
                </div>

                {/* 텍스트 정보 */}
                <div className="px-5 py-4 flex flex-col gap-1 relative z-20">
                    {book.series && (
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">{book.series}</p>
                    )}
                    <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                        {book.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                        {book.author}
                        {book.translator && <span className="text-slate-400"> / 역 {book.translator}</span>}
                    </p>
                    {(book.publisher || book.published_year) && (
                        <p className="text-[11px] text-slate-300 mt-1">
                            {[book.publisher, book.published_year].filter(Boolean).join(' · ')}
                        </p>
                    )}
                </div>
            </article>
        </Link>
    )
}
