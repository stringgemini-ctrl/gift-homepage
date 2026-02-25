import { createClient } from '@supabase/supabase-js'
import BookCard from '@/features/publications/components/BookCard'

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
    price: number | null
    is_featured: boolean
}

async function getBooks(): Promise<Book[]> {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
    const { data, error } = await admin
        .from('books')
        .select('id, title, author, translator, publisher, published_year, series, description, cover_url, buy_link, price, is_featured')
        .order('created_at', { ascending: false })

    if (error) { console.error('[Publications]', error.message); return [] }
    return data ?? []
}

export const revalidate = 60

export default async function PublicationsPage() {
    const books = await getBooks()
    const featured = books.filter(b => b.is_featured)
    const rest = books.filter(b => !b.is_featured)

    return (
        <div className="min-h-screen" style={{ background: '#0a0f0d' }}>
            {/* ─── 히어로 섹션: Modern Classic Scholar's Sanctum ─── */}
            <div
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #0d1710 0%, #0a0f0d 50%, #0c1410 100%)' }}
            >
                {/* 엠비언트 글로우 1: 딥 에메랄드 (상단 좌) */}
                <div className="absolute pointer-events-none" style={{
                    top: '-20%', left: '-10%', width: '65%', height: '70%',
                    background: 'radial-gradient(ellipse, rgba(16,185,129,0.13) 0%, transparent 65%)',
                    filter: 'blur(50px)',
                }} />
                {/* 엠비언트 글로우 2: 다크 에메랄드 (우하) */}
                <div className="absolute pointer-events-none" style={{
                    bottom: '-10%', right: '-5%', width: '50%', height: '60%',
                    background: 'radial-gradient(ellipse, rgba(4,120,87,0.10) 0%, transparent 65%)',
                    filter: 'blur(60px)',
                }} />
                {/* 미래지향 서클 글로우 (중앙) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
                    <div style={{
                        width: '600px', height: '600px',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)',
                        filter: 'blur(70px)',
                    }} />
                </div>
                {/* 미세 격자 텍스처 (에메랄드 톤) */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(52,211,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.6) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative max-w-6xl mx-auto px-6 pt-48 pb-32 text-center">
                    {/* 상단 배지: 딥 에메랄드 */}
                    <div
                        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10"
                        style={{
                            background: 'rgba(16,185,129,0.10)',
                            border: '1px solid rgba(16,185,129,0.22)',
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399' }} />
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.25em]"
                            style={{ color: 'rgba(110,231,183,0.85)' }}
                        >
                            Publications · 글로벌사중복음연구소
                        </span>
                    </div>

                    {/* 메인 타이틀: 딥 에메랄드 그라디언트 */}
                    <h1
                        className="font-black tracking-[-0.04em] leading-[1.0] mb-8"
                        style={{
                            fontSize: 'clamp(44px, 7vw, 76px)',
                            color: '#e8f5f0',
                            textShadow: '0 0 80px rgba(16,185,129,0.22), 0 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        연구소<br />
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 40%, #059669 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            출간 도서
                        </span>
                    </h1>

                    <p className="text-[18px] max-w-md mx-auto leading-relaxed font-medium" style={{ color: 'rgba(210,240,228,0.72)' }}>
                        복음의 신학을 탐구해온<br />연구소의 출판물을 소개합니다.
                    </p>

                    {/* 통계 라인 */}
                    <div
                        className="mt-12 flex items-center justify-center gap-8"
                        style={{ borderTop: '1px solid rgba(16,185,129,0.12)', paddingTop: '24px' }}
                    >
                        <Stat number={books.length} label="출간 도서" />
                        <div style={{ width: '1px', height: '32px', background: 'rgba(16,185,129,0.15)' }} />
                        <Stat number={featured.length} label="편집부 추천" />
                    </div>
                </div>
            </div>

            {/* ─── 도서 그리드 (파치먼트 배경) ─── */}
            <div style={{ background: '#f7f4ef' }}>
                <div className="max-w-6xl mx-auto px-6 py-28 space-y-24">
                    {books.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="text-6xl opacity-20">📚</div>
                            <p className="text-[18px] font-bold" style={{ color: '#6b5e4e' }}>등록된 도서가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            {featured.length > 0 && (
                                <section>
                                    <SectionLabel color="emerald" label="FEATURED BOOKS" sub="편집부 추천 도서" />
                                    {/* 상단 추천 도서: priority=true로 fetch 우선순위 부여 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                                        {featured.map((book, i) => (
                                            <BookCard key={book.id} book={book} priority={i < 3} />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {rest.length > 0 && (
                                <section>
                                    <SectionLabel color="emerald-muted" label="ALL BOOKS" sub="전체 출간 도서" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                                        {rest.map(book => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function Stat({ number, label }: { number: number; label: string }) {
    return (
        <div className="text-center">
            <p className="text-[32px] font-black leading-none" style={{ color: '#34d399' }}>{number}</p>
            <p className="text-[12px] font-bold mt-1 uppercase tracking-widest" style={{ color: 'rgba(110,231,183,0.65)' }}>{label}</p>
        </div>
    )
}

function SectionLabel({ color, label, sub }: { color: 'emerald' | 'emerald-muted'; label: string; sub: string }) {
    const accent = color === 'emerald' ? '#059669' : '#4b8a6e'
    return (
        <div className="flex items-center gap-5 mb-16">
            <div className="h-9 w-[3px] rounded-full" style={{ background: accent }} />
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>{label}</p>
                <p className="text-[24px] font-black tracking-tight" style={{ color: '#1a2820' }}>{sub}</p>
            </div>
        </div>
    )
}
