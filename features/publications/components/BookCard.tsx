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
        중후한 리프트 효과:
        - 호버 시 translateY(-6px) + 그림자 강조 (transform 0.6s ease)
        - 오버레이 정보는 opacity 0.4s ease로 서서히 페이드인
        - 3D 틸트(마우스 트래킹) 제거 → 사용자 집중 방해 없이 책 자체에 집중
      */}
            <article
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100/80 transition-all duration-600 ease-out
          group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.13)]"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
                {/* 표지: CSS perspective로 물리적 책의 기울기 표현 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-150 overflow-hidden">
                    {book.cover_url ? (
                        <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100">
                            <span className="text-5xl opacity-20">📖</span>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No Cover</span>
                        </div>
                    )}

                    {/* 추천 뱃지 */}
                    {book.is_featured && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#f68d2e] text-white text-[9px] font-black rounded-lg tracking-widest uppercase shadow">
                            FEATURED
                        </div>
                    )}

                    {/*
            호버 오버레이: opacity 0 → 1 페이드인 (0.5s ease)
            가벼운 정보 노출 - 제목·설명만. 구매 버튼은 상세 페이지에서 제공.
          */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out
            flex flex-col justify-end p-5">
                        {book.description && (
                            <p className="text-white/80 text-[12px] leading-relaxed line-clamp-3">
                                {book.description}
                            </p>
                        )}
                        <p className="mt-3 text-[11px] font-bold text-white/50 uppercase tracking-widest">
                            자세히 보기 →
                        </p>
                    </div>
                </div>

                {/* 텍스트 영역 */}
                <div className="px-5 py-4 flex flex-col gap-1">
                    {book.series && (
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">{book.series}</p>
                    )}
                    <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-2">
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
