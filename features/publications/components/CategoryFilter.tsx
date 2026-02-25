'use client'

import { useState, useMemo } from 'react'
import BookCard from './BookCard'

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

const TABS = [
    { key: 'all', label: '전체 보기' },
    { key: '신학시리즈', label: '신학 시리즈' },
    { key: '신앙시리즈', label: '신앙 시리즈' },
    { key: '영문저널', label: '영문 저널' },
] as const
type TabKey = typeof TABS[number]['key']

// 배열을 n개씩 나눔 → 선반 행(Row) 구현에 사용
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
}

const COLS = 4 // 큰 화면 기준 한 줄 책 수 (lg:grid-cols-4)

export default function CategoryFilter({ books }: { books: Book[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>('all')

    const filtered = useMemo(() =>
        activeTab === 'all'
            ? books
            : books.filter(b => b.category === activeTab),
        [books, activeTab]
    )

    // 선반 행으로 묶기: COLS 단위로 분할
    const rows = useMemo(() => chunkArray(filtered, COLS), [filtered])

    return (
        <>
            {/* ── 카테고리 탭 (sticky) ── */}
            <div
                className="sticky top-20 z-30 flex justify-center"
                style={{
                    background: 'rgba(247,244,239,0.94)',
                    backdropFilter: 'blur(14px)',
                    borderBottom: '1px solid rgba(0,0,0,0.07)',
                    padding: '14px 0',
                }}
            >
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.05)' }}
                >
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        const count = tab.key === 'all'
                            ? books.length
                            : books.filter(b => b.category === tab.key).length
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300"
                                style={{
                                    background: active ? '#18453b' : 'transparent',
                                    color: active ? '#e2f5ee' : '#6b7280',
                                    boxShadow: active
                                        ? '0 0 14px rgba(22,101,52,0.30), 0 2px 6px rgba(0,0,0,0.18)'
                                        : 'none',
                                }}
                            >
                                {tab.label}
                                <span
                                    className="ml-1.5 text-[9px] font-black rounded-full px-1.5 py-0.5 align-middle"
                                    style={{
                                        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)',
                                        color: active ? '#a7f3d0' : '#9ca3af',
                                    }}
                                >
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── 도서 선반 ── */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-36 gap-4">
                        <span className="text-5xl opacity-20">📭</span>
                        <p className="text-[16px] font-bold text-slate-500">해당 카테고리의 도서가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {rows.map((row, rowIdx) => (
                            /*
                              선반(Shelf) 행: 책들 아래에 glassmorphism 선반 라인을 배치
                              - row-container: relative, pb로 선반 공간 확보
                              - shelf-line: absolute bottom에 가로 전체 선반 UI
                            */
                            <div key={rowIdx} className="relative pb-14">
                                {/* 도서 그리드 행 */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6">
                                    {row.map((book, i) => (
                                        <BookCard
                                            key={book.id}
                                            book={book}
                                            priority={rowIdx === 0 && i < 4}
                                        />
                                    ))}
                                </div>

                                {/* ── 글래스모피즘 선반 라인 ── */}
                                <div
                                    className="absolute left-0 right-0 bottom-4"
                                    style={{ height: '10px' }}
                                >
                                    {/* 선반 본체: 반투명 유리 느낌 */}
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{
                                            background: 'linear-gradient(to bottom, rgba(210,220,215,0.55), rgba(180,195,188,0.30))',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                                            border: '1px solid rgba(255,255,255,0.45)',
                                        }}
                                    />
                                    {/* 선반 하단 그림자 */}
                                    <div
                                        className="absolute left-6 right-6 -bottom-3"
                                        style={{
                                            height: '8px',
                                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.14) 0%, transparent 70%)',
                                            filter: 'blur(3px)',
                                        }}
                                    />
                                    {/* 선반 에메랄드 반사광 (포인트) */}
                                    <div
                                        className="absolute left-[20%] right-[20%] top-0 h-[1px]"
                                        style={{
                                            background: 'linear-gradient(to right, transparent, rgba(16,185,129,0.25) 40%, rgba(16,185,129,0.25) 60%, transparent)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
