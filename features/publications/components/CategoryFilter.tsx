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

export default function CategoryFilter({ books }: { books: Book[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>('all')

    // 선택 카테고리에 맞게 필터링
    const filtered = useMemo(() =>
        activeTab === 'all'
            ? books
            : books.filter(b => b.category === activeTab),
        [books, activeTab]
    )

    const featured = filtered.filter(b => b.is_featured)
    const rest = filtered.filter(b => !b.is_featured)

    return (
        <>
            {/* ── 카테고리 필터 탭 ── */}
            <div
                className="sticky top-20 z-30 flex justify-center"
                style={{ background: 'rgba(247,244,239,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 0' }}
            >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        const count = tab.key === 'all'
                            ? books.length
                            : books.filter(b => b.category === tab.key).length
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="relative px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300"
                                style={{
                                    background: active ? '#059669' : 'transparent',
                                    color: active ? '#fff' : '#6b7280',
                                    boxShadow: active ? '0 0 20px rgba(5,150,105,0.35), 0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                }}
                            >
                                {tab.label}
                                {/* 카운트 뱃지 */}
                                <span
                                    className="ml-1.5 text-[10px] font-black rounded-full px-1.5 py-0.5 align-middle"
                                    style={{
                                        background: active ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.07)',
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

            {/* ── 필터링된 도서 그리드 ── */}
            <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <span className="text-5xl opacity-20">📭</span>
                        <p className="text-[17px] font-bold" style={{ color: '#8a7a65' }}>해당 카테고리의 도서가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        {featured.length > 0 && (
                            <section>
                                <SectionLabel label="FEATURED" sub={activeTab === 'all' ? '편집부 추천 도서' : `추천 ${activeTab}`} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                                    {featured.map((book, i) => (
                                        <BookCard key={book.id} book={book} priority={i < 3} />
                                    ))}
                                </div>
                            </section>
                        )}
                        {rest.length > 0 && (
                            <section>
                                <SectionLabel
                                    label={activeTab === 'all' ? 'ALL BOOKS' : activeTab.toUpperCase()}
                                    sub={activeTab === 'all' ? '전체 출간 도서' : `${activeTab} 전체`}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                                    {rest.map(book => <BookCard key={book.id} book={book} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

function SectionLabel({ label, sub }: { label: string; sub: string }) {
    return (
        <div className="flex items-center gap-5 mb-14">
            <div className="h-9 w-[3px] rounded-full" style={{ background: '#059669' }} />
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#059669' }}>{label}</p>
                <p className="text-[24px] font-black tracking-tight" style={{ color: '#1a2820' }}>{sub}</p>
            </div>
        </div>
    )
}
