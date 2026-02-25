import { createClient } from '@supabase/supabase-js'
import CategoryFilter from '@/features/publications/components/CategoryFilter'
import HeroParticles from '@/features/publications/components/HeroParticles'

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

async function getBooks(): Promise<Book[]> {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
    const { data, error } = await admin
        .from('books')
        .select('id, title, author, translator, publisher, published_year, series, category, description, cover_url, buy_link, download_url, price, journal_name, volume_issue, is_featured')
        // 최신간(출판 연도 높은 것)이 먼저 → 연도가 같으면 등록 순 역순
        .order('published_year', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) { console.error('[Publications]', error.message); return [] }
    return data ?? []
}

export const revalidate = 60

export default async function PublicationsPage() {
    const books = await getBooks()

    return (
        <div className="min-h-screen" style={{ background: '#040c09' }}>
            {/* ─── 히어로: Mystical Abyss — 학문적 심연 ─── */}
            <div className="relative overflow-hidden" style={{ background: '#040c09' }}>
                {/* CSS 부유 입자 */}
                <HeroParticles />

                {/*
                  성운 Layer 1: 화면 최상단 → 넓게 퍼지는 에메랄드 빛무리
                  - ellipse 100% 70%: 화면 너비 전체를 덮는 넓은 타원
                */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 100%)',
                }} />

                {/*
                  성운 Layer 2: 우측 하단 → 심연의 반대편 빛무리
                  반대 방향에서 받쳐주어 3차원 공간감 형성
                */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(circle at 80% 80%, rgba(6,78,59,0.15) 0%, transparent 60%)',
                }} />

                {/* 미세 격자 — 공간감 보조 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.022]" style={{
                    backgroundImage:
                        'linear-gradient(rgba(200,220,210,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(200,220,210,0.8) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

                {/*
                  텍스트 래퍼: relative z-10으로 성운 레이어 위에 확실히 올라옴
                  drop-shadow로 배경 빛 속에서도 글씨가 선명하게 돋보임
                */}
                <div
                    className="relative z-10 max-w-6xl mx-auto px-6 pt-44 pb-28 text-center"
                    style={{ filter: 'drop-shadow(0 2px 16px rgba(0,0,0,0.5))' }}
                >
                    {/* 배지 */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Publications · 글로벌사중복음연구소
                        </span>
                    </div>

                    {/* 타이틀 */}
                    <h1
                        className="font-black tracking-[-0.04em] leading-[1.0] mb-7"
                        style={{ fontSize: 'clamp(42px, 6.5vw, 72px)', color: '#f4f4f5' }}
                    >
                        연구소&nbsp;
                        <span style={{
                            background: 'linear-gradient(120deg, #a7f3d0, #34d399)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            출간 도서
                        </span>
                    </h1>

                    <p
                        className="text-[17px] max-w-sm mx-auto leading-relaxed"
                        style={{ color: 'rgba(244,244,245,0.65)' }}
                    >
                        복음의 신학을 탐구해온<br />연구소의 출판물을 소개합니다.
                    </p>

                    {/* 구분선 + 통계 */}
                    <div
                        className="mt-10 pt-8 flex items-center justify-center gap-10"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}
                    >
                        <Stat number={books.length} label="총 도서" />
                        <Divider />
                        <Stat number={books.filter(b => b.category === '영문저널').length} label="영문 저널" />
                        <Divider />
                        <Stat number={books.filter(b => b.is_featured).length} label="추천" />
                    </div>
                </div>
            </div>


            {/* ─── 책장 섹션 (카테고리 필터 + 선반 그리드) ─── */}
            <div style={{ background: '#f5f2ec' }}>
                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-5">
                        <span className="text-6xl opacity-20">📚</span>
                        <p className="text-[18px] font-bold text-stone-500">등록된 도서가 없습니다.</p>
                    </div>
                ) : (
                    <CategoryFilter books={books} />
                )}
            </div>
        </div>
    )
}

function Stat({ number, label }: { number: number; label: string }) {
    return (
        <div className="text-center">
            <p className="text-[28px] font-black leading-none" style={{ color: '#f4f4f5' }}>{number}</p>
            <p className="text-[11px] font-medium mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
        </div>
    )
}

function Divider() {
    return <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.10)' }} />
}
