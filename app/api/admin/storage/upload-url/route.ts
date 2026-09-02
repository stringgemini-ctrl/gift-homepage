import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient, isSameOriginRequest, requireAdmin } from '@/features/auth/lib/server'

const uploadRequestSchema = z.object({
  bucket: z.enum(['archives', 'activity-images', 'book-covers', 'journals']),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
})

const uploadRules = {
  archives: { types: ['application/pdf'], maxSize: 50 * 1024 * 1024 },
  journals: { types: ['application/pdf'], maxSize: 50 * 1024 * 1024 },
  'activity-images': { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 10 * 1024 * 1024 },
  'book-covers': { types: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 10 * 1024 * 1024 },
} as const

const extensions: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 })
  }

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '업로드 정보가 올바르지 않습니다.' }, { status: 400 })
  }

  const { bucket, contentType, size } = parsed.data
  const rule = uploadRules[bucket]
  if (!(rule.types as readonly string[]).includes(contentType) || size > rule.maxSize) {
    return NextResponse.json({ error: '허용되지 않은 파일 형식 또는 크기입니다.' }, { status: 400 })
  }

  const path = `${crypto.randomUUID()}.${extensions[contentType]}`
  const admin = createServiceClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path)

  if (error || !data?.token) {
    console.error('[admin/storage/upload-url] Failed to create upload URL:', error)
    return NextResponse.json({ error: '업로드 준비에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ bucket, path, token: data.token })
}
