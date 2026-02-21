'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  id: string
  email: string | null
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAndFetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.replace('/')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })

      if (data) setProfiles(data)
      setLoading(false)
    }

    checkAndFetch()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-[#6e6e73] text-sm font-medium">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
              회원 관리
            </h1>
            <p className="mt-1 text-[13px] text-[#6e6e73]">
              총 {profiles.length}명
            </p>
          </div>
          <Link
            href="/admin"
            className="text-[15px] font-medium text-[#0098a6] hover:text-[#007c88] transition-colors"
          >
            ← 갤러리 관리
          </Link>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="h-1 bg-[#0098a6]" />
          {profiles.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {profiles.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-medium text-[#1d1d1f] truncate">
                      {p.email || '이메일 없음'}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                      {new Date(p.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`ml-4 shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-semibold ${
                      p.role === 'admin'
                        ? 'bg-[#0098a6]/10 text-[#0098a6]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[15px] font-medium text-[#6e6e73]">
                등록된 회원이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
