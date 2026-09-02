'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

type InquirySummary = {
  id: string
  title: string
  is_private: boolean
  accessible: boolean
  user_email: string
  has_answer: boolean
  created_at: string
}

type StatusFilter = 'all' | 'pending' | 'answered' | 'private'

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'pending', label: '답변 대기' },
  { id: 'answered', label: '답변 완료' },
  { id: 'private', label: '비밀 문의' },
]

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<InquirySummary[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/inquiries', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '문의 목록을 불러오지 못했습니다.')
      setInquiries(result.inquiries ?? [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '문의 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchInquiries()
  }, [fetchInquiries])

  const filteredInquiries = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return inquiries.filter((inquiry) => {
      const matchesFilter = filter === 'all'
        || (filter === 'pending' && !inquiry.has_answer)
        || (filter === 'answered' && inquiry.has_answer)
        || (filter === 'private' && inquiry.is_private)
      const matchesSearch = !keyword
        || inquiry.title.toLowerCase().includes(keyword)
        || inquiry.user_email.toLowerCase().includes(keyword)
      return matchesFilter && matchesSearch
    })
  }, [filter, inquiries, search])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-emerald-500">Inquiry Management</p>
          <h2 className="text-2xl font-black text-slate-900">문의 관리</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            전체 {inquiries.length}건 중 답변 대기 {inquiries.filter((item) => !item.has_answer).length}건입니다.
          </p>
        </div>

        <div className="flex w-full gap-2 xl:w-auto">
          <label className="flex-1 xl:w-64">
            <span className="sr-only">문의 검색</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="제목 또는 이메일 검색"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="button"
            onClick={fetchInquiries}
            title="문의 목록 새로고침"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9M20 20v-5h-.581m0 0A8 8 0 014.582 13" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4 flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold ${filter === item.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg shadow-slate-200/40">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-sm font-bold text-slate-400">문의 목록을 불러오는 중...</div>
        ) : error ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm font-bold text-red-500">{error}</p>
            <button type="button" onClick={fetchInquiries} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">다시 시도</button>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm font-medium text-slate-400">조건에 맞는 문의가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredInquiries.map((inquiry) => (
              <li key={inquiry.id}>
                <Link href={`/contact/${inquiry.id}`} className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${inquiry.has_answer ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {inquiry.has_answer ? '답변 완료' : '답변 대기'}
                      </span>
                      {inquiry.is_private && <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">비밀 문의</span>}
                    </div>
                    <p className="truncate text-sm font-bold text-slate-800">{inquiry.title}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{inquiry.user_email || '이메일 없음'}</p>
                  </div>
                  <time className="shrink-0 text-xs font-medium text-slate-400" dateTime={inquiry.created_at}>
                    {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
