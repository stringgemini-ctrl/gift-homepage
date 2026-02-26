'use client'

import { useState } from 'react'

type TabBook = {
    long_description: string | null
    table_of_contents: string | null
    author_bio: string | null
    description: string | null
}

const TABS = [
    { key: 'intro', label: '책 소개', icon: '📖' },
    { key: 'toc', label: '목차', icon: '📋' },
    { key: 'author', label: '저자 및 역자 소개', icon: '✍️' },
] as const
type TabKey = typeof TABS[number]['key']

export default function BookTabs({ book }: { book: TabBook }) {
    const [active, setActive] = useState<TabKey>('intro')

    // 각 탭의 실제 내용 — 없으면 해당 탭 숨김
    const content: Record<TabKey, string | null> = {
        intro: book.long_description ?? book.description,
        toc: book.table_of_contents,
        author: book.author_bio,
    }

    // 내용이 하나도 없으면 섹션 자체를 렌더링하지 않음
    const hasSomeContent = Object.values(content).some(Boolean)
    if (!hasSomeContent) return null

    // 내용 있는 탭만 표시
    const visibleTabs = TABS.filter(t => content[t.key])

    // active가 없는 탭으로 설정됐을 경우 방어
    const safeActive = content[active] ? active : (visibleTabs[0]?.key ?? 'intro')

    return (
        <section className="max-w-6xl mx-auto px-6 pb-24">
            {/* 탭 헤더 */}
            <div
                className="flex items-center gap-1 mb-10 border-b"
                style={{ borderColor: 'rgba(0,0,0,0.09)' }}
            >
                {visibleTabs.map(tab => {
                    const isActive = safeActive === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActive(tab.key)}
                            className="flex items-center gap-1.5 px-5 py-3.5 text-[13px] font-bold transition-all relative"
                            style={{
                                color: isActive ? '#059669' : '#94a3b8',
                                borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                                marginBottom: '-1px',
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* 탭 콘텐츠 */}
            <div
                className="rounded-2xl px-8 py-10"
                style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}
            >
                {safeActive === 'toc' ? (
                    /*
                      목차는 whitespace-pre-wrap + font-mono로
                      줄바꿈/들여쓰기 그대로 보존
                    */
                    <pre
                        className="font-mono text-[14px] leading-[2.0] whitespace-pre-wrap text-slate-800"
                    >
                        {content.toc}
                    </pre>
                ) : (
                    <p
                        className="text-[16px] leading-[2.1] whitespace-pre-wrap text-slate-700"
                    >
                        {content[safeActive]}
                    </p>
                )}
            </div>
        </section>
    )
}
