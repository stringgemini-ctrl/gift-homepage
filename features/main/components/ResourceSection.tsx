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
        <section className="bg-slate-50 py-32 px-10 w-full text-left">
            <div className="mx-auto max-w-[1200px]">
                <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-white/60">
                    <h2 className="text-4xl font-black text-slate-900 text-center mb-16 tracking-tighter">연구소 자료실</h2>
                    <div className="flex flex-col gap-2">
                        {posts.map((post) => (
                            <Link href={`/archive/${post.id}`} key={post.id} className="group bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                <span className="w-24 px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-[11px] rounded-full text-center uppercase">{post.category}</span>
                                <h3 className="flex-1 font-bold text-slate-700 text-lg ml-6 truncate group-hover:text-emerald-700">{post.title}</h3>
                                <span className="text-sm text-slate-400 font-medium">{new Date(post.created_at).toLocaleDateString()}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
