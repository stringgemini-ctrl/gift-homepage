import Link from 'next/link'

type Post = {
    id: string
    title: string
    category: string
    created_at: string
}

interface Props {
    posts: Post[]
}

export default function ResourceSection({ posts }: Props) {
    return (
        <section className="bg-slate-50 pb-32 pt-16 px-10 w-full text-left relative overflow-hidden">
            <div className="mx-auto max-w-[1200px] relative z-10">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)]">
                    <h2 className="text-4xl font-black text-slate-900 text-center mb-16 tracking-tighter drop-shadow-sm">연구소 자료실</h2>
                    <div className="flex flex-col gap-3">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Link href={`/archive/${post.id}`} key={post.id} className="group bg-slate-50/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-100/50 hover:bg-white hover:border-emerald-100 hover:shadow-[0_8px_20px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-300">
                                    <span className="w-24 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full text-center uppercase tracking-widest border border-emerald-100 group-hover:bg-emerald-100 transition-colors mb-3 md:mb-0">{post.category}</span>
                                    <h3 className="flex-1 font-bold text-slate-700 text-lg md:ml-8 truncate group-hover:text-emerald-700 transition-colors">{post.title}</h3>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 md:mt-0">{new Date(post.created_at).toLocaleDateString()}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">등록된 자료가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
