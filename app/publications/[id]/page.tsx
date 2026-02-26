import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JournalPdfButton from '@/features/publications/components/JournalPdfButton'

// ── 타입 ────────────────────────────────────────────────────────
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
    long_description: string | null
    table_of_contents: string | null
    author_bio: string | null
    cover_url: string | null
    buy_link: string | null
    download_url: string | null
    price: number | null
    is_featured: boolean
}

// ── 서버 Data Fetch ───────────────────────────────────────────
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

export const revalidate = 0

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const book = await getBook(id)
    if (!book) notFound()

    // 카테고리 뱃지 컬러
    const catBadge =
        book.category === 'faith' || book.category === '신앙시리즈'
            ? { bg: 'rgba(249,115,22,0.12)', color: '#ea580c', label: '신앙시리즈' }
            : book.category === 'theology' || book.category === '신학시리즈'
                ? { bg: 'rgba(16,185,129,0.12)', color: '#059669', label: '신학시리즈' }
                : book.category === 'journal' || book.category === '영문저널'
                    ? { bg: 'rgba(16,185,129,0.18)', color: '#047857', label: 'English Journal' }
                    : null

    return (
        <div className="min-h-screen" style={{ background: '#0d1f1a' }}>

            {/* ── 탑 네비 ─────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6"
                style={{ background: 'rgba(13,31,26,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                <Link href="/publications"
                    className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                    ← 출간 도서
                </Link>
                <span className="mx-3" style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
                <span className="text-[13px] font-semibold line-clamp-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {book.title}
                </span>
            </nav>

            {/* ── 히어로 섹션 ─────────────────────────────────── */}
            <div className="relative overflow-hidden pt-16">
                {/* 에메랄드 광원 배경 — 좌측 메인 */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 120% 80% at 30% 50%, rgba(16,185,129,0.28) 0%, transparent 65%)',
                }} />
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 60% 100% at 10% 50%, rgba(6,78,59,0.35) 0%, transparent 70%)',
                }} />

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-14 lg:gap-20 items-start">

                    {/* ── 좌측: 3D 책 표지 ─── */}
                    <div className="shrink-0 w-full max-w-[260px] mx-auto lg:mx-0">
                        {/* 3D 책 박스 */}
                        <div style={{ perspective: '900px' }} className="relative">
                            <div
                                className="relative overflow-hidden rounded-r-[2px]"
                                style={{
                                    transform: 'rotate(2deg)',
                                    transformOrigin: 'bottom left',
                                    boxShadow: `
                                        1px 0 0 #f9f9f9, 2px 0 0 #d0d0d0, 3px 0 0 #f5f5f5,
                                        4px 0 0 #ececec, 5px 0 0 #c8c8c8, 6px 0 0 #f2f2f2,
                                        7px 0 0 #e8e8e8, 8px 0 0 #c0c0c0, 9px 0 0 #eeeeee,
                                        10px 0 0 #e5e5e5, 11px 0 0 #bebebe, 12px 0 0 #ebebeb,
                                        13px 0 0 #e2e2e2, 14px 0 0 #b8b8b8, 15px 0 0 #e8e8e8,
                                        8px 8px 40px rgba(0,0,0,0.50),
                                        20px 20px 60px rgba(0,0,0,0.30)
                                    `,
                                    marginRight: '15px',
                                }}
                            >
                                {book.cover_url ? (
                                    <img src={book.cover_url} alt={book.title}
                                        className="w-full aspect-[2/3] object-cover block" />
                                ) : (
                                    <div className="w-full aspect-[2/3] flex flex-col items-center justify-center gap-3"
                                        style={{ background: 'linear-gradient(160deg, #0d2b22, #0a1f18)' }}>
                                        <span className="text-5xl opacity-20">📖</span>
                                        <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-widest text-center">이미지 준비 중</p>
                                    </div>
                                )}
                                {/* 광택 레이어 */}
                                <div className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)' }} />
                            </div>
                        </div>
                        {/* 바닥 그림자: 책이 표면에 묵직하게 놓인 느낌 */}
                        <div
                            className="absolute bottom-[-12px] left-0 right-0 mx-auto"
                            style={{
                                height: '28px',
                                width: '85%',
                                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.60) 0%, transparent 75%)',
                                filter: 'blur(8px)',
                                transform: 'rotate(2deg)',
                            }}
                        />

                        {/* 구매/다운로드 버튼 */}
                        <div className="mt-8 space-y-3">
                            {book.buy_link && (
                                <a href={book.buy_link} target="_blank" rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-black transition-all"
                                    style={{ background: '#f4f4f5', color: '#18181b' }}>
                                    구매하기 →
                                </a>
                            )}
                            {book.download_url && (
                                <JournalPdfButton
                                    pdfUrl={book.download_url}
                                    title={book.title}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── 우측: 메타 정보 ─── */}
                    <div className="flex-1 pt-2">
                        {/* 시리즈 + 카테고리 뱃지 */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            {book.series && (
                                <span className="text-[11px] font-black uppercase tracking-[0.18em]"
                                    style={{ color: '#34d399' }}>
                                    {book.series}
                                </span>
                            )}
                            {catBadge && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                    style={{ background: catBadge.bg, color: catBadge.color }}>
                                    {catBadge.label}
                                </span>
                            )}
                            {book.is_featured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black"
                                    style={{ background: 'rgba(246,141,46,0.15)', color: '#f68d2e' }}>
                                    ★ Featured
                                </span>
                            )}
                        </div>

                        {/* 제목 */}
                        <h1 className="font-black tracking-[-0.03em] leading-[1.1] mb-6"
                            style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', color: '#f4f4f5' }}>
                            {book.title}
                        </h1>

                        {/* 저자 | 역자 */}
                        <p className="mb-8 text-[17px]" style={{ color: 'rgba(244,244,245,0.70)' }}>
                            <span className="font-bold" style={{ color: '#34d399' }}>{book.author}</span>
                            {book.translator && (
                                <span style={{ color: 'rgba(244,244,245,0.40)' }}> | {book.translator} 역</span>
                            )}
                        </p>

                        {/* 메타 그리드 */}
                        <dl className="grid grid-cols-2 gap-4">
                            {[
                                { label: '출판사', value: book.publisher },
                                { label: '출판 연도', value: book.published_year?.toString() },
                                { label: '정가', value: book.price ? `₩${book.price.toLocaleString('ko-KR')}` : null },
                                { label: '카테고리', value: catBadge?.label },
                            ].filter(m => m.value).map(m => (
                                <div key={m.label} className="rounded-xl px-4 py-3"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.11)' }}>
                                    <dt className="text-[9px] font-black uppercase tracking-widest mb-1"
                                        style={{ color: 'rgba(52,211,153,0.55)' }}>{m.label}</dt>
                                    <dd className="text-[14px] font-semibold" style={{ color: '#f4f4f5' }}>{m.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* ── 본문 탭 섹션 ────────────────────────────────── */}
            <BookTabs book={book} />

            {/* ── 하단 CTA ─────────────────────────────────────── */}
            <div className="border-t py-14 text-center mt-10"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}>
                <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.42)' }}>다른 출간 도서도 살펴보세요</p>
                <Link href="/publications"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.13)' }}>
                    전체 도서 보기 →
                </Link>
            </div>
        </div>
    )
}

// ── 클라이언트 탭 컴포넌트 ────────────────────────────────────
// 서버 컴포넌트 안에서 use client 불가 → 별도 컴포넌트로 분리
import BookTabs from '@/features/publications/components/BookTabs'
