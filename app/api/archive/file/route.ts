import { NextRequest, NextResponse } from 'next/server'
import { createCookieAuthClient, createServiceClient } from '@/features/auth/lib/server'

const ARCHIVE_OBJECT_PATH = /^\/storage\/v1\/object\/(?:public|authenticated|sign)\/archives\/(.+)$/

function getArchiveObjectPath(source: string): string | null {
  try {
    const url = new URL(source)
    const projectHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname
    const match = url.pathname.match(ARCHIVE_OBJECT_PATH)
    if (url.hostname !== projectHost || !match) {
      return null
    }

    const path = decodeURIComponent(match[1])
    if (!path || path.startsWith('/') || path.split('/').includes('..')) return null
    return path
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const auth = await createCookieAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return new NextResponse('Authentication required.', { status: 401 })

  const archiveId = request.nextUrl.searchParams.get('id')
  if (!archiveId) return new NextResponse('Invalid archive file.', { status: 400 })

  // Confirm that this member can read the archive record before the service
  // client retrieves its private object. The authenticated client enforces the
  // archive table's min_role RLS policy.
  const { data: archive, error: archiveError } = await auth
    .from('archive')
    .select('pdf_url')
    .eq('id', archiveId)
    .maybeSingle()
  const objectPath = archive?.pdf_url ? getArchiveObjectPath(archive.pdf_url) : null
  if (archiveError || !objectPath) return new NextResponse('Archive file not found.', { status: 404 })

  const admin = createServiceClient()
  const { data, error } = await admin.storage.from('archives').download(objectPath)
  if (error || !data) return new NextResponse('Archive file not found.', { status: 404 })

  return new NextResponse(data.stream(), {
    headers: {
      'Content-Type': data.type || 'application/pdf',
      'Content-Length': String(data.size),
      'Content-Disposition': `inline; filename="${encodeURIComponent(objectPath.split('/').pop() || 'archive.pdf')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
