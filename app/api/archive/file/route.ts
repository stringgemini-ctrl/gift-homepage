import { NextRequest, NextResponse } from 'next/server'
import { createCookieAuthClient, createServiceClient } from '@/features/auth/lib/server'

const ARCHIVE_PUBLIC_PREFIX = '/storage/v1/object/public/archives/'

function getArchiveObjectPath(source: string): string | null {
  try {
    const url = new URL(source)
    const projectHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname
    if (url.hostname !== projectHost || !url.pathname.startsWith(ARCHIVE_PUBLIC_PREFIX)) {
      return null
    }

    const encodedPath = url.pathname.slice(ARCHIVE_PUBLIC_PREFIX.length)
    const path = decodeURIComponent(encodedPath)
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

  const source = request.nextUrl.searchParams.get('src')
  const objectPath = source ? getArchiveObjectPath(source) : null
  if (!objectPath) return new NextResponse('Invalid archive file.', { status: 400 })

  // Confirm that this member can read the archive record before the service
  // client retrieves its private object. The authenticated client enforces the
  // archive table's min_role RLS policy.
  const { data: archive, error: archiveError } = await auth
    .from('archive')
    .select('id')
    .eq('pdf_url', source)
    .maybeSingle()
  if (archiveError || !archive) return new NextResponse('Archive file not found.', { status: 404 })

  const admin = createServiceClient()
  const { data, error } = await admin.storage.from('archives').download(objectPath)
  if (error || !data) return new NextResponse('Archive file not found.', { status: 404 })

  return new NextResponse(data.stream(), {
    headers: {
      'Content-Type': data.type || 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(objectPath.split('/').pop() || 'archive.pdf')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
