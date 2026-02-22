'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  id: string
  email: string | null
  role: string
}

type ArchivePost = {
  id: string
  title: string
  category: string
  created_at: string
}

export default function MyPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myPosts, setMyPosts] = useState<ArchivePost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'posts'>('profile')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', currentUser.id)
        .single()

      if (profileData) setProfile(profileData)

      const { data: posts } = await supabase
        .from('archive')
        .select('id, title, category, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (posts) setMyPosts(posts)
      setLoading(false)
    }

    fetchUserData()
  }, [router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
      return
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message })
      return
    }
    setPasswordMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
    setNewPassword('')
    setConfirmPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-[#6e6e73] text-sm font-medium">불러오는 중...</div>
      </div>
    )
  }

  const roleBadge =
    profile?.role === 'admin' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0098a6]/10 text-[#0098a6] text-[13px] font-semibold">
        👑 최고 관리자
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[13px] font-semibold">
        👤 일반 회원
      </span>
    )

  const tabs = [
    { id: 'profile' as const, label: '내 정보' },
    { id: 'password' as const, label: '비밀번호 변경' },
    { id: 'posts' as const, label: '내 게시글' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-28 pb-20 px-4">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-8">
          마이페이지
        </h1>

        {/* 탭 메뉴 */}
        <div className="flex gap-1 p-1 bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl text-[15px] font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-[#0098a6] text-white'
                  : 'text-slate-500 hover:text-[#1d1d1f]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭: 내 정보 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="h-1 w-12 rounded-full bg-[#0098a6] mb-6" />
              <p className="text-[12px] font-medium text-[#6e6e73] uppercase tracking-wider mb-2">
                계정
              </p>
              <p className="text-[17px] font-medium text-[#1d1d1f] mb-6">
                {user?.email}
              </p>
              <p className="text-[12px] font-medium text-[#6e6e73] uppercase tracking-wider mb-2">
                등급
              </p>
              <div>{roleBadge}</div>
            </div>
          </div>
        )}

        {/* 탭: 비밀번호 변경 */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="h-1 w-12 rounded-full bg-[#0098a6] mb-6" />
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">
              비밀번호 변경
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0098a6]/30 focus:border-[#0098a6]"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="다시 입력"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0098a6]/30 focus:border-[#0098a6]"
                  autoComplete="new-password"
                />
              </div>
              {passwordMessage && (
                <p
                  className={`text-[14px] font-medium ${passwordMessage.type === 'success' ? 'text-[#0098a6]' : 'text-red-500'
                    }`}
                >
                  {passwordMessage.text}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3.5 rounded-xl bg-[#0098a6] text-white text-[15px] font-semibold hover:bg-[#007c88] transition-colors disabled:opacity-50"
              >
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          </div>
        )}

        {/* 탭: 내 게시글 */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="h-1 w-12 rounded-full bg-[#0098a6] ml-8 mt-6 mb-4" />
            <div className="px-8 pb-8">
              {myPosts.length > 0 ? (
                <ul className="space-y-2">
                  {myPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/archive/${post.id}`}
                        className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#0098a6]/10 text-[#0098a6] text-[11px] font-semibold mr-2">
                            {post.category}
                          </span>
                          <p className="text-[15px] font-medium text-[#1d1d1f] truncate group-hover:text-[#0098a6]">
                            {post.title}
                          </p>
                          <p className="text-[13px] text-[#6e6e73] mt-0.5">
                            {new Date(post.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className="text-slate-300 group-hover:text-[#0098a6] ml-2">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                    📝
                  </div>
                  <p className="text-[15px] font-medium text-[#6e6e73] mb-1">
                    아직 작성한 게시글이 없습니다.
                  </p>
                  <p className="text-[13px] text-slate-400 mb-6">
                    자료실에서 첫 글을 작성해 보세요.
                  </p>
                  <Link
                    href="/write"
                    className="inline-block px-6 py-3 rounded-xl bg-[#0098a6] text-white text-[14px] font-semibold hover:bg-[#007c88] transition-colors"
                  >
                    글쓰기
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/archive"
            className="block w-full py-4 text-center text-[17px] font-medium text-[#0098a6] bg-white rounded-2xl hover:bg-[#f5f5f7] transition-colors border border-slate-100"
          >
            자료실 보기
          </Link>
          <Link
            href="/"
            className="block w-full py-4 text-center text-[17px] font-medium text-[#1d1d1f] bg-white rounded-2xl hover:bg-[#f5f5f7] transition-colors border border-slate-100"
          >
            메인으로
          </Link>
        </div>
      </div>
    </div>
  )
}
