'use client'

import { useRef } from 'react'
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
    const cardRef = useRef<HTMLDivElement>(null)

    // CSS 3D 틸트 효과: 마우스 위치에 따라 perspective rotateX/Y 적용
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width   // 0~1
        const y = (e.clientY - rect.top) / rect.height    // 0~1
        const tiltX = (y - 0.5) * -14  // 위아래 기울기 (±7deg)
        const tiltY = (x - 0.5) * 14   // 좌우 기울기 (±7deg)
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`
        card.style.boxShadow = `
      ${tiltY * -2}px ${tiltX * 2}px 60px rgba(0,0,0,0.18),
      0 20px 60px rgba(0,0,0,0.10)
    `
    }

    const handleMouseLeave = () => {
        const card = cardRef.current
        if (!card) return
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)'
        card.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'
    }

    const handleMouseEnter = () => {
        const card = cardRef.current
        if (!card) return
        // 이동 중에는 transition 제거해서 즉각 반응
        card.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear'
    }

    return (
        <Link href={`/publications/${book.id}`} className="block outline-none group">
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                style={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                    transition: 'transform 0.5s ease, box-shadow 0.5s ease',
                    willChange: 'transform',
                }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 cursor-pointer"
            >
                {/* 표지 이미지 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {book.cover_url ? (
                        <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <span className="text-6xl opacity-20">📖</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Cover</span>
                        </div>
                    )}

                    {/* 추천 뱃지 */}
                    {book.is_featured && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#f68d2e] text-white text-[10px] font-black rounded-full shadow-lg tracking-widest uppercase">
                            FEATURED
                        </div>
                    )}

                    {/* 하단 그라디언트 */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* 텍스트 정보 */}
                <div className="px-6 py-5 space-y-1">
                    {book.series && (
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">{book.series}</p>
                    )}
                    <h3 className="text-[16px] font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-[13px] text-slate-500">
                        {book.author}
                        {book.translator && <span className="text-slate-400"> · 역 {book.translator}</span>}
                    </p>
                    {(book.publisher || book.published_year) && (
                        <p className="text-[11px] text-slate-300 pt-1">
                            {[book.publisher, book.published_year].filter(Boolean).join(' · ')}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}
