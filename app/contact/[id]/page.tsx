'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Inquiry = {
  id: string
  title: string
  content: string
  password: string | null
  user_id: string
  user_email: string
  answer: string | null
  answered_at: string | null
  created_at: string
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, role, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  // 관리자 답변 상태
  const [answerText, setAnswerText] = useState('')
  const [answerSubmitting, setAnswerSubmitting] = useState(false)

  // 삭제 상태
  const [deleting, setDeleting] = useState(false)

  const isAdmin = role?.toUpperCase() === 'ADMIN'

  useEffect(() => {
    if (isAuthLoading) return

    async function fetchInquiry() {
      const { data } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single()

      if (!data) {
        router.push('/contact')
        return
      }

      // 비밀글 접근 체크
      if (data.password) {
        const canAccess = isAdmin || user?.id === data.user_id
        if (!canAccess) {
          setDenied(true)
          setLoading(false)
          return
        }
      }

      setInquiry(data)
      if (data.answer) setAnswerText(data.answer)
      setLoading(false)
    }

    fetchInquiry()
  }, [id, user, isAdmin, isAuthLoading, router])

  const handleAnswer = async () => {
    if (!answerText.trim()) return
    setAnswerSubmitting(true)

    // 관리자 답변은 service role이 필요하므로 서버 액션 사용
    const res = await fetch('/api/inquiry/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId: id, answer: answerText.trim() }),
    })

    if (res.ok) {
      const updated = await res.json()
      setInquiry((prev) => prev ? { ...prev, answer: updated.answer, answered_at: updated.answered_at } : prev)
    }
    setAnswerSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(true)

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id)

    if (!error) {
      router.push('/contact')
    } else {
      alert('삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-[#6e6e73] text-sm font-medium">불러오는 중...</div>
      </div>
    )
  }

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-2">비밀글입니다</h2>
          <p className="text-[14px] text-[#6e6e73] mb-6">작성자와 관리자만 열람할 수 있습니다.</p>
          <Link
            href="/contact"
            className="inline-flex px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-colors"
            style={{ background: "#059669" }}
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!inquiry) return null

  const isOwner = user?.id === inquiry.user_id

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-20 px-4">
      <div className="max-w-[700px] mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/contact"
            className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-[14px] text-[#6e6e73]">문의 상세</span>
        </div>

        {/* 본문 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8">
            {/* 뱃지 */}
            <div className="flex items-center gap-2 mb-4">
              {inquiry.password && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  비밀글
                </span>
              )}
              {inquiry.answer ? (
                <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                  답변완료
                </span>
              ) : (
                <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">
                  대기중
                </span>
              )}
            </div>

            <h1 className="text-[22px] font-bold text-[#1d1d1f] mb-3">
              {inquiry.title}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[13px] text-[#6e6e73]">{inquiry.user_email}</span>
              <span className="text-[13px] text-slate-300">·</span>
              <span className="text-[13px] text-[#6e6e73]">
                {new Date(inquiry.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>
          </div>

          {/* 관리자 답변 영역 */}
          {inquiry.answer && (
            <div className="border-t border-slate-100 bg-emerald-50/50 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[12px] font-bold">
                  관리자 답변
                </span>
                {inquiry.answered_at && (
                  <span className="text-[12px] text-emerald-600/60">
                    {new Date(inquiry.answered_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                {inquiry.answer}
              </p>
            </div>
          )}
        </div>

        {/* 관리자 답변 작성 폼 */}
        {isAdmin && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
              {inquiry.answer ? '답변 수정' : '답변 작성'}
            </h3>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="답변을 입력하세요"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none mb-4"
            />
            <button
              type="button"
              onClick={handleAnswer}
              disabled={answerSubmitting || !answerText.trim()}
              className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: "#059669" }}
            >
              {answerSubmitting ? '등록 중...' : inquiry.answer ? '답변 수정' : '답변 등록'}
            </button>
          </div>
        )}

        {/* 하단 액션 */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/contact"
            className="flex-1 py-3.5 text-center rounded-xl bg-white border border-slate-200 text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            목록으로
          </Link>
          {(isOwner || isAdmin) && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3.5 rounded-xl text-[14px] font-medium text-red-500 bg-white border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
