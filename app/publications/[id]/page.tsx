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

export default async function BookDetailPage({ params }: { params: { id: string } }) {
    const book = await getBook(params.id)
    if (!book) notFound()

    const meta = [
        { label: '저자', value: book.author },
        { label: '번역자', value: book.translator },
        { label: '출판사', value: book.publisher },
        { label: '출판 연도', value: book.published_year?.toString() },
        { label: '시리즈', value: book.series },
    ].filter(m => m.value)

    return (
        <div className="min-h-screen bg-slate-950">
            {/* 뒤로가기 */}
            <div className="absolute top-24 left-0 right-0 z-10 max-w-6xl mx-auto px-6">
                <Link href="/publications"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-[13px] font-semibold transition-colors">
                    ← 전체 도서로
                </Link>
            </div>

            {/* 상단: 다크 배경 + 표지 + 기본 정보 */}
            <div className="relative bg-slate-950 pt-36 pb-24 overflow-hidden">
                {/* 배경 글로우 */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(16,185,129,0.08), transparent 70%)' }} />

                <div className="relative max-w-6xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">

                        {/* 3D 표지 */}
                        <div className="shrink-0 w-full max-w-[280px] lg:max-w-[320px] mx-auto lg:mx-0">
                            <div
                                className="relative rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
                                style={{
                                    transform: 'perspective(1000px) rotateY(-8deg) rotateX(3deg)',
                                }}
                            >
                                {book.cover_url ? (
                                    <img src={book.cover_url} alt={book.title} className="w-full aspect-[3/4] object-cover" />
                                ) : (
                                    <div className="w-full aspect-[3/4] bg-slate-800 flex items-center justify-center text-6xl text-slate-600">
                                        📖
                                    </div>
                                )}
                                {/* 3D 광택 효과 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                                {/* 우측 책 두께 느낌 */}
                                <div className="absolute top-0 right-0 bottom-0 w-3 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* 텍스트 정보 */}
                        <div className="flex-1 pt-2">
                            {book.is_featured && (
                                <span className="inline-block px-3 py-1.5 bg-[#f68d2e]/20 text-[#f68d2e] text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                                    ★ Featured
                                </span>
                            )}
                            {book.series && (
                                <p className="text-emerald-400 text-[12px] font-black uppercase tracking-[0.15em] mb-3">{book.series}</p>
                            )}
                            <h1 className="text-[36px] md:text-[48px] font-black text-white tracking-[-0.03em] leading-[1.1] mb-6">
                                {book.title}
                            </h1>

                            {/* 메타 정보 */}
                            <dl className="space-y-3 mb-10">
                                {meta.map(m => (
                                    <div key={m.label} className="flex items-baseline gap-4">
                                        <dt className="text-[11px] font-black text-white/30 uppercase tracking-widest w-20 shrink-0">{m.label}</dt>
                                        <dd className="text-[15px] font-semibold text-white/80">{m.value}</dd>
                                    </div>
                                ))}
                            </dl>

                            {/* 구매 버튼 */}
                            {book.buy_link && (
                                <a
                                    href={book.buy_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 text-[15px] font-black rounded-2xl hover:bg-emerald-50 transition-colors shadow-2xl shadow-black/40 group"
                                >
                                    구매하기
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 소개글 섹션 */}
            {book.description && (
                <div className="bg-white">
                    <div className="max-w-3xl mx-auto px-6 py-24">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-6 w-1 rounded-full bg-emerald-500" />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Book Description</p>
                        </div>
                        <p className="text-[18px] text-slate-700 leading-[1.9] font-medium whitespace-pre-wrap">
                            {book.description}
                        </p>
                    </div>
                </div>
            )}

            {/* 하단 CTA */}
            <div className="bg-slate-950 py-20 text-center border-t border-white/5">
                <p className="text-white/40 text-[14px] mb-6">다른 출간 도서도 살펴보세요</p>
                <Link href="/publications"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 text-[14px] font-bold rounded-xl hover:border-white/30 hover:text-white transition-all">
                    전체 도서 보기 →
                </Link>
            </div>
        </div>
    )
}
