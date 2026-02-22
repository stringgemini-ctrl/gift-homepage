'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('채널소식')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요한 서비스입니다.')
        router.push('/login')
      }
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('archive')
      .insert([{ title, content, category, user_id: user.id, author: '관리자' }])

    if (error) alert('저장 실패: ' + error.message)
    else {
      alert('저장 완료!')
      router.push('/archive')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">새 연구 기록</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border p-3">
            <option value="채널소식">채널소식</option>
            <option value="학술제">학술제</option>
            {/* 추가 카테고리... */}
          </select>
          <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border p-3" required />
          <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} className="h-64 w-full rounded-lg border p-3" required />
          <button type="submit" className="w-full rounded-lg bg-[#0098a6] py-3 font-bold text-white">저장하기</button>
        </form>
      </div>
    </div>
  )
}
