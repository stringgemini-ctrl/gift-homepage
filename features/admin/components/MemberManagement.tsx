'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { getAllProfiles, updateUserRole, type Profile } from '@/app/admin/actions'

export default function MemberManagement() {
    const { user, role, isLoading: isAuthLoading } = useAuth()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const router = useRouter()

    const fetchData = useCallback(async () => {
        setLoading(true)
        setFetchError(null)
        // 서버 액션을 통해 RLS를 우회하여 전체 회원 목록을 가져옵니다.
        const { data, error } = await getAllProfiles()
        if (error) {
            setFetchError(error)
        } else if (data) {
            setProfiles(data)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        if (isAuthLoading) return            // 아직 인증 로딩 중 → 아무것도 하지 않음

        /*
          role이 null/undefined인 채로 이 블록에 도달하면 잘못된 리다이렉트 발생.
          → isAuthLoading이 false이고 user가 없거나 role이 'ADMIN'이 아닐 때만 리다이렉트.
          데이터 fetch 에러(500)는 아래 fetchError state로만 처리 (signOut 트리거 없음).
        */
        if (!user) {
            router.replace('/unauthorized')
            return
        }
        if (role && role.toUpperCase() !== 'ADMIN') {
            router.replace('/unauthorized')
            return
        }
        // role이 확정된 후에만 데이터 로드
        if (role?.toUpperCase() === 'ADMIN') {
            fetchData()
        }
    }, [user, role, isAuthLoading, router, fetchData])

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`이 사용자의 권한을 '${newRole}'(으)로 변경하시겠습니까?`)) return
        setIsUpdating(userId)

        // 권한 변경도 서버 액션으로 처리합니다.
        const { error } = await updateUserRole(userId, newRole)

        if (error) {
            alert(`오류 발생: ${error}`)
        } else {
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p))
            alert('권한이 변경되었습니다.\n사용자는 재로그인 후 새 권한이 적용됩니다.')
        }
        setIsUpdating(null)
    }

    if (isAuthLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-sm font-bold text-red-400">{fetchError}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    다시 시도
                </button>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Member Management</p>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">전체 회원 관리</h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        총 <span className="text-[#f68d2e] font-black">{profiles.length}</span>명의 회원 권한을 관리합니다.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    새로고침
                </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-[#f68d2e]" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">회원</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">권한</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">변경</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {profiles.length > 0 ? profiles.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0">
                                                {p.email ? p.email[0].toUpperCase() : '?'}
                                            </div>
                                            <span className="font-semibold text-slate-700">{p.email || '이메일 없음'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.role?.toUpperCase() === 'ADMIN'
                                            ? 'bg-[#f68d2e]/10 text-[#f68d2e] ring-1 ring-[#f68d2e]/20'
                                            : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                            }`}>
                                            {p.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isUpdating === p.id ? (
                                            <div className="inline-block w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin ml-auto" />
                                        ) : (
                                            <select
                                                value={p.role?.toUpperCase()}
                                                onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                                className="bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                                            >
                                                <option value="USER">USER (일반)</option>
                                                <option value="ADMIN">ADMIN (관리자)</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-medium">
                                        등록된 회원이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
