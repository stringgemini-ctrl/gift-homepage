'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/components/AuthProvider'

type Profile = {
  id: string
  email: string | null
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const { user, role, isLoading: isAuthLoading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isAuthLoading) return   // 인증 로딩 중 → 대기

    // user가 없으면 명확히 리다이렉트
    if (!user) { router.replace('/unauthorized'); return }

    // role이 아직 null이면 로딩 완료 대기 (race condition 방지)
    if (role === null || role === undefined) return

    // role이 확정됐고 ADMIN이 아닐 때만 리다이렉트
    if (role.toUpperCase() !== 'ADMIN') {
      router.replace('/unauthorized')
      return
    }

    // 데이터 fetch 에러는 화면에만 표시 (리다이렉트/signOut 없음)
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles:', error)
      } else if (data) {
        setProfiles(data)
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [user, role, isAuthLoading, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`이 사용자의 권한을 '${newRole}'(으)로 변경하시겠습니까?`)) return

    setIsUpdating(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert(`권한 변경 중 오류가 발생했습니다: ${error.message}`)
    } else {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === userId ? { ...profile, role: newRole } : profile
        )
      )
      // Supabase Auth metadata 연동을 위한 안내 (User metadata는 서버에서 업데이트해야 완전함)
      alert("권한이 성공적으로 변경되었습니다.\n새 권한 적용을 위해 사용자는 다시 로그인해야 할 수 있습니다.")
    }
    setIsUpdating(null)
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-bold tracking-widest text-sm uppercase">회원 정보 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* 헤더 및 컨트롤 영역 */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-emerald-500 font-black tracking-widest text-[11px] uppercase mb-1 block">Admin Dashboard</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              전체 회원 관리
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              시스템에 가입된 총 <span className="text-[#f68d2e] font-black">{profiles.length}</span>명의 회원 상태를 확인하고 권한을 부여합니다.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm group"
          >
            기본 관리자 화면
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* 데이터 테이블 영역 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-[#f68d2e]" />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100/80">
                  <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">회원 이메일</th>
                  <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">가입 일자</th>
                  <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">현재 권한</th>
                  <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">권한 변경</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {profiles.length > 0 ? (
                  profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                            {p.email ? p.email[0].toUpperCase() : '?'}
                          </div>
                          <p className="font-bold text-slate-700">{p.email || '이메일 없음'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium tracking-tight">
                        {new Date(p.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.role?.toUpperCase() === 'ADMIN'
                            ? 'bg-[#f68d2e]/10 text-[#f68d2e] ring-1 ring-[#f68d2e]/20'
                            : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10'
                            }`}
                        >
                          {p.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <select
                          value={p.role?.toUpperCase()}
                          onChange={(e) => handleRoleChange(p.id, e.target.value)}
                          disabled={isUpdating === p.id}
                          className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:w-auto ml-auto p-2 cursor-pointer outline-none transition-all hover:bg-white disabled:opacity-50"
                        >
                          <option value="USER">USER (일반 회원)</option>
                          <option value="ADMIN">ADMIN (관리자)</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium">등록된 회원 정보가 없습니다.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
