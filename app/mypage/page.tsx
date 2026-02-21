'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const { count } = await supabase
        .from('archive')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      setPostCount(count ?? 0)
      setLoading(false)
    }

    fetchUserData()
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
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-10">
          마이페이지
        </h1>

        <section className="bg-white rounded-2xl p-8 mb-6">
          <p className="text-[12px] font-medium text-[#6e6e73] uppercase tracking-wider mb-2">
            계정
          </p>
          <p className="text-[17px] font-medium text-[#1d1d1f]">
            {user?.email}
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8">
          <p className="text-[12px] font-medium text-[#6e6e73] uppercase tracking-wider mb-6">
            작성한 게시글
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-[48px] font-semibold text-[#0098a6] tracking-tight">
              {postCount}
            </span>
            <span className="text-[17px] font-medium text-[#6e6e73]">건</span>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/archive"
            className="block w-full py-4 text-center text-[17px] font-medium text-[#0098a6] bg-white rounded-2xl hover:bg-[#f5f5f7] transition-colors"
          >
            자료실 보기
          </Link>
          <Link
            href="/"
            className="block w-full py-4 text-center text-[17px] font-medium text-[#1d1d1f] bg-white rounded-2xl hover:bg-[#f5f5f7] transition-colors"
          >
            메인으로
          </Link>
        </div>
      </div>
    </div>
  )
}
