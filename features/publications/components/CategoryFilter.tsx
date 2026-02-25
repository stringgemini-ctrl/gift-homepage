'use client'

import { useState, useMemo } from 'react'
import BookCard from './BookCard'
import JournalCard from './JournalCard'

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
    journal_name: string | null
    volume_issue: string | null
    is_featured: boolean
}

/*
  4탭 구조 (한국어 + 영어 이중언어):
  - all : 전체 보기
  - faith : 신앙시리즈 (Faith Series)
  - theology : 신학시리즈 (Theology Series)
  - journal : 영문 저널 (English Journals)
*/
const TABS = [
    { key: 'all', ko: '전체보기', en: 'All' },
    { key: 'faith', ko: '신앙시리즈', en: 'Faith Series' },
    { key: 'theology', ko: '신학시리즈', en: 'Theology Series' },
    { key: 'journal', ko: '영문저널', en: 'English Journals' },
] as const
type TabKey = typeof TABS[number]['key']

function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
    return result
}

/*
  유효 카테고리 화이트리스트 (엄격):
  - faith / theology / journal (+ 레거시 한국어 값) 만 정상 데이터로 인정
  - recommend, NULL, book, '' 등 쓰레기 값은 렌더링/카운트에서 완전 배제
*/
const VALID_CATEGORIES = new Set(['faith', 'theology', 'journal', '신앙시리즈', '신학시리즈', '영문저널'])

const isValid = (b: Book) => !!b.category && VALID_CATEGORIES.has(b.category)

const matchTab = (b: Book, tab: TabKey): boolean => {
    const cat = b.category ?? ''
    if (tab === 'faith') return cat === 'faith' || cat === '신앙시리즈'
    if (tab === 'theology') return cat === 'theology' || cat === '신학시리즈'
    if (tab === 'journal') return cat === 'journal' || cat === '영문저널'
    return false
}

const COLS = 5  // 5열 그리드 (lg 이상)

export default function CategoryFilter({ books }: { books: Book[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>('all')

    // 전체보기를 포함한 모든 연산의 베이스: 유효 데이터만 사용
    const validBooks = useMemo(() => books.filter(isValid), [books])

    const filtered = useMemo(() =>
        activeTab === 'all' ? validBooks : validBooks.filter(b => matchTab(b, activeTab)),
        [validBooks, activeTab]
    )

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
                        // 'All' 카운트도 유효 데이터(whitelist 필터됨)만 합산
                        const count = tab.key === 'all'
                            ? validBooks.length
                            : validBooks.filter(b => matchTab(b, tab.key)).length
                        const isJournal = tab.key === 'journal'
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="flex flex-col items-center px-4 py-1.5 rounded-full transition-all duration-300"
                                style={{
                                    background: active
                                        ? isJournal ? 'linear-gradient(135deg, #065f46, #047857)' : '#18453b'
                                        : 'transparent',
                                    color: active ? '#e2f5ee' : '#6b7280',
                                    boxShadow: active
                                        ? '0 0 14px rgba(22,101,52,0.30), 0 2px 6px rgba(0,0,0,0.18)'
                                        : 'none',
                                }}
                            >
                                {/* 한국어 + 영어 이중언어 레이블 */}
                                <span className="text-[12px] font-black leading-tight whitespace-nowrap">{tab.ko}</span>
                                <span className="text-[9px] font-medium opacity-70 whitespace-nowrap leading-tight">{tab.en}</span>
                                {/* 카운트 뱃지 */}
                                <span
                                    className="mt-0.5 text-[8px] font-black rounded-full px-1.5 py-0.5"
                                    style={{
                                        background: active ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.07)',
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
                            <div key={rowIdx} className="relative pb-20">
                                {/* 도서 그리드 행: sm=3열, lg=4열, xl=5열 → 한 화면에 더 많은 도서 */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-14">
                                    {row.map((book, i) => (
                                        <div key={book.id} className="max-w-[210px] mx-auto w-full">
                                            {/* 저널이면 JournalCard, 도서이면 BookCard */}
                                            {matchTab(book, 'journal') ? (
                                                <JournalCard journal={book} />
                                            ) : (
                                                <BookCard
                                                    book={book}
                                                    priority={rowIdx === 0 && i < 3}
                                                />
                                            )}
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
