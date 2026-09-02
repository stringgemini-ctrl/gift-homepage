'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createArchive } from '@/app/admin/actions'

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('채널소식')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await createArchive({
      title,
      content,
      category,
      author: '관리자',
      published_date: null,
      abstract_text: null,
      pdf_url: null,
      original_url: null,
    })

    if (error) {
      alert('저장 실패: ' + error)
      setIsSubmitting(false)
    } else {
      alert('저장 완료!')
      router.push('/archive')
      router.refresh()
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#0098a6] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
