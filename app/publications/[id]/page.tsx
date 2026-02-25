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
    category: string | null
    description: string | null
    long_description: string | null  // 상세페이지용 긴 소개글 (추후 DB 컨럼 추가 예정)
    cover_url: string | null
    buy_link: string | null
    download_url: string | null
    price: number | null
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

export const revalidate = 0 // 이미지 업로드 즉시 반영을 위해 캐시 비활성화

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
        { label: '정가', value: book.price ? '₩' + book.price.toLocaleString('ko-KR') : null },
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

                    {/* ── 좌측: BookCard와 동일한 15단계 종이 box-shadow 3D ── */}
                    <div className="shrink-0 w-full max-w-[300px] lg:max-w-[340px] mx-auto lg:mx-0">
                        <div style={{ perspective: '800px' }}>
                            {/*
                              BookCard와 완전히 동일한 2도 기울기 + 15단계 종이 질감:
                              - rotate(2deg) + transformOrigin bottom-left
                              - 1~15px 흰색/밝은회색 box-shadow + 짝수마다 어두운 경계선
                            */}
                            <div
                                className="relative overflow-hidden rounded-r-[2px]"
                                style={{
                                    transform: 'rotate(2deg)',
                                    transformOrigin: 'bottom left',
                                    boxShadow: `
                                        1px 0 0 #f9f9f9,
                                        2px 0 0 #d0d0d0,
                                        3px 0 0 #f5f5f5,
                                        4px 0 0 #ececec,
                                        5px 0 0 #c8c8c8,
                                        6px 0 0 #f2f2f2,
                                        7px 0 0 #e8e8e8,
                                        8px 0 0 #c0c0c0,
                                        9px 0 0 #eeeeee,
                                        10px 0 0 #e5e5e5,
                                        11px 0 0 #bebebe,
                                        12px 0 0 #ebebeb,
                                        13px 0 0 #e2e2e2,
                                        14px 0 0 #b8b8b8,
                                        15px 0 0 #e8e8e8,
                                        8px 8px 24px rgba(0,0,0,0.20),
                                        14px 16px 40px rgba(0,0,0,0.12),
                                        20px 24px 60px rgba(0,0,0,0.07)
                                    `,
                                    marginRight: '15px',
                                }}
                            >
                                {book.cover_url ? (
                                    // next/image 대신 <img> 사용: 서버 컴포넌트에서 도메인 제한 없이 안전하게 렌더링
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full aspect-[2/3] object-cover block"
                                    />
                                ) : (
                                    <div
                                        className="w-full aspect-[2/3] flex flex-col items-center justify-center gap-3"
                                        style={{ background: 'linear-gradient(160deg, #0d2b22, #0a1f18)' }}
                                    >
                                        <span className="text-5xl opacity-20">📖</span>
                                        <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-widest text-center">
                                            이미지 준비 중
                                        </p>
                                    </div>
                                )}
                                {/* 광택 레이어 */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
                                />
                            </div>
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

                        {/* PDF 다운로드 버튼 — 서버 컴포넌트이므로 이벤트 핸들러 사용 불가
                            hover 글로우는 Tailwind arbitrary shadow 값으로만 처리 */}
                        {book.download_url && (
                            <a
                                href={book.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[14px] font-black
                                    transition-shadow duration-300
                                    shadow-[0_0_24px_rgba(16,185,129,0.30),0_4px_16px_rgba(0,0,0,0.18)]
                                    hover:shadow-[0_0_48px_rgba(16,185,129,0.55),0_4px_20px_rgba(0,0,0,0.25)]"
                                style={{
                                    background: 'linear-gradient(135deg, #065f46, #059669)',
                                    color: '#a7f3d0',
                                }}
                            >
                                <span>📄</span>
                                저널 PDF 다운로드
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

                        {/* 소개글:
                            - long_description이 있으면 우선 렌더링 (긴 상세 설명)
                            - 없으면 기본 description 표시
                            - whitespace-pre-wrap으로 줄바꽔와 여백 보존
                        */}
                        {(book.long_description || book.description) && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-5 w-1 rounded-full bg-emerald-500" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Book Description</p>
                                </div>
                                <p className="text-[16px] text-slate-600 leading-[2.0] whitespace-pre-wrap">
                                    {book.long_description ?? book.description}
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
