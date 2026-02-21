'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ArchivePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('archive')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setPosts(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 py-20 px-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#f68d2e]"></div>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 자료실</h1>
            <p className="mt-3 text-sm font-bold text-emerald-600 uppercase tracking-[0.3em]">Total Archives ({posts.length})</p>
            <div className="mt-6 flex justify-center">
               <Link href="/" className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">← 메인으로 돌아가기</Link>
            </div>
          </div>

          {/* 목록 밀도 대폭 상향: gap-2 적용 */}
          <div className="flex flex-col gap-2">
            <div className="flex px-8 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/50 mb-2">
              <div className="w-32">Category</div>
              <div className="flex-1">Title</div>
              <div className="w-32 text-right">Date</div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 font-medium">자료를 불러오는 중입니다...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Link 
                  href={`/archive/${post.id}`} 
                  key={post.id} 
                  className="group relative bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between hover:bg-white hover:shadow-[0_10px_25px_rgba(16,185,129,0.08)] hover:-translate-y-0.5 transition-all duration-200 border border-transparent hover:border-emerald-100/50"
                >
                  <div className="flex items-center gap-8 w-full">
                    <span className="w-24 px-3 py-1 rounded-full bg-emerald-100/40 text-emerald-700 font-black text-[10px] uppercase tracking-widest text-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      {post.category}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-700 text-lg group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 font-medium">등록된 자료가 없습니다.</div>
            )}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global GIFT</p>
          </div>
        </div>
      </div>
    </div>
  )
}
