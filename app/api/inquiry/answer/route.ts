import { NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/features/auth/lib/server'

export async function POST(request: Request) {
  const { inquiryId, answer } = await request.json()

  if (!inquiryId || !answer) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })
  }

  let user
  try {
    user = await requireAdmin()
  } catch {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const admin = createServiceClient()

  // 답변 저장 (service role로 RLS 우회)
  const { data, error } = await admin
    .from('inquiries')
    .update({
      answer,
      answered_at: new Date().toISOString(),
      answered_by: user.id,
    })
    .eq('id', inquiryId)
    .select('answer, answered_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
