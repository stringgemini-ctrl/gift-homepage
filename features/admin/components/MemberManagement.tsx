'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useRouter } from 'next/navigation'

type Profile = {
    id: string
    email: string | null
    role: string
    created_at: string
}

export default function MemberManagement() {
    const { user, role, isLoading: isAuthLoading } = useAuth()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isAuthLoading) return
        if (!user || role?.toUpperCase() !== 'ADMIN') {
            router.replace('/unauthorized')
            return
        }

        async function fetchProfiles() {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, role, created_at')
                .order('created_at', { ascending: false })

            if (error) console.error('Error fetching profiles:', error)
            else if (data) setProfiles(data)
            setLoading(false)
        }
        fetchProfiles()
    }, [user, role, isAuthLoading, router])

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`이 사용자의 권한을 '${newRole}'(으)로 변경하시겠습니까?`)) return
        setIsUpdating(userId)
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
        if (error) {
            alert(`오류 발생: ${error.message}`)
        } else {
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p))
            alert('권한이 변경되었습니다. 사용자는 재로그인 후 적용됩니다.')
        }
        setIsUpdating(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">불러오는 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Member Management</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">전체 회원 관리</h2>
                <p className="mt-1.5 text-sm text-slate-500">
                    총 <span className="text-[#f68d2e] font-black">{profiles.length}</span>명의 회원 권한을 관리합니다.
                </p>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-[#f68d2e]" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">회원</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">가입일</th>
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
                                    <td className="px-6 py-4 text-slate-400 font-medium">
                                        {new Date(p.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                                        <select
                                            value={p.role?.toUpperCase()}
                                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                            disabled={isUpdating === p.id}
                                            className="bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="USER">USER (일반)</option>
                                            <option value="ADMIN">ADMIN (관리자)</option>
                                        </select>
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
