import { createClient } from '@supabase/supabase-js'

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
        <div className="min-h-screen bg-white pt-28 pb-32">
            {/* 페이지 헤더 */}
            <div className="max-w-6xl mx-auto px-6 mb-20 text-center">
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Publications</p>
                <h1 className="text-[42px] md:text-[52px] font-black text-slate-900 tracking-tighter leading-[1.1] mb-5">
                    연구소 출간 도서
                </h1>
                <p className="text-[17px] text-slate-500 max-w-lg mx-auto leading-relaxed">
                    글로벌사중복음연구소에서 펴낸<br className="hidden md:block" />신학 연구 도서 시리즈를 소개합니다.
                </p>
            </div>

            {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-5xl shadow-inner">📚</div>
                    <div className="text-center">
                        <p className="text-[18px] font-bold text-slate-500 mb-1">아직 등록된 도서가 없습니다.</p>
                        <p className="text-[14px] text-slate-400">곧 소개될 도서를 기대해 주세요.</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto px-6 space-y-24">
                    {/* 추천 도서 섹션 */}
                    {featured.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="h-5 w-1 rounded-full bg-[#f68d2e]" />
                                <h2 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">추천 도서</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featured.map(book => <BookCard key={book.id} book={book} />)}
                            </div>
                        </section>
                    )}

                    {/* 전체 도서 섹션 */}
                    {rest.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="h-5 w-1 rounded-full bg-emerald-500" />
                                <h2 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">전체 도서</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                                {rest.map(book => <BookCard key={book.id} book={book} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}

function BookCard({ book }: { book: Book }) {
    return (
        <article className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
            {/* 표지 */}
            <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                {book.cover_url ? (
                    <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">📖</div>
                )}

                {/* 구매 버튼 오버레이 */}
                {book.buy_link && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                        {book.description && (
                            <p className="text-white/80 text-[12px] leading-relaxed line-clamp-3 mb-3">
                                {book.description}
                            </p>
                        )}
                        <a
                            href={book.buy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white text-slate-900 text-[13px] font-black rounded-xl shadow hover:bg-emerald-50 transition-colors"
                        >
                            구매하기 →
                        </a>
                    </div>
                )}

                {/* 추천 뱃지 */}
                {book.is_featured && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#f68d2e] text-white text-[10px] font-black rounded-lg shadow">
                        ★ 추천
                    </div>
                )}
            </div>

            {/* 텍스트 정보 */}
            <div className="px-5 py-4 flex-1 flex flex-col">
                {book.series && (
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1">{book.series}</p>
                )}
                <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-2 mb-2">{book.title}</h3>
                <p className="text-[13px] text-slate-400 mt-auto">
                    {book.author}
                    {book.translator && <span className="text-slate-300"> · 역 {book.translator}</span>}
                </p>
                {(book.publisher || book.published_year) && (
                    <p className="text-[11px] text-slate-300 mt-1">
                        {[book.publisher, book.published_year].filter(Boolean).join(' · ')}
                    </p>
                )}
            </div>
        </article>
    )
}
