import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, getCurrentUserAndRole, isSameOriginRequest } from '@/features/auth/lib/server'

const inquirySchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(20_000),
  isPrivate: z.boolean(),
}).strict()

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
      user_email: isAdmin || user.id === item.user_id ? item.user_email : '',
      has_answer: Boolean(item.answer),
      created_at: item.created_at,
    }
  })

  return NextResponse.json({ inquiries })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 })
  }

  const { user } = await getCurrentUserAndRole()
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  let parsed: z.infer<typeof inquirySchema>
  try {
    parsed = inquirySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: '문의 내용을 확인해 주세요.' }, { status: 400 })
  }

  const admin = createServiceClient()
  const { error } = await admin.from('inquiries').insert([{
    title: parsed.title,
    content: parsed.content,
    password: parsed.isPrivate ? 'private' : null,
    user_id: user.id,
    user_email: user.email ?? '',
  }])

  if (error) {
    return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
