import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set([
  'mxezjxusjjivtboypeun.supabase.co',
  'images.unsplash.com',
])

function isAllowedImage(url: URL) {
  if (!ALLOWED_HOSTS.has(url.hostname)) return false

  return url.hostname === 'images.unsplash.com'
    || url.pathname.startsWith('/storage/v1/object/public/activity-images/')
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('src')
  if (!source) return new NextResponse('Image source is required.', { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(source)
  } catch {
    return new NextResponse('Invalid image source.', { status: 400 })
  }

  if (!isAllowedImage(imageUrl)) {
    return new NextResponse('Image source is not allowed.', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, { next: { revalidate: 86_400 } })
    const contentType = response.headers.get('content-type')
    if (!response.ok || !contentType?.startsWith('image/')) {
      return new NextResponse('Image is unavailable.', { status: 502 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return new NextResponse('Image is unavailable.', { status: 502 })
  }
}
