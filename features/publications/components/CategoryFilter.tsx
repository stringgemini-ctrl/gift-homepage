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

const COLS = 3 // lg 기준 3열

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
                              선반(Shelf) 행:
                              - pb-28: 책 바닥과 선반 사이 충분한 공간 확보
                              - 선반은 absolute bottom-6에 위치해 카드에 가려지지 않음
                            */
                            <div key={rowIdx} className="relative pb-28">
                                {/* 도서 그리드 행 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
                                    {row.map((book, i) => (
                                        /*
                                          카드 래퍼: max-w-[220px] mx-auto로 너비 강제 제한 (~40% 축소)
                                          mb-8로 카드 바닥과 선반 사이 틈 확보
                                        */
                                        <div key={book.id} className="max-w-[220px] mx-auto w-full mb-8">
                                            <BookCard
                                                book={book}
                                                priority={rowIdx === 0 && i < 3}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* ── 글래스모피즘 선반 ── */}
                                <div
                                    className="absolute left-0 right-0 bottom-8"
                                    style={{ height: '16px', zIndex: 10 }}
                                >
                                    {/* 선반 본체: 반투명 유리 */}
                                    <div
                                        className="w-full h-full rounded-sm"
                                        style={{
                                            background: 'linear-gradient(to bottom, rgba(220,230,225,0.70), rgba(190,205,198,0.40))',
                                            backdropFilter: 'blur(6px)',
                                            boxShadow: '0 3px 16px rgba(0,0,0,0.12), inset 0 1.5px 0 rgba(255,255,255,0.70)',
                                            border: '1px solid rgba(255,255,255,0.50)',
                                        }}
                                    />
                                    {/* 선반 하단 그림자 */}
                                    <div
                                        className="absolute left-4 right-4 -bottom-4"
                                        style={{
                                            height: '12px',
                                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)',
                                            filter: 'blur(4px)',
                                        }}
                                    />
                                    {/* 에메랄드 반사광: 두껍고 선명하게 */}
                                    <div
                                        className="absolute left-[10%] right-[10%] top-0"
                                        style={{
                                            height: '3px',
                                            background: 'linear-gradient(to right, transparent 0%, rgba(16,185,129,0.50) 25%, rgba(16,185,129,0.55) 50%, rgba(16,185,129,0.50) 75%, transparent 100%)',
                                            borderRadius: '2px',
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
