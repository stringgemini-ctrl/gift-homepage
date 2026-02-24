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
        .select('id, title, author, translator, publisher, published_year, series, description, cover_url, buy_link, is_featured')
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
        <div className="min-h-screen bg-[#fafafa]">
            {/* ─── 영웅 헤더 ─── */}
            <div className="relative bg-slate-950 overflow-hidden">
                {/* 세련된 배경 그라디언트 노이즈 */}
                <div className="absolute inset-0 opacity-30"
                    style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.35), transparent)' }} />
                <div className="absolute inset-0 opacity-10"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 60%, rgba(246,141,46,0.6), transparent)' }} />

                <div className="relative max-w-6xl mx-auto px-6 pt-44 pb-28 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Publications</span>
                    </div>
                    <h1 className="text-[52px] md:text-[72px] font-black text-white tracking-[-0.04em] leading-[1.0] mb-6">
                        연구소<br />출간 도서
                    </h1>
                    <p className="text-[17px] text-white/50 max-w-md mx-auto leading-relaxed">
                        글로벌사중복음연구소가 탐구해온<br />신학 연구의 결실을 소개합니다.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-6 text-[13px] text-white/30 font-semibold">
                        <span>총 {books.length}권</span>
                        {featured.length > 0 && <><span>·</span><span>추천 {featured.length}권</span></>}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-24 space-y-28">
                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-5xl">📚</div>
                        <div className="text-center">
                            <p className="text-[20px] font-bold text-slate-500 mb-2">아직 등록된 도서가 없습니다.</p>
                            <p className="text-[15px] text-slate-400">곧 소개될 도서를 기대해 주세요.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 추천 도서 */}
                        {featured.length > 0 && (
                            <section>
                                <SectionLabel color="orange" label="FEATURED BOOKS" sub="편집부 추천 도서" />
                                {/* 추천 도서는 큼직하게 2~3열 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {featured.map(book => <BookCard key={book.id} book={book} />)}
                                </div>
                            </section>
                        )}

                        {/* 전체 도서 */}
                        {rest.length > 0 && (
                            <section>
                                <SectionLabel color="green" label="ALL BOOKS" sub="전체 출간 도서" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {rest.map(book => <BookCard key={book.id} book={book} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function SectionLabel({ color, label, sub }: { color: 'orange' | 'green'; label: string; sub: string }) {
    return (
        <div className="flex items-center gap-5 mb-12">
            <div className={`h-8 w-1 rounded-full ${color === 'orange' ? 'bg-[#f68d2e]' : 'bg-emerald-500'}`} />
            <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color === 'orange' ? 'text-[#f68d2e]' : 'text-emerald-500'}`}>{label}</p>
                <p className="text-[22px] font-black text-slate-900 tracking-tight">{sub}</p>
            </div>
        </div>
    )
}
