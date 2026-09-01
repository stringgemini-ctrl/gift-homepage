'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/components/AuthProvider'
import Link from 'next/link'

type Inquiry = {
  id: string
  title: string
  is_private: boolean
  accessible: boolean
  user_id: string
  user_email: string
  has_answer: boolean
  created_at: string
}

export default function ContactPage() {
  const { user, role } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = role?.toUpperCase() === 'ADMIN'

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const res = await fetch('/api/inquiries', { cache: 'no-store' })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error ?? '문의글을 불러오지 못했습니다.')
        setInquiries(payload.inquiries ?? [])
      } catch (err) {
        console.error('[Contact] unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInquiries()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-[#6e6e73] text-sm font-medium">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-20 px-4">
      <div className="max-w-[800px] mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
              문의 및 요청
            </h1>
            <p className="text-[14px] text-[#6e6e73] mt-1">
              궁금한 점이나 요청사항을 남겨주세요.
            </p>
          </div>
          <Link
            href="/contact/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-colors"
            style={{ background: "#059669" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            글쓰기
          </Link>
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {inquiries.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                💬
              </div>
              <p className="text-[15px] font-medium text-[#6e6e73]">
                아직 문의글이 없습니다.
              </p>
              <p className="text-[13px] text-slate-400 mt-1">
                첫 번째 문의를 작성해 보세요.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {inquiries.map((inquiry) => {
                const isPrivate = inquiry.is_private
                const accessible = inquiry.accessible || isAdmin || user?.id === inquiry.user_id

                return (
                  <li key={inquiry.id}>
                    {accessible ? (
                      <Link
                        href={`/contact/${inquiry.id}`}
                        className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isPrivate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                비밀글
                              </span>
                            )}
                            {inquiry.has_answer && (
                              <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                                답변완료
                              </span>
                            )}
                            {!inquiry.has_answer && (
                              <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">
                                대기중
                              </span>
                            )}
                          </div>
                          <p className="text-[15px] font-medium text-[#1d1d1f] truncate group-hover:text-emerald-600">
                            {inquiry.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[13px] text-[#6e6e73]">{inquiry.user_email}</span>
                            <span className="text-[13px] text-slate-300">·</span>
                            <span className="text-[13px] text-[#6e6e73]">
                              {new Date(inquiry.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-300 group-hover:text-emerald-600 ml-4">→</span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between px-6 py-5 opacity-60">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              비밀글
                            </span>
                          </div>
                          <p className="text-[15px] font-medium text-slate-400">
                            {inquiry.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[13px] text-slate-400">{inquiry.user_email}</span>
                            <span className="text-[13px] text-slate-300">·</span>
                            <span className="text-[13px] text-slate-400">
                              {new Date(inquiry.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
