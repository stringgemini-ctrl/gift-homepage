'use client'

import { supabase } from '@/features/database/lib/supabase'

export type ManagedBucket = 'archives' | 'activity-images' | 'book-covers' | 'journals'

type UploadTicket = {
  bucket: ManagedBucket
  path: string
  token: string
  error?: string
}

export async function uploadAdminFile(bucket: ManagedBucket, file: File): Promise<string> {
  const response = await fetch('/api/admin/storage/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, contentType: file.type, size: file.size }),
  })

  const ticket = await response.json() as UploadTicket
  if (!response.ok) throw new Error(ticket.error || '업로드 준비에 실패했습니다.')

  const { error } = await supabase.storage
    .from(ticket.bucket)
    .uploadToSignedUrl(ticket.path, ticket.token, file, {
      contentType: file.type,
      cacheControl: '3600',
    })
  if (error) throw error

  return supabase.storage.from(ticket.bucket).getPublicUrl(ticket.path).data.publicUrl
}
