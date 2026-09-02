'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ContactWritePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해 주세요.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isPrivate }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error ?? '문의 등록에 실패했습니다.')
        return
      }

      router.push('/contact')
      router.refresh()
    } catch {
      setError('네트워크 연결을 확인한 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-20 px-4">
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/contact"
            className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
            문의 작성
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-5">
            {/* 제목 */}
            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                maxLength={100}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문의 내용을 자세히 작성해 주세요"
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              />
            </div>

            {/* 비밀글 설정 */}
            <div className="border-t border-slate-100 pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <div>
                  <span className="text-[14px] font-medium text-[#1d1d1f]">비밀글로 설정</span>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    비밀글은 본인과 관리자만 열람할 수 있습니다.
                  </p>
                </div>
              </label>

            </div>

            {error && (
              <p className="text-[14px] font-medium text-red-500">{error}</p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 mt-6">
            <Link
              href="/contact"
              className="flex-1 py-3.5 text-center rounded-xl bg-white border border-slate-200 text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: "#059669" }}
            >
              {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
