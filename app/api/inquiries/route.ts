import { NextResponse } from 'next/server'
import { createServiceClient, getCurrentUserAndRole } from '@/features/auth/lib/server'

type InquiryRow = {
  id: string
  title: string
  password: string | null
  user_id: string
  user_email: string
  answer: string | null
  created_at: string
}

export async function GET() {
  const { user, role } = await getCurrentUserAndRole()
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('inquiries')
    .select('id, title, password, user_id, user_email, answer, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const isAdmin = role?.toLowerCase() === 'admin'
  const inquiries = ((data ?? []) as InquiryRow[]).map((item) => {
    const isPrivate = Boolean(item.password)
    const accessible = !isPrivate || isAdmin || user.id === item.user_id

    return {
      id: item.id,
      title: accessible ? item.title : '비밀글입니다.',
      is_private: isPrivate,
      accessible,
      user_id: item.user_id,
      user_email: item.user_email,
      has_answer: Boolean(item.answer),
      created_at: item.created_at,
    }
  })

  return NextResponse.json({ inquiries })
}
