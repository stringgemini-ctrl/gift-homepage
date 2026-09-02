'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getArchiveById, updateArchive } from '@/app/admin/actions'

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await getArchiveById(id)
      if (data) {
        setTitle(data.title)
        setContent(data.content ?? '')
      }
      setLoading(false)
    }
    fetchPost()
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await updateArchive(id, { title, content })
    if (error) alert('수정 실패: ' + error)
    else {
      alert('수정 완료!')
      router.push(`/archive/${id}`)
    }
  }

  if (loading) return <div className="p-10 text-center">데이터 확인 중...</div>

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <form onSubmit={handleUpdate} className="mx-auto max-w-2xl bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">연구 기록 수정</h1>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="h-64 w-full mb-6 p-3 border rounded-lg" required />
        <button type="submit" className="w-full bg-[#0098a6] text-white py-3 font-bold rounded-lg">수정 내용 저장</button>
      </form>
    </div>
  )
}
