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
        .select('id, title, author, translator, publisher, published_year, series, category, description, cover_url, buy_link, download_url, price, is_featured')
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
        <div className="min-h-screen" style={{ background: '#09090b' }}>
            {/* ─── 히어로: 묵직한 Zinc-950, 에메랄드는 포인트만 ─── */}
            <div
                className="relative overflow-hidden"
                style={{
                    /*
                      심연에서 우러나오는 딥 에메랄드 틴트:
                      - 상단 타원 방사형 그라디언트로 은은한 녹색조 추가
                      - rgba(6,78,59,0.20) → 텍스트 가독성 해치지 않는 수준
                    */
                    background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(6,78,59,0.22) 0%, rgba(9,9,11,0) 65%), linear-gradient(170deg, #0f1412 0%, #09090b 55%, #09090b 100%)'
                }}
            >
                {/* CSS 부유 입자 배경 애니메이션 (클라이언트 컴포넌트) */}
                <HeroParticles />
                {/*
          엠비언트 글로우: 아주 미세하게만 → 초록 덮임 방지
          opacity를 이전 0.13 → 0.07로 대폭 축소
        */}
                <div className="absolute pointer-events-none" style={{
                    top: '-15%', left: '-5%', width: '50%', height: '60%',
                    background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)',
                    filter: 'blur(60px)',
                }} />
                <div className="absolute pointer-events-none" style={{
                    bottom: '-10%', right: '0%', width: '40%', height: '50%',
                    background: 'radial-gradient(ellipse, rgba(4,120,87,0.05) 0%, transparent 65%)',
                    filter: 'blur(70px)',
                }} />

                {/* 미세 격자 — 더 어둡게, 에메랄드 대신 중성 회색 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{
                    backgroundImage:
                        'linear-gradient(rgba(200,200,200,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.8) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

                <div className="relative max-w-6xl mx-auto px-6 pt-44 pb-28 text-center">
                    {/* 배지: 아주 절제된 에메랄드 테두리 */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.10)',
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Publications · 글로벌사중복음연구소
                        </span>
                    </div>

                    {/* 타이틀: 밝은 흰색 기반, 에메랄드는 한 단어만 */}
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
                        style={{ color: 'rgba(244,244,245,0.60)' }}
                    >
                        복음의 신학을 탐구해온<br />연구소의 출판물을 소개합니다.
                    </p>

                    {/* 구분선 + 통계 */}
                    <div
                        className="mt-10 pt-8 flex items-center justify-center gap-10"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
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
