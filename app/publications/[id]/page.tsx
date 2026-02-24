import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

async function getBook(id: string): Promise<Book | null> {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
    const { data, error } = await admin.from('books').select('*').eq('id', id).single()
    if (error || !data) return null
    return data
}

export const revalidate = 60

// Next.js 16+: params는 반드시 await해야 합니다 (Promise로 변경됨)
export default async function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const book = await getBook(id)
    if (!book) notFound()

    const meta = [
        { label: '저자', value: book.author },
        { label: '번역자', value: book.translator },
        { label: '출판사', value: book.publisher },
        { label: '출판 연도', value: book.published_year?.toString() },
        { label: '시리즈', value: book.series },
    ].filter((m): m is { label: string; value: string } => Boolean(m.value))

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* 상단 네비게이션 바 */}
            <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-12 flex items-center gap-3">
                    <Link
                        href="/publications"
                        className="text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                        ← 출간 도서
                    </Link>
                    <span className="text-slate-200">/</span>
                    <span className="text-[13px] text-slate-600 font-semibold line-clamp-1">{book.title}</span>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

                    {/* ── 좌측: 정갈한 3D 책 표지 ── */}
                    <div className="shrink-0 w-full max-w-[260px] lg:max-w-[300px] mx-auto lg:mx-0 lg:sticky lg:top-36">
                        {/*
              CSS perspective로 물리적인 책처럼 비스듬히 서 있는 느낌
              rotateY(-12deg)로 책 왼쪽 면(책등)이 살짝 보이는 구조
            */}
                        <div
                            className="relative rounded-xl overflow-hidden"
                            style={{
                                transform: 'perspective(1200px) rotateY(-10deg) rotateX(2deg)',
                                boxShadow: '-8px 12px 40px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                                transition: 'transform 0.6s ease, box-shadow 0.6s ease',
                            }}
                        >
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full aspect-[3/4] object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-[3/4] bg-slate-200 flex items-center justify-center text-5xl text-slate-400">
                                    📖
                                </div>
                            )}
                            {/* 광택 레이어 */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
                            />
                            {/* 책등 두께감 (좌측 세로 그림자 선) */}
                            <div
                                className="absolute top-0 left-0 bottom-0 w-4 pointer-events-none"
                                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25), transparent)' }}
                            />
                        </div>

                        {/* 구매 버튼 */}
                        {book.buy_link && (
                            <a
                                href={book.buy_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white text-[14px] font-black rounded-xl hover:bg-slate-700 transition-colors shadow-md"
                            >
                                구매하기 →
                            </a>
                        )}
                    </div>

                    {/* ── 우측: 메타데이터 + 소개글 ── */}
                    <div className="flex-1 pt-2">
                        {book.is_featured && (
                            <span className="inline-block px-3 py-1.5 bg-[#f68d2e]/10 text-[#f68d2e] text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                                ★ Featured
                            </span>
                        )}
                        {book.series && (
                            <p className="text-emerald-600 text-[12px] font-black uppercase tracking-[0.15em] mb-3">
                                {book.series}
                            </p>
                        )}
                        <h1 className="text-[36px] md:text-[44px] font-black text-slate-900 tracking-[-0.03em] leading-[1.1] mb-10">
                            {book.title}
                        </h1>

                        {/* 메타 정보 카드 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 divide-y divide-slate-50">
                            {meta.map(m => (
                                <div key={m.label} className="flex items-center gap-6 px-6 py-4">
                                    <dt className="text-[11px] font-black text-slate-400 uppercase tracking-widest w-20 shrink-0">{m.label}</dt>
                                    <dd className="text-[15px] font-semibold text-slate-800">{m.value}</dd>
                                </div>
                            ))}
                        </div>

                        {/* 소개글 */}
                        {book.description && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-5 w-1 rounded-full bg-emerald-500" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Book Description</p>
                                </div>
                                <p className="text-[16px] text-slate-600 leading-[2.0] whitespace-pre-wrap">
                                    {book.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 하단 CTA */}
            <div className="border-t border-slate-100 py-16 text-center bg-white mt-16">
                <p className="text-slate-400 text-[14px] mb-5">다른 출간 도서도 살펴보세요</p>
                <Link
                    href="/publications"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 text-[14px] font-bold rounded-xl hover:border-slate-400 hover:text-slate-900 transition-all"
                >
                    전체 도서 보기 →
                </Link>
            </div>
        </div>
    )
}
