import { NextResponse } from 'next/server'
import { createServiceClient } from '@/features/auth/lib/server'

export const dynamic = 'force-dynamic'

const QUERY_TIMEOUT_MS = 7_000

type Activity = {
  id: string
  title: string | null
  image_url: string | null
  created_at: string
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Home data request timed out.')), timeoutMs)

    promise.then(
      (value) => {
        clearTimeout(timeout)
        resolve(value)
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    )
  })
}

export async function GET() {
  // Public homepage data is deliberately exposed through this narrow server API.
  // The service client keeps raw tables private when RLS is tightened.
  const supabase = createServiceClient()

  try {
    const [postsResult, activitiesResult] = await withTimeout(
      Promise.all([
        supabase
          .from('archive')
          .select('id, title, category, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('Activity')
          .select('id, title, image_url, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
      ]),
      QUERY_TIMEOUT_MS
    )

    if (postsResult.error || activitiesResult.error) {
      return NextResponse.json(
        { error: 'Home data is unavailable.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(
      {
        posts: postsResult.data ?? [],
        activities: (activitiesResult.data as Activity[] | null ?? []).map((activity) => ({
          ...activity,
          image_url: activity.image_url
            ? `/api/home/image?src=${encodeURIComponent(activity.image_url)}`
            : null,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json(
      { error: 'Home data is unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
