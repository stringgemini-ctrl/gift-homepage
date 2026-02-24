import { createClient } from '@supabase/supabase-js'

type Book = {
    id: string
    title: string
    author: string
    description: string | null
    cover_url: string | null
    buy_link: string | null
    is_featured: boolean
    created_at: string
}

// 공개 페이지이므로 빌드 시 데이터를 가져옵니다 (ISR)
async function getBooks(): Promise<Book[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const admin = createClient(url, key, { auth: { persistSession: false } })

    const { data, error } = await admin
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[Publications] fetch error:', error.message)
        return []
    }
    return data ?? []
}

export const revalidate = 60 // 60초마다 재검증

export default async function PublicationsPage() {
    const books = await getBooks()

    return (
        <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-24 px-6">
            <div className="max-w-6xl mx-auto">

                {/* 페이지 헤더 */}
                <div className="mb-14 text-center">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-3">Publications</p>
                    <h1 className="text-[36px] font-black text-slate-900 tracking-tighter leading-tight">
                        연구소 출간 도서
                    </h1>
                    <p className="mt-4 text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
                        글로벌사중복음연구소에서 출간한 신학 연구 도서 및 시리즈를 소개합니다.
                    </p>
                    <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto" />
                </div>

                {/* 도서 그리드 */}
                {books.length === 0 ? (
                    // 빈 상태 UI
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-4xl">
                            📚
                        </div>
                        <p className="text-[17px] font-bold text-slate-500">아직 등록된 도서가 없습니다.</p>
                        <p className="text-[14px] text-slate-400">곧 소개될 도서를 기대해 주세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── 개별 도서 카드 컴포넌트 ───
function BookCard({ book }: { book: Book }) {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md shadow-slate-200/60 border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-300/50">

            {/* 표지 이미지 영역 */}
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                {book.cover_url ? (
                    <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                    />
                ) : (
                    // 표지 없을 때 플레이스홀더
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-5xl">📖</span>
                    </div>
                )}

                {/* 호버 시 나타나는 오버레이 (소개글 + 구매링크) */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
                    {book.description && (
                        <p className="text-white/90 text-[13px] font-medium leading-relaxed line-clamp-4 mb-4 drop-shadow">
                            {book.description}
                        </p>
                    )}
                    {book.buy_link && (
                        <a
                            href={book.buy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 text-[13px] font-black rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
                        >
                            구매하기 →
                        </a>
                    )}
                </div>
            </div>

            {/* 텍스트 정보 영역 */}
            <div className="px-5 py-4">
                <p className="text-[13px] font-semibold text-emerald-600 mb-1">{book.author}</p>
                <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-2">{book.title}</h3>
                {book.is_featured && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#f68d2e]/10 text-[#f68d2e] text-[11px] font-black rounded-md">
                        ★ 추천 도서
                    </span>
                )}
            </div>
        </div>
    )
}
