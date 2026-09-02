import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, isSameOriginRequest, requireAdmin } from '@/features/auth/lib/server'

const answerSchema = z.object({
  inquiryId: z.string().uuid(),
  answer: z.string().trim().min(1).max(20_000),
}).strict()

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 })
  }

  let inquiryId: string
  let answer: string
  try {
    ({ inquiryId, answer } = answerSchema.parse(await request.json()))
  } catch {
    return NextResponse.json({ error: '답변 내용을 확인해 주세요.' }, { status: 400 })
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
