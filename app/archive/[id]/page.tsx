'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ArchiveDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState<any>(null)
  const [prevPost, setPrevPost] = useState<any>(null)
  const [nextPost, setNextPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPostData()
  }, [id])

  const fetchPostData = async () => {
    setLoading(true)
    // 1. 현재 게시글 호출
    const { data: current } = await supabase.from('archive').select('*').eq('id', id).single()
    
    if (current) {
      setPost(current)
      
      // 2. 이전글 호출 (현재보다 과거)
      const { data: prev } = await supabase.from('archive')
        .select('id, title')
        .lt('created_at', current.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      // 3. 다음글 호출 (현재보다 미래)
      const { data: next } = await supabase.from('archive')
        .select('id, title')
        .gt('created_at', current.created_at)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      
      setPrevPost(prev)
      setNextPost(next)
    }
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">자료를 불러오는 중...</div>
  if (!post) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">자료를 찾을 수 없습니다.</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 py-24 px-6">
      <div className="mx-auto max-w-[780px]"> {/* 가독성을 위해 너비를 900px에서 780px로 축소 */}
        
        <div className="mb-10 animate-fadeInUp">
          <Link href="/archive" className="group inline-flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-all">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 연구소 자료실 목록
          </Link>
        </div>

        <article className="bg-white/90 backdrop-blur-3xl rounded-[3rem] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-white relative overflow-hidden animate-fadeInUp">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#f68d2e]"></div>

          <header className="mb-12 border-b border-slate-100 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                {post.category}
              </span>
              <span className="text-sm font-bold text-slate-400">
                {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter mb-4">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-lg font-bold text-emerald-600/70 leading-relaxed italic">
                {post.subtitle}
              </p>
            )}
          </header>

          {/* 본문 텍스트: 행간 및 자간 최적화 */}
          <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-[1.85] font-medium mb-20 tracking-tight">
            {post.content ? (
              post.content.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-8">{line}</p>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold italic">
                본문 내용을 준비 중입니다.
              </div>
            )}
          </div>

          {/* 이전글 / 다음글 네비게이션 추가 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-slate-100">
            <div className="flex flex-col gap-2 text-left">
              {prevPost ? (
                <Link href={`/archive/${prevPost.id}`} className="group p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous</span>
                  <p className="font-bold text-slate-700 group-hover:text-emerald-700 truncate mt-1">
                    {prevPost.title}
                  </p>
                </Link>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 opacity-40 grayscale border border-transparent cursor-not-allowed">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Previous</span>
                  <p className="font-bold text-slate-400 mt-1">이전 글이 없습니다</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 text-right">
              {nextPost ? (
                <Link href={`/archive/${nextPost.id}`} className="group p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next</span>
                  <p className="font-bold text-slate-700 group-hover:text-emerald-700 truncate mt-1">
                    {nextPost.title}
                  </p>
                </Link>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 opacity-40 grayscale border border-transparent cursor-not-allowed">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Next</span>
                  <p className="font-bold text-slate-400 mt-1">다음 글이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <footer className="pt-16 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">
              Global Institute for the Fourfold-gospel Theology
            </p>
          </footer >
        </article>

        <div className="mt-12 text-center text-slate-400 text-xs font-medium opacity-60">
          © 2026 글로벌사중복음연구소(GIFT). All rights reserved.
        </div>
      </div>
    </div>
  )
}
