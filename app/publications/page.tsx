import { createClient } from '@supabase/supabase-js'
import CategoryFilter from '@/features/publications/components/CategoryFilter'
import HeroParticles from '@/features/publications/components/HeroParticles'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '출간 도서 — GIFT 글로벌사중복음연구소',
  description: '글로벌사중복음연구소에서 출간한 신앙 시리즈, 신학 시리즈, 영문 저널을 소개합니다.',
}

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
        // select('*')로 모든 컬럼 가져오기:
        // journal_name/volume_issue 컬럼이 DB에 없어도 오류 없이 작동함
        // (특정 컬럼명 지정 시 미존재 컬럼 → 쿼리 실패 → 빈 화면 버그)
        .select('*')
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
                  성운 Layer 1: 상단 전체를 덮는 넣은 에메랄드 광원
                  - 0.30 → 0.55 로 최대화 (신비롭고 묵직한 테마)
                */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 130% 90% at 50% -5%, rgba(16,185,129,0.55) 0%, rgba(5,150,105,0.25) 45%, transparent 70%)',
                }} />

                {/*
                  성운 Layer 2: 우하단 반대 빛무리 강화
                  - 0.28 → 0.40
                */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(circle at 80% 85%, rgba(6,78,59,0.40) 0%, transparent 65%)',
                }} />

                {/*
                  성운 Layer 3: 중앙 집중 광원 강화
                  - 0.18 → 0.38
                */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 70% 50% at 50% 22%, rgba(16,185,129,0.38) 0%, transparent 60%)',
                }} />

                {/* 미세 격자 — 공간감 보조 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
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
                        className="font-black tracking-[-0.03em] leading-[1.15] mb-7"
                        style={{ fontSize: 'clamp(34px, 5vw, 60px)', color: '#f4f4f5' }}
                    >
                        성결교회 신앙의 규범.&nbsp;
                        <span style={{
                            background: 'linear-gradient(120deg, #a7f3d0, #34d399)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            사중복음
                        </span>
                    </h1>

                    <p
                        className="text-[15px] max-w-xl mx-auto leading-[1.85]"
                        style={{ color: 'rgba(244,244,245,0.62)' }}
                    >
                        기독교대한성결교회의 오랜 신학적 고민과 헌신이 담긴 기록들을 소개합니다.<br />
                        시대의 물음 앞에 한없이 겸손하려 했던,<br />그러나 치열하게 파고든 사중복음 연구의 결실들을<br />
                        이곳에 조심스럽게 꺼내어 놓습니다.
                    </p>

                    {/* 구분선 + 통계 (4개 고정 항목, 쓰레기값 침투 불가) */}
                    <div
                        className="mt-10 pt-8 flex items-center justify-center gap-8 flex-wrap"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}
                    >
                        {/* 총 도서: 유효 카테고리 3종 합산만 */}
                        <Stat
                            number={books.filter(b => b.category && ['faith', 'theology', 'journal', '신앙시리즈', '신학시리즈', '영문저널'].includes(b.category)).length}
                            label="총 도서"
                        />
                        <Divider />
                        {/* 신학시리즈 */}
                        <Stat
                            number={books.filter(b => b.category === 'theology' || b.category === '신학시리즈').length}
                            label="신학시리즈"
                        />
                        <Divider />
                        {/* 신앙시리즈 */}
                        <Stat
                            number={books.filter(b => b.category === 'faith' || b.category === '신앙시리즈').length}
                            label="신앙시리즈"
                        />
                        <Divider />
                        {/* 영문저널 */}
                        <Stat
                            number={books.filter(b => b.category === 'journal' || b.category === '영문저널').length}
                            label="영문저널"
                        />
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
