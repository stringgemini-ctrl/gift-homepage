import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, getCurrentUserAndRole, isSameOriginRequest } from '@/features/auth/lib/server'

const inquiryIdSchema = z.string().uuid()

type InquiryDetailRow = {
  id: string
  title: string
  content: string
  password: string | null
  user_id: string
  user_email: string
  answer: string | null
  answered_at: string | null
  created_at: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, role } = await getCurrentUserAndRole()
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const { id } = await params
  if (!inquiryIdSchema.safeParse(id).success) {
    return NextResponse.json({ error: '문의글을 찾을 수 없습니다.' }, { status: 404 })
  }
  const admin = createServiceClient()
  const { data, error } = await admin
    .from('inquiries')
    .select('id, title, content, password, user_id, user_email, answer, answered_at, created_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '문의글을 찾을 수 없습니다.' }, { status: 404 })
  }

  const inquiry = data as InquiryDetailRow
  const isPrivate = Boolean(inquiry.password)
  const isAdmin = role?.toLowerCase() === 'admin'
  const accessible = !isPrivate || isAdmin || user.id === inquiry.user_id

  if (!accessible) {
    return NextResponse.json({ error: '비밀글입니다.', is_private: true }, { status: 403 })
  }

  return NextResponse.json({
    inquiry: {
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      is_private: isPrivate,
      user_id: inquiry.user_id,
      user_email: isAdmin || user.id === inquiry.user_id ? inquiry.user_email : '',
      answer: inquiry.answer,
      answered_at: inquiry.answered_at,
      created_at: inquiry.created_at,
    },
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 })
  }

  const { user, role } = await getCurrentUserAndRole()
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const { id } = await params
  if (!inquiryIdSchema.safeParse(id).success) {
    return NextResponse.json({ error: '문의글을 찾을 수 없습니다.' }, { status: 404 })
  }
  const admin = createServiceClient()
  const { data, error: findError } = await admin
    .from('inquiries')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (findError || !data) {
    return NextResponse.json({ error: '문의글을 찾을 수 없습니다.' }, { status: 404 })
  }

  const isAdmin = role?.toLowerCase() === 'admin'
  if (!isAdmin && data.user_id !== user.id) {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
  }

  const { error: deleteError } = await admin.from('inquiries').delete().eq('id', id)
  if (deleteError) {
    return NextResponse.json({ error: '문의글 삭제에 실패했습니다.' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
